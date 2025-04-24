import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError, map, from, concatMap, retryWhen, delay, take, timer, mergeMap, of } from 'rxjs';
import { BoardMembersBreakdown } from '../models/boardcomposition.model';
import { EthicalBehaviorData } from '../models/ethicalbehavior.model';
import { SocialEthicalData } from '../models/social-ethical.model';
import { EnvironmentalEthicalData } from '../models/environmental-ethical.model';
import { environment } from '../../environments/environment';
// Import html2pdf from the library
import html2pdf from 'html2pdf.js';

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

    // Development mode flag - set to true to use placeholder images instead of API
    private isDevelopment = false;

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

        // In development mode, return placeholder images
        if (this.isDevelopment) {
            const placeholderUrl = `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(request.prompt.substring(0, 20).replace(/\s+/g, '+'))}`;

            setTimeout(() => {
                request.resolve(placeholderUrl);
                this.isProcessingQueue = false;
                this.processQueue();
            }, 500); // Simulate API delay

            return;
        }

        // Format the payload exactly as expected by the Lambda function
        const payload = {
            model: "dall-e-3",
            prompt: request.prompt,
            n: 1,  // Always specify n=1
            size: "1024x1024"
        };

        console.log('Sending payload:', JSON.stringify(payload)); // Debug log

        this.http.post<any>(
            this.apiUrl,
            payload,
            { headers: this.getHeaders() }
        ).pipe(
            // Add a map to handle the Lambda response format
            map(response => {
                console.log('Raw response from Lambda:', response);

                // If the response is already in the expected format, return it
                if (response.data && Array.isArray(response.data)) {
                    return response as ImageGenerationResponse;
                }

                // If the response has a 'body' property that's a string, parse it
                if (response.body && typeof response.body === 'string') {
                    try {
                        const parsedBody = JSON.parse(response.body);
                        console.log('Parsed body:', parsedBody);
                        return parsedBody as ImageGenerationResponse;
                    } catch (e) {
                        console.error('Error parsing response body:', e);
                        throw new Error('Invalid response format from image generation API.');
                    }
                }

                console.error('Unexpected response format:', response);
                throw new Error('Invalid response format from image generation API.');
            }),
            retryWhen(errors =>
                errors.pipe(
                    mergeMap((error, i) => {
                        // Log the error for debugging
                        console.error(`API Error (attempt ${i + 1}):`, error);

                        // For Gateway Timeout or network errors
                        if (error.status === 504 || error.status === 0) {
                            console.log(`Gateway timeout or network error, retrying in ${(i + 1) * 5} seconds...`);
                            return timer((i + 1) * 5000); // Longer backoff for timeouts: 5s, 10s, 15s
                        }
                        // If it's a rate limit error (429), wait and retry
                        else if (error.status === 429 && i < 3) {
                            console.log(`Rate limit hit, retrying in ${(i + 1) * 2} seconds...`);
                            return timer((i + 1) * 2000);
                        }
                        // Otherwise rethrow the error
                        return throwError(() => error);
                    }),
                    take(5) // More retries for timeouts
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
                    // Add more detail from the error if available
                    if (error.error && error.error.error) {
                        errorMessage += ` Details: ${error.error.error}`;
                    }
                } else if (error.status === 504) {
                    errorMessage = 'Gateway timeout. The server took too long to respond.';
                } else if (error.status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
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
        const prompt = `Professional cover image for "${companyName} ESG Report ${year}" with governance symbols. Blue and grey corporate style.`;
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
     * Generate the complete ESG report by generating all necessary images
     * and compiling them into a PDF with sequential processing to avoid rate limits
     * 
     * This version only includes the Governance pillar (Board Diversity and Ethical Behavior)
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
        const totalSteps = 4; // 3 image generation steps + 1 PDF compilation step
        const updateProgress = () => {
            progressStep++;
            // Return the percentage of completion (rounded to nearest integer)
            return Math.round((progressStep / totalSteps) * 100);
        };

        // Use concatMap to process image generation sequentially
        return this.generateCoverPage(companyName, year).pipe(
            map(coverPage => {
                return { coverPage, progress: updateProgress() };
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
     * 
     * This version only includes the Governance pillar pages
     */
    private createReportHtml(
        companyName: string,
        year: string,
        images: {
            coverPage: string;
            boardDiversity: string;
            ethicalBehavior: string;
            keyHighlights?: string;
            socialImpact?: string;
            environmental?: string;
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
            <div class="company-info">${companyName} ESG Report - Governance Pillar</div>
            <div class="report-date">${year}</div>
          </div>
          
          <div class="page">
            <h1>Board Diversity</h1>
            <div class="content">
              <img src="${images.boardDiversity}" alt="Board Diversity">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year} | Page 2
            </div>
          </div>
          
          <div class="page">
            <h1>Ethical Behavior</h1>
            <div class="content">
              <img src="${images.ethicalBehavior}" alt="Ethical Behavior">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year} | Page 3
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
            boardDiversity: string;
            ethicalBehavior: string;
            keyHighlights?: string;
            socialImpact?: string;
            environmental?: string;
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
            filename: `${companyName}_ESG_Governance_Report_${year}.pdf`,
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