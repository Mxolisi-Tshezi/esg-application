import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardMembersBreakdown } from './models/boardcomposition.model';
import { EthicalBehaviorData } from './models/ethicalbehavior.model';
import { SocialEthicalData } from './models/social-ethical.model';
import { EnvironmentalEthicalData } from './models/environmental-ethical.model';
import { ReportStatus } from './models/report.model';
import { ReportService } from './services/report.service';
import { OpenAIService } from './services/opeanai.service';
import { LogoComponent } from './components/logo/logo.component';
import { ReportSettingsComponent, ReportSettings } from './components/report-settings/report-settings.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule, FormsModule, LogoComponent, ReportSettingsComponent],
  standalone: true,
  styleUrls: ['app.component.css']
})

export class AppComponent {
  boardMembersBreakdown: BoardMembersBreakdown = {
    totalboardmembers: 0,
    black: { percent: 0, count: 0 },
    white: { percent: 0, count: 0 },
    indian: { percent: 0, count: 0 },
    asian: { percent: 0, count: 0 },
    coloured: { percent: 0, count: 0 },
    below30: { percent: 0, count: 0 },
    between30And50: { percent: 0, count: 0 },
    female: { percent: 0, count: 0 },
    male: { percent: 0, count: 0 },
    over50: { percent: 0, count: 0 },
    boardprofile: '',
  }

  ethicalBehaviorData: EthicalBehaviorData = {
    codeOfEthicsExists: false,
    codeOfEthicsPubliclyAvailable: false,
    codeOfEthicsLastUpdated: '',
    trainingFrequency: '',
    employeesCoveredByTraining: 0,
    employeeTrainingPercentage: 0,
    whistleblowerMechanismExists: false,
    whistleblowerReportingChannel: '',
    whistleblowerAnonymousReporting: false,
    whistleblowerProtectionPolicy: false,
    annualEthicsAssessment: false,
    numberOfReportedIncidents: 0,
    numberOfInvestigatedIncidents: 0,
    numberOfResolvedIncidents: 0,
    averageResolutionTimeInDays: 0,
    ethicsOfficerExists: false,
    boardEthicsCommitteeExists: false,
    ethicsAuditFrequency: '',
    supplierCodeOfConductExists: false,
    descriptionOfApproach: '',
  }

  socialEthicalData: SocialEthicalData = {
    laborRightsPolicy: false,
    laborRightsPolicyPublic: false,
    humanRightsDueDiligence: false,
    humanRightsDueDiligenceFrequency: '',
    collectiveBargainingPercentage: 0,
    employeeGrievances: 0,
    resolvedEmployeeGrievances: 0,
    grievanceMechanism: false,
    communityInvestment: 0,
    communityInvestmentPercentage: 0,
    communityInitiatives: 0,
    volunteerHours: 0,
    socialImpactDescription: ''
  }

  environmentalEthicalData: EnvironmentalEthicalData = {
    environmentalPolicy: false,
    environmentalPolicyPublic: false,
    climateChangeStrategy: false,
    carbonNeutralByYear: 0,
    emissionsReductionTarget: 0,
    carbonOffsetProgram: false,
    renewableEnergyPercentage: 0,
    wasteReductionTarget: 0,
    circularEconomyInitiatives: false,
    waterConservationProgram: false,
    environmentalImpactDescription: ''
  }

  reportStatus: ReportStatus = {
    governance: false,
    social: false,
    environmental: false,
    generateReport: false
  }

  steps = ['Governance', 'Social', 'Environmental', 'Generate Report'];
  activeStepIndex = 0;

  tabs = ['Board composition', 'Ethical behaviour', 'Compliance and risk management', 'Tax transparency'];
  activeTabIndex = 0;

  formData = this.boardMembersBreakdown;
  ethicalFormData = this.ethicalBehaviorData;

  isGeneratingReport = false;
  reportGenerated = false;
  reportSuccess = false;

  // Report settings
  companyName = environment.companyName;
  reportYear = environment.reportYear;

  // OpenAI generation states
  isGeneratingAIReport = false;
  aiReportError: string | null = null;
  generationProgress = 0;

  constructor(
    private reportService: ReportService,
    private openAIService: OpenAIService
  ) {
    // Check if we have previously saved data
    this.loadSavedData();
  }

  loadSavedData() {
    const savedFormData = localStorage.getItem('formData');
    const savedEthicalFormData = localStorage.getItem('ethicalFormData');
    const savedSocialEthicalData = localStorage.getItem('socialEthicalData');
    const savedEnvironmentalEthicalData = localStorage.getItem('environmentalEthicalData');
    const savedReportStatus = localStorage.getItem('reportStatus');

    if (savedFormData) {
      this.formData = JSON.parse(savedFormData);
    }
    if (savedEthicalFormData) {
      this.ethicalFormData = JSON.parse(savedEthicalFormData);
    }
    if (savedSocialEthicalData) {
      this.socialEthicalData = JSON.parse(savedSocialEthicalData);
    }
    if (savedEnvironmentalEthicalData) {
      this.environmentalEthicalData = JSON.parse(savedEnvironmentalEthicalData);
    }
    if (savedReportStatus) {
      this.reportStatus = JSON.parse(savedReportStatus);
    }
  }

  goToStep(index: number) {
    this.activeStepIndex = index;
    this.activeTabIndex = 0;
    this.saveData();
  }

  goToTab(index: number) {
    this.activeTabIndex = index;
  }

  saveData() {
    localStorage.setItem('formData', JSON.stringify(this.formData));
    localStorage.setItem('ethicalFormData', JSON.stringify(this.ethicalFormData));
    localStorage.setItem('socialEthicalData', JSON.stringify(this.socialEthicalData));
    localStorage.setItem('environmentalEthicalData', JSON.stringify(this.environmentalEthicalData));

    // Update step completion status
    this.updateReportStatus();
    localStorage.setItem('reportStatus', JSON.stringify(this.reportStatus));
  }

  updateReportStatus() {
    // Mark governance as complete if form data is filled
    this.reportStatus.governance = this.formData.totalboardmembers > 0 &&
      this.ethicalFormData.codeOfEthicsExists !== null;

    // Mark social as complete if social ethical data is filled
    this.reportStatus.social = this.socialEthicalData.laborRightsPolicy !== null &&
      this.socialEthicalData.communityInitiatives > 0;

    // Mark environmental as complete if environmental data is filled
    this.reportStatus.environmental = this.environmentalEthicalData.environmentalPolicy !== null &&
      this.environmentalEthicalData.environmentalImpactDescription.length > 0;
  }

  // generateReport() {
  //   this.isGeneratingReport = true;
  //   this.reportGenerated = false;

  //   // If using AI report generation, we'll just set a flag
  //   // The actual AI report generation happens in downloadReport
  //   if (this.isGeneratingAIReport) {
  //     // Simulate report preparation with a short delay
  //     setTimeout(() => {
  //       this.isGeneratingReport = false;
  //       this.reportGenerated = true;
  //       this.reportSuccess = true;
  //       this.reportStatus.generateReport = true;
  //       this.saveData();
  //     }, 1000);
  //   } else {
  //     // Standard report generation with a delay
  //     setTimeout(() => {
  //       this.isGeneratingReport = false;
  //       this.reportGenerated = true;
  //       this.reportSuccess = true;
  //       this.reportStatus.generateReport = true;
  //       this.saveData();
  //     }, 2000);
  //   }
  // }



