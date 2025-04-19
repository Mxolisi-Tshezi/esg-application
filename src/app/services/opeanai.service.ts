import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError, map, from, concatMap, retryWhen, delay, take, timer, mergeMap } from 'rxjs';
import { BoardMembersBreakdown } from '../models/boardcomposition.model';
import { EthicalBehaviorData } from '../models/ethicalbehavior.model';
import { SocialEthicalData } from '../models/social-ethical.model';
import { EnvironmentalEthicalData } from '../models/environmental-ethical.model';
import { environment } from '../../environments/environment';
// Import html2pdf from the library
import html2pdf from 'html2pdf.js';
// const html2pdf = require('html2pdf.js');

export interface ImageGenerationResponse {
    created: number;
    data: {
        url: string;
    }[];
}

@Injectable({
    providedIn: 'root'
})
export class OpenAIService {
    // private apiUrl = 'https://api.openai.com/v1/images/generations';
    private apiUrl = 'https://dbk9kncft6.execute-api.us-east-1.amazonaws.com/prod/generate-image';


    // Queue for handling API requests with rate limiting
    private requestQueue: {
        prompt: string;
        resolve: (url: string) => void;
        reject: (error: any) => void
    }[] = [];
    private isProcessingQueue = false;
    private rateLimitTimeout = 1000; // 1 second between requests

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${environment.openaiApiKey}`
        });
    }

    /**
     * Process the queue of image generation requests with rate limiting
     */
    private processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;
        const request = this.requestQueue.shift();

        if (!request) {
            this.isProcessingQueue = false;
            return;
        }

        console.log(`Processing image request: ${request.prompt.substring(0, 30)}...`);

        const payload = {
            model: "dall-e-3",
            prompt: request.prompt,
            // n: 1,
            size: "1024x1024"
        };

        this.http.post<ImageGenerationResponse>(
            this.apiUrl,
            payload,
            { headers: this.getHeaders() }
        ).pipe(
            retryWhen(errors =>
                errors.pipe(
                    mergeMap((error, i) => {
                        // If it's a rate limit error (429), wait and retry up to 3 times
                        if (error.status === 429 && i < 3) {
                            console.log(`Rate limit hit, retrying in ${(i + 1) * 2} seconds...`);
                            return timer((i + 1) * 2000); // Exponential backoff: 2s, 4s, 6s
                        }
                        // Otherwise rethrow the error
                        return throwError(() => error);
                    }),
                    take(3) // Maximum 3 retries
                )
            )
        ).subscribe({
            next: (response) => {
                console.log('Image API response:', response); // Debug log

                if (!response?.data?.[0]?.url) {
                    console.error('Invalid response structure:', response);
                    request.reject(new Error('Invalid response format from image generation API.'));

                    setTimeout(() => {
                        this.isProcessingQueue = false;
                        this.processQueue();
                    }, this.rateLimitTimeout * 2);
                    return;
                }

                const imageUrl = response.data[0].url;
                request.resolve(imageUrl);

                // Wait before processing the next request
                setTimeout(() => {
                    this.isProcessingQueue = false;
                    this.processQueue();
                }, this.rateLimitTimeout);
            },
            error: (error) => {
                console.error('Error generating image:', error);

                let errorMessage = 'Failed to generate image. Please try again.';
                if (error.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please try again in a few minutes.';
                } else if (error.status === 400) {
                    errorMessage = 'Invalid request. The prompt may contain prohibited content.';
                } else if (error.status >= 500) {
                    errorMessage = 'OpenAI server error. Please try again later.';
                }

                request.reject(new Error(errorMessage));

                // Wait before processing the next request to avoid cascading failures
                setTimeout(() => {
                    this.isProcessingQueue = false;
                    this.processQueue();
                }, this.rateLimitTimeout * 2); // Wait longer after an error
            }
        });

    }

    /**
     * Add a request to the queue and return an Observable that resolves
     * when the request is processed
     */
    private queueImageRequest(prompt: string): Observable<string> {
        return new Observable<string>(subscriber => {
            this.requestQueue.push({
                prompt,
                resolve: (url: string) => {
                    subscriber.next(url);
                    subscriber.complete();
                },
                reject: (error: any) => {
                    subscriber.error(error);
                }
            });

            // Start processing the queue if not already running
            if (!this.isProcessingQueue) {
                this.processQueue();
            }
        });
    }

    /**
     * Generate an image using OpenAI's API with queue and rate limiting
     */
    generateImage(prompt: string): Observable<string> {
        return this.queueImageRequest(prompt);
    }

    /**
     * Generate the ESG report cover
     */
    generateCoverPage(companyName: string, year: string): Observable<string> {
        const prompt = `Create a professional cover image for an ESG Report titled "${companyName} ESG Report ${year}". 
The image should include symbolic representations of the environment, social justice, and governance using a clean, executive design aesthetic.
Design specifications:
- Corporate-style infographic format
- Executive-friendly color palette (blues, greys, whites)
- Image resolution: 1024x1024, suitable for report inclusion`;

        return this.generateImage(prompt);
    }

    /**
     * Generate key highlights page
     */
    generateKeyHighlightsPage(
        companyName: string,
        year: string,
        governanceData: BoardMembersBreakdown,
        socialData: SocialEthicalData,
        environmentalData: EnvironmentalEthicalData
    ): Observable<string> {
        // Extract key metrics for the highlights
        const highlight1 = `Board Diversity under the Governance Pillar – Metric: Gender diversity – Data: ${governanceData.female.percent}% Female, ${governanceData.male.percent}% Male`;

        const highlight2 = `Community Investment under the Social Pillar – Metric: Total investment – Data: ${socialData.communityInvestment} ZAR (${socialData.communityInvestmentPercentage}% of profit)`;

        const highlight3 = `Environmental Strategy under the Environmental Pillar – Metric: Renewable energy usage – Data: ${environmentalData.renewableEnergyPercentage}% of total energy consumption`;

        const prompt = `Generate a professional ESG infographic visual summarizing key highlights for the ${companyName} ESG Report ${year}.
The highlights include:
${highlight1}
${highlight2}
${highlight3}

Design specifications:
- Corporate-style infographic format
- Use iconography and mini-charts (e.g., pie, bar, labels) to represent each highlight
- Modern, clean layout with sections for each ESG Pillar
- Executive-friendly color palette (blues, greys, whites)
- Image resolution: 1024x1024, suitable for report inclusion

Include a one-paragraph visual summary that:
- Briefly explains the relevance of these highlights,
- Emphasizes any standout trends or achievements,
- Frames the visual as a snapshot of the company's ESG performance.`;

