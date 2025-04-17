import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError, map, forkJoin } from 'rxjs';
import { BoardMembersBreakdown } from '../models/boardcomposition.model';
import { EthicalBehaviorData } from '../models/ethicalbehavior.model';
import { SocialEthicalData } from '../models/social-ethical.model';
import { EnvironmentalEthicalData } from '../models/environmental-ethical.model';
import { environment } from '../../environments/environment';

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
    private apiUrl = 'https://api.openai.com/v1/images/generations';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${environment.openaiApiKey}`
        });
    }

    /**
     * Generate an image using OpenAI's API
     */
    generateImage(prompt: string): Observable<string> {
        const payload = {
            model: "dall-e-3", // Using the latest model
            prompt: prompt,
            n: 1,
            size: "1024x1024"
        };

        return this.http.post<ImageGenerationResponse>(
            this.apiUrl,
            payload,
            { headers: this.getHeaders() }
        ).pipe(
            map(response => response.data[0].url),
            catchError(error => {
                console.error('Error generating image:', error);
                return throwError(() => new Error('Failed to generate image. Please try again.'));
            })
        );
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
     * and compiling them into a PDF
     */
    generateESGReport(
        companyName: string,
        year: string,
        governanceData: BoardMembersBreakdown,
        ethicsData: EthicalBehaviorData,
        socialData: SocialEthicalData,
        environmentalData: EnvironmentalEthicalData
    ): Observable<Blob> {
        // Generate all the required images
        const coverPage$ = this.generateCoverPage(companyName, year);
        const keyHighlights$ = this.generateKeyHighlightsPage(companyName, year, governanceData, socialData, environmentalData);
        const boardDiversity$ = this.generateBoardDiversityPage(companyName, year, governanceData);
        const ethicalBehavior$ = this.generateEthicalBehaviorPage(companyName, year, ethicsData);
        const socialImpact$ = this.generateSocialImpactPage(companyName, year, socialData);
        const environmental$ = this.generateEnvironmentalPage(companyName, year, environmentalData);

        // Wait for all image generation to complete
        return forkJoin({
            coverPage: coverPage$,
            keyHighlights: keyHighlights$,
            boardDiversity: boardDiversity$,
            ethicalBehavior: ethicalBehavior$,
            socialImpact: socialImpact$,
            environmental: environmental$
        }).pipe(
            map(images => {
                // This would normally call a backend API to generate the PDF
                // For now, we'll use a placeholder implementation
                return this.compilePdfReport(companyName, year, images);
            }),
            catchError(error => {
                console.error('Error generating report:', error);
                return throwError(() => new Error('Failed to generate ESG report. Please try again.'));
            })
        );
    }

    /**
     * Compile the generated images into a PDF
     * In a real implementation, this would call a backend API
     */
    private compilePdfReport(
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
    ): Blob {
        // In a real implementation, this would call a backend service to generate the PDF
        // For now, we'll create a simple HTML representation as a placeholder

        const reportHtml = `
      <html>
        <head>
          <title>${companyName} ESG Report ${year}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .page { page-break-after: always; height: 100vh; }
            .cover { text-align: center; }
            .cover img { max-width: 100%; max-height: 90vh; }
            .content img { max-width: 100%; max-height: 80vh; }
            h1 { color: #333; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="page cover">
            <img src="${images.coverPage}" alt="Cover Page">
          </div>
          
          <div class="page">
            <h1>Key Highlights</h1>
            <div class="content">
              <img src="${images.keyHighlights}" alt="Key Highlights">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year}
            </div>
          </div>
          
          <div class="page">
            <h1>Board Diversity</h1>
            <div class="content">
              <img src="${images.boardDiversity}" alt="Board Diversity">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year}
            </div>
          </div>
          
          <div class="page">
            <h1>Ethical Behavior</h1>
            <div class="content">
              <img src="${images.ethicalBehavior}" alt="Ethical Behavior">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year}
            </div>
          </div>
          
          <div class="page">
            <h1>Social Impact</h1>
            <div class="content">
              <img src="${images.socialImpact}" alt="Social Impact">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year}
            </div>
          </div>
          
          <div class="page">
            <h1>Environmental Sustainability</h1>
            <div class="content">
              <img src="${images.environmental}" alt="Environmental Sustainability">
            </div>
            <div class="footer">
              ${companyName} ESG Report ${year}
            </div>
          </div>
        </body>
      </html>
    `;

        // In a real implementation, we would convert this HTML to PDF using a backend service
        // For now, we'll just create a Blob with the HTML content as a placeholder
        return new Blob([reportHtml], { type: 'text/html' });
    }
}