  generateReport() {
    this.isGeneratingReport = true;
    this.reportGenerated = false;
    this.aiReportError = null;

    // If using AI report generation, we'll just set a flag
    // The actual AI report generation happens in downloadReport
    if (this.isGeneratingAIReport) {
      // Simulate report preparation with a short delay
      setTimeout(() => {
        this.isGeneratingReport = false;
        this.reportGenerated = true;
        this.reportSuccess = true;
        this.reportStatus.generateReport = true;
        this.saveData();
      }, 1000);
    } else {
      // Standard report generation with a delay
      setTimeout(() => {
        this.isGeneratingReport = false;
        this.reportGenerated = true;
        this.reportSuccess = true;
        this.reportStatus.generateReport = true;
        this.saveData();
      }, 2000);
    }
  }



  // downloadReport() {
  //   // Check if we should generate a basic report or an AI-powered visual report
  //   if (!this.isGeneratingAIReport) {
  //     // Use the report service to generate a basic formatted report
  //     const blob = this.reportService.generateESGReport(
  //       this.formData,
  //       this.ethicalFormData,
  //       this.socialEthicalData,
  //       this.environmentalEthicalData
  //     );

  //     const url = window.URL.createObjectURL(blob);

  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'ESG_Sustainability_Report.json';
  //     document.body.appendChild(a);
  //     a.click();

  //     window.URL.revokeObjectURL(url);
  //     document.body.removeChild(a);
  //   } else {
  //     // Generate an AI-powered visual report
  //     this.generateAIReport();
  //   }
  // }



  downloadReport() {
    // Check if we should generate a basic report or an AI-powered visual report
    if (!this.isGeneratingAIReport) {
      // Use the report service to generate a basic formatted report
      const blob = this.reportService.generateESGReport(
        this.formData,
        this.ethicalFormData,
        this.socialEthicalData,
        this.environmentalEthicalData
      );

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'ESG_Sustainability_Report.json';
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      // Generate an AI-powered visual report
      this.generateAIReport();
    }
  }


  // /**
  //  * Generate an AI-powered ESG report using OpenAI
  //  */
  // generateAIReport() {
  //   this.isGeneratingAIReport = true;
  //   this.aiReportError = null;
  //   this.generationProgress = 10;

  //   // Call the OpenAI service to generate the report
  //   this.openAIService.generateESGReport(
  //     this.companyName,
  //     this.reportYear,
  //     this.formData,
  //     this.ethicalFormData,
  //     this.socialEthicalData,
  //     this.environmentalEthicalData
  //   ).subscribe({
  //     next: (blob) => {
  //       this.generationProgress = 100;

  //       // Create a download link for the generated PDF
  //       const url = window.URL.createObjectURL(blob);

  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = `${this.companyName}_ESG_Report_${this.reportYear}.pdf`;
  //       document.body.appendChild(a);
  //       a.click();

  //       window.URL.revokeObjectURL(url);
  //       document.body.removeChild(a);

  //       // Reset state after successful generation
  //       setTimeout(() => {
  //         this.isGeneratingAIReport = false;
  //         this.generationProgress = 0;
  //         this.reportSuccess = true;
  //       }, 1000);
  //     },
  //     error: (error) => {
  //       this.isGeneratingAIReport = false;
  //       this.aiReportError = error.message || 'Failed to generate AI report';
  //       this.generationProgress = 0;
  //       console.error('Error generating AI report:', error);
  //     }
  //   });
  // }



  /**
   * Generate an AI-powered ESG report using OpenAI
   */
  generateAIReport() {
    this.isGeneratingAIReport = true;
    this.aiReportError = null;
    this.generationProgress = 10;

    // Call the OpenAI service to generate the report
    // The service now properly creates a PDF and has progress tracking
    this.openAIService.generateESGReport(
      this.companyName,
      this.reportYear,
      this.formData,
      this.ethicalFormData,
      this.socialEthicalData,
      this.environmentalEthicalData
    ).subscribe({
      next: (result: any) => {
        // Update the progress if it's included in the result
        if (result.progress && typeof result.progress === 'number') {
          this.generationProgress = result.progress;
          return; // This is just a progress update, not the final blob
        }

        // When we receive the final PDF blob
        this.generationProgress = 100;

        // Create a download link for the generated PDF
        const url = window.URL.createObjectURL(result);

        const a = document.createElement('a');
        a.href = url;
        // Make sure we set the file extension to .pdf for proper handling
        a.download = `${this.companyName}_ESG_Report_${this.reportYear}.pdf`;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Reset state after successful generation
        setTimeout(() => {
          this.isGeneratingAIReport = false;
          this.generationProgress = 0;
          this.reportSuccess = true;
        }, 1000);
      },
      error: (error) => {
        this.isGeneratingAIReport = false;
        this.aiReportError = error.message || 'Failed to generate AI report';
        this.generationProgress = 0;
        console.error('Error generating AI report:', error);
      }
    });
  }