        return this.generateImage(prompt);
    }

    /**
     * Generate board diversity visualization
     */
    generateBoardDiversityPage(
        companyName: string,
        year: string,
        boardData: BoardMembersBreakdown
    ): Observable<string> {
        // Create specific string for gender data
        const genderData = `${boardData.female.percent}% Female, ${boardData.male.percent}% Male`;

        // Create specific string for race data
        const raceData = `${boardData.black.percent}% Black, ${boardData.white.percent}% White, ${boardData.indian.percent}% Indian, ${boardData.asian.percent}% Asian, ${boardData.coloured.percent}% Coloured`;

        // Create specific string for age data
        const ageData = `${boardData.below30.percent}% Below 30, ${boardData.between30And50.percent}% Between 30-50, ${boardData.over50.percent}% Over 50`;

        const prompt = `Generate a comprehensive infographic for Board Diversity under the Board Composition topic of the Governance Pillar in the ${companyName} ESG Report ${year}.

The data to visualize includes:
- Total Board Members: ${boardData.totalboardmembers}
- Gender Breakdown: ${genderData}
- Race Breakdown: ${raceData}
- Age Group Breakdown: ${ageData}

Design specifications:
- Create three charts: a bar chart for gender, a pie chart for race, and a pie chart for age groups
- Corporate, professional visual style with clean layout
- Clear labels and legible text
- Executive-friendly color palette (blues, greens, greys)
- Format suitable for inclusion in a formal ESG report (1024x1024)

Include a short summary paragraph that explains key takeaways from these charts, highlights any diversity strengths or gaps, and connects the data to its importance in governance performance.`;

        return this.generateImage(prompt);
    }

    /**
     * Generate ethical behavior visualization
     */
    generateEthicalBehaviorPage(
        companyName: string,
        year: string,
        ethicsData: EthicalBehaviorData
    ): Observable<string> {
        // Create data summaries for the prompt
        const trainingData = `${ethicsData.employeeTrainingPercentage}% of employees (${ethicsData.employeesCoveredByTraining} total) receive ethics training ${ethicsData.trainingFrequency.toLowerCase()}`;

        const whistleblowerData = `Whistleblower mechanism: ${ethicsData.whistleblowerMechanismExists ? 'Yes' : 'No'}, ` +
            `Anonymous reporting: ${ethicsData.whistleblowerAnonymousReporting ? 'Yes' : 'No'}, ` +
            `Whistleblower protection policy: ${ethicsData.whistleblowerProtectionPolicy ? 'Yes' : 'No'}`;

        const incidentData = `${ethicsData.numberOfReportedIncidents} reported incidents, ${ethicsData.numberOfInvestigatedIncidents} investigated, ${ethicsData.numberOfResolvedIncidents} resolved, with an average resolution time of ${ethicsData.averageResolutionTimeInDays} days`;

        const prompt = `Generate an infographic for Ethical Behavior and Anti-Corruption under the Governance Pillar in the ${companyName} ESG Report ${year}.

The data to visualize includes:
- Code of Ethics: ${ethicsData.codeOfEthicsExists ? 'Yes' : 'No'}, Publicly available: ${ethicsData.codeOfEthicsPubliclyAvailable ? 'Yes' : 'No'}, Last updated: ${ethicsData.codeOfEthicsLastUpdated}
- Ethics Training: ${trainingData}
- Whistleblower Protection: ${whistleblowerData}
- Ethics Incidents & Management: ${incidentData}
- Ethics Governance: Ethics Officer: ${ethicsData.ethicsOfficerExists ? 'Yes' : 'No'}, Board Ethics Committee: ${ethicsData.boardEthicsCommitteeExists ? 'Yes' : 'No'}, Ethics Audit Frequency: ${ethicsData.ethicsAuditFrequency}
- Supplier Code of Conduct: ${ethicsData.supplierCodeOfConductExists ? 'Yes' : 'No'}

Design specifications:
- Create a visual dashboard with multiple sections for each category
- Use appropriate charts and icons to represent the data
- Corporate, professional visual style with clean layout
- Clear labels and legible text
- Executive-friendly color palette (blues, greens, greys)
- Format suitable for inclusion in a formal ESG report (1024x1024)

Include a short summary paragraph that explains key takeaways, highlights ethical strengths and areas for improvement, and connects the data to its importance in corporate governance.`;

        return this.generateImage(prompt);
    }

    /**
     * Generate social impact visualization
     */
    generateSocialImpactPage(
        companyName: string,
        year: string,
        socialData: SocialEthicalData
    ): Observable<string> {
        // Create data summaries for the prompt
        const laborData = `Labor Rights Policy: ${socialData.laborRightsPolicy ? 'Yes' : 'No'}, Publicly available: ${socialData.laborRightsPolicyPublic ? 'Yes' : 'No'}, Human Rights Due Diligence: ${socialData.humanRightsDueDiligence ? 'Yes' : 'No'}, Frequency: ${socialData.humanRightsDueDiligenceFrequency}`;

        const employeeData = `${socialData.collectiveBargainingPercentage}% of employees covered by collective bargaining, ${socialData.employeeGrievances} grievances filed with ${socialData.resolvedEmployeeGrievances} resolved, Formal grievance mechanism: ${socialData.grievanceMechanism ? 'Yes' : 'No'}`;

        const communityData = `Total community investment: ${socialData.communityInvestment} ZAR (${socialData.communityInvestmentPercentage}% of profit), ${socialData.communityInitiatives} community initiatives, ${socialData.volunteerHours} employee volunteer hours`;

        const prompt = `Generate an infographic for Social Impact under the Social Pillar in the ${companyName} ESG Report ${year}.

The data to visualize includes:
- Labor Practices: ${laborData}
- Employee Relations: ${employeeData}
- Community Engagement: ${communityData}

Design specifications:
- Create a visual dashboard with multiple sections for each category
- Use appropriate charts and icons to represent the data
- Corporate, professional visual style with clean layout
- Clear labels and legible text
- Executive-friendly color palette (blues, purples, greys)
- Format suitable for inclusion in a formal ESG report (1024x1024)

Include a short summary paragraph that explains key social impact initiatives, highlights strengths and areas for improvement, and discusses the company's contribution to social sustainability.`;

        return this.generateImage(prompt);
    }

    /**
     * Generate environmental impact visualization
     */
    generateEnvironmentalPage(
        companyName: string,
        year: string,
        environmentalData: EnvironmentalEthicalData
    ): Observable<string> {
        // Create data summaries for the prompt
        const policyData = `Environmental Policy: ${environmentalData.environmentalPolicy ? 'Yes' : 'No'}, Publicly available: ${environmentalData.environmentalPolicyPublic ? 'Yes' : 'No'}, Climate Change Strategy: ${environmentalData.climateChangeStrategy ? 'Yes' : 'No'}`;

        const emissionsData = `Carbon neutral target year: ${environmentalData.carbonNeutralByYear}, Emissions reduction target: ${environmentalData.emissionsReductionTarget}%, Carbon offset program: ${environmentalData.carbonOffsetProgram ? 'Yes' : 'No'}, Renewable energy: ${environmentalData.renewableEnergyPercentage}% of total energy`;

        const resourceData = `Waste reduction target: ${environmentalData.wasteReductionTarget}%, Circular economy initiatives: ${environmentalData.circularEconomyInitiatives ? 'Yes' : 'No'}, Water conservation program: ${environmentalData.waterConservationProgram ? 'Yes' : 'No'}`;

        const prompt = `Generate an infographic for Environmental Sustainability under the Environmental Pillar in the ${companyName} ESG Report ${year}.

The data to visualize includes:
- Environmental Policies: ${policyData}
- Emissions & Energy: ${emissionsData}
- Resource Management: ${resourceData}

Design specifications:
- Create a visual dashboard with multiple sections for each category
- Use appropriate charts and icons to represent the data (especially for renewable energy percentage and emissions targets)
- Corporate, professional visual style with clean layout
- Clear labels and legible text
- Executive-friendly color palette (greens, blues, greys)
- Format suitable for inclusion in a formal ESG report (1024x1024)

Include a short summary paragraph that explains key environmental initiatives, highlights strengths and areas for improvement, and connects the data to its importance in environmental sustainability.`;

        return this.generateImage(prompt);
    }

    /**
     * Generate the complete ESG report by generating all necessary images
     * and compiling them into a PDF with sequential processing to avoid rate limits
     */
    generateESGReport(
        companyName: string,
        year: string,
        governanceData: BoardMembersBreakdown,
        ethicsData: EthicalBehaviorData,
        socialData: SocialEthicalData,
        environmentalData: EnvironmentalEthicalData
    ): Observable<Blob> {
        // Update progress tracking for UI
        let progressStep = 0;
        const totalSteps = 7; // 6 image generation steps + 1 PDF compilation step
        const updateProgress = () => {
            progressStep++;
            // Return the percentage of completion (rounded to nearest integer)
            return Math.round((progressStep / totalSteps) * 100);
        };

        // Use concatMap to process image generation sequentially instead of in parallel
        return this.generateCoverPage(companyName, year).pipe(
            map(coverPage => {
                return { coverPage, progress: updateProgress() };
            }),
            concatMap(results => {
                return this.generateKeyHighlightsPage(companyName, year, governanceData, socialData, environmentalData).pipe(
                    map(keyHighlights => ({ ...results, keyHighlights, progress: updateProgress() }))
                );
            }),
            concatMap(results => {
                return this.generateBoardDiversityPage(companyName, year, governanceData).pipe(
                    map(boardDiversity => ({ ...results, boardDiversity, progress: updateProgress() }))
                );
            }),
            concatMap(results => {
                return this.generateEthicalBehaviorPage(companyName, year, ethicsData).pipe(
                    map(ethicalBehavior => ({ ...results, ethicalBehavior, progress: updateProgress() }))
                );
            }),
            concatMap(results => {
                return this.generateSocialImpactPage(companyName, year, socialData).pipe(
                    map(socialImpact => ({ ...results, socialImpact, progress: updateProgress() }))
                );
            }),
            concatMap(results => {
                return this.generateEnvironmentalPage(companyName, year, environmentalData).pipe(
                    map(environmental => ({ ...results, environmental, progress: updateProgress() }))
                );
            }),
            concatMap(results => {
                // This last step will convert the HTML to a real PDF using html2pdf.js
                return this.createPdfFromHtml(companyName, year, results).pipe(
                    map(pdfBlob => ({ ...results, pdfBlob, progress: updateProgress() }))
                );
            }),
            map(results => {
                // Return just the PDF blob which is what the client needs
                return results.pdfBlob;
            }),
            catchError(error => {
                console.error('Error generating report:', error);
                return throwError(() => new Error(error.message || 'Failed to generate ESG report. Please try again.'));
            })
        );
    }

    /**
     * Create the HTML content for the PDF report
     */
    private createReportHtml(
        companyName: string,
        year: string,
        images: {
            coverPage: string;
            keyHighlights: string;
            boardDiversity: string;
            ethicalBehavior: string;
            socialImpact: string;
            environmental: string;
        }
    ): string {
        return `
      <html>
        <head>
          <title>${companyName} ESG Report ${year}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              color: #333;
            }
            .page { 
              page-break-after: always; 
              padding: 40px 30px;
              position: relative;
            }
            .cover { 
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .cover img { 
              max-width: 90%; 
              max-height: 75vh;
              margin-bottom: 20px;
            }
            .content { 
              margin: 20px 0 40px 0;
              text-align: center;
            }
            .content img { 
              max-width: 90%; 
              max-height: 65vh;
            }
            h1 { 
              color: #2a5c8b; 
              margin-top: 0;
              padding-top: 30px;
              border-bottom: 2px solid #4caf50;
              padding-bottom: 10px;
              font-size: 24px;
            }
            .footer { 
              text-align: center; 
              position: absolute;
              bottom: 20px;
              left: 0;
              right: 0;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
            .company-info {
              font-size: 14px;
              margin-top: 10px;
              color: #4caf50;
            }
            .report-date {
              font-size: 12px;
              margin-top: 5px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="page cover">
            <img src="${images.coverPage}" alt="Cover Page">
            <div class="company-info">${companyName} ESG Report</div>
            <div class="report-date">${year}</div>
          </div>
          
          <div class="page">
            <h1>Key Highlights</h1>
            <div class="content">
              <img src="${images.keyHighlights}" alt="Key Highlights">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year} | Page 2
            </div>
          </div>
          
          <div class="page">
            <h1>Board Diversity</h1>
            <div class="content">
              <img src="${images.boardDiversity}" alt="Board Diversity">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year} | Page 3
            </div>
          </div>
          
          <div class="page">
            <h1>Ethical Behavior</h1>
            <div class="content">
              <img src="${images.ethicalBehavior}" alt="Ethical Behavior">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year} | Page 4
            </div>
          </div>
          
          <div class="page">
            <h1>Social Impact</h1>
            <div class="content">
              <img src="${images.socialImpact}" alt="Social Impact">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year} | Page 5
            </div>
          </div>
          
          <div class="page">
            <h1>Environmental Sustainability</h1>
            <div class="content">
              <img src="${images.environmental}" alt="Environmental Sustainability">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year} | Page 6
            </div>
          </div>
        </body>
      </html>
    `;
    }

    /**
     * Convert the HTML report to a PDF using html2pdf.js
     */
    private createPdfFromHtml(
        companyName: string,
        year: string,
        results: {
            coverPage: string;
            keyHighlights: string;
            boardDiversity: string;
            ethicalBehavior: string;
            socialImpact: string;
            environmental: string;
        }
    ): Observable<Blob> {
        // Create the HTML content
        const reportHtml = this.createReportHtml(companyName, year, results);

        // Create a container element in the DOM
        const element = document.createElement('div');
        element.innerHTML = reportHtml;
        document.body.appendChild(element);

        // Configure the PDF options
        const options = {
            margin: [15, 15, 15, 15] as [number, number, number, number],
            filename: `${companyName}_ESG_Report_${year}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,  // Allow loading of external images (important for the OpenAI images)
                logging: false
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Use html2pdf to create the PDF and convert to observable
        return from(html2pdf().from(element).set(options).outputPdf('blob')).pipe(
            map(blob => {
                // Clean up - remove the temporary element
                document.body.removeChild(element);
                // Return the PDF blob
                return new Blob([blob], { type: 'application/pdf' });
            }),
            catchError(error => {
                // Clean up on error too
                if (document.body.contains(element)) {
                    document.body.removeChild(element);
                }
                console.error('Error generating PDF:', error);
                return throwError(() => new Error('Error converting report to PDF. Please try again.'));
            })
        );
    }
}