  /**
   * Update report settings
   */
  updateReportSettings(settings: ReportSettings) {
    this.companyName = settings.companyName;
    this.reportYear = settings.reportYear;
  }

  clearForm() {
    // Reset all form data
    this.formData = {
      totalboardmembers: 0,
      black: { percent: 0, count: 0 },
      white: { percent: 0, count: 0 },
      indian: { percent: 0, count: 0 },
      asian: { percent: 0, count: 0 },
      coloured: { percent: 0, count: 0 },
      below30: { percent: 0, count: 0 },
      between30And50: { percent: 0, count: 0 },
      female: { percent: 0, count: 0 },
      male: { percent: 0, count: 0 },
      over50: { percent: 0, count: 0 },
      boardprofile: '',
    };

    this.ethicalFormData = {
      codeOfEthicsExists: false,
      codeOfEthicsPubliclyAvailable: false,
      codeOfEthicsLastUpdated: '',
      trainingFrequency: '',
      employeesCoveredByTraining: 0,
      employeeTrainingPercentage: 0,
      whistleblowerMechanismExists: false,
      whistleblowerReportingChannel: '',
      whistleblowerAnonymousReporting: false,
      whistleblowerProtectionPolicy: false,
      annualEthicsAssessment: false,
      numberOfReportedIncidents: 0,
      numberOfInvestigatedIncidents: 0,
      numberOfResolvedIncidents: 0,
      averageResolutionTimeInDays: 0,
      ethicsOfficerExists: false,
      boardEthicsCommitteeExists: false,
      ethicsAuditFrequency: '',
      supplierCodeOfConductExists: false,
      descriptionOfApproach: '',
    };

    this.socialEthicalData = {
      laborRightsPolicy: false,
      laborRightsPolicyPublic: false,
      humanRightsDueDiligence: false,
      humanRightsDueDiligenceFrequency: '',
      collectiveBargainingPercentage: 0,
      employeeGrievances: 0,
      resolvedEmployeeGrievances: 0,
      grievanceMechanism: false,
      communityInvestment: 0,
      communityInvestmentPercentage: 0,
      communityInitiatives: 0,
      volunteerHours: 0,
      socialImpactDescription: ''
    };

    this.environmentalEthicalData = {
      environmentalPolicy: false,
      environmentalPolicyPublic: false,
      climateChangeStrategy: false,
      carbonNeutralByYear: 0,
      emissionsReductionTarget: 0,
      carbonOffsetProgram: false,
      renewableEnergyPercentage: 0,
      wasteReductionTarget: 0,
      circularEconomyInitiatives: false,
      waterConservationProgram: false,
      environmentalImpactDescription: ''
    };

    this.reportStatus = {
      governance: false,
      social: false,
      environmental: false,
      generateReport: false
    };

    this.reportGenerated = false;
    this.reportSuccess = false;

    // Clear localStorage
    localStorage.removeItem('formData');
    localStorage.removeItem('ethicalFormData');
    localStorage.removeItem('socialEthicalData');
    localStorage.removeItem('environmentalEthicalData');
    localStorage.removeItem('reportStatus');

    // Reset to first step
    this.activeStepIndex = 0;
    this.activeTabIndex = 0;
  }
}