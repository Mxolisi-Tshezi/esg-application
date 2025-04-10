// // document.addEventListener("DOMContentLoaded", function () {
// //   // DOM Elements
// //   const steps = document.querySelectorAll(".step");
// //   const progressLineFilled = document.getElementById("progress-line-filled");
// //   const tabs = document.querySelectorAll(".tab");
// //   const notification = document.getElementById("notification");
// //   const closeNotification = document.querySelector(".close-notification");

// //   // Main navigation variables
// //   const mainSections = [
// //     document.getElementById("governance-content"),
// //     document.getElementById("social-content"),
// //     document.getElementById("environmental-content"),
// //     document.getElementById("generate-report-content"),
// //   ];

// //   // Sub-tab content for governance
// //   const governanceSubTabs = {
// //     "board-composition": document.getElementById("board-composition-content"),
// //     "ethical-behaviour": document.getElementById("ethical-behaviour-content"),
// //     compliance: document.getElementById("compliance-content"),
// //     tax: document.getElementById("tax-content"),
// //   };

// //   // Current step tracker
// //   let currentStep = 1;

// //   // Add navigation buttons if they don't exist
// //   if (!document.querySelector(".buttons")) {
// //     addNavigationButtons();
// //   }

// //   // Initialize event listeners
// //   initEventListeners();

// //   // Function to add navigation buttons
// //   function addNavigationButtons() {
// //     const buttonsContainer = document.createElement("div");
// //     buttonsContainer.className = "buttons";

// //     const prevButton = document.createElement("button");
// //     prevButton.className = "btn btn-outline";
// //     prevButton.id = "prev-btn";
// //     prevButton.textContent = "Previous";
// //     prevButton.style.display = "none"; // Hide on first step

// //     const nextButton = document.createElement("button");
// //     nextButton.className = "btn btn-primary";
// //     nextButton.id = "next-btn";
// //     nextButton.textContent = "Next";

// //     buttonsContainer.appendChild(prevButton);
// //     buttonsContainer.appendChild(nextButton);

// //     document.querySelector(".card").appendChild(buttonsContainer);
// //   }

// //   // Initialize all event listeners
// //   function initEventListeners() {
// //     // Tab click events
// //     tabs.forEach((tab) => {
// //       tab.addEventListener("click", function () {
// //         const tabId = this.getAttribute("data-tab");
// //         switchTab(this, tabId);
// //       });
// //     });

// //     // Step click events for completed steps
// //     steps.forEach((step) => {
// //       step.addEventListener("click", function () {
// //         const stepNumber = parseInt(this.getAttribute("data-step"));
// //         // Allow clicking on any step to navigate to it
// //         navigateToStep(stepNumber);
// //       });
// //     });

// //     // Navigation buttons
// //     const prevButton = document.getElementById("prev-btn");
// //     const nextButton = document.getElementById("next-btn");

// //     if (prevButton) {
// //       prevButton.addEventListener("click", goToPreviousStep);
// //     }

// //     if (nextButton) {
// //       nextButton.addEventListener("click", goToNextStep);
// //     }

// //     // Close notification button
// //     if (closeNotification) {
// //       closeNotification.addEventListener("click", function () {
// //         notification.classList.add("hidden");
// //       });
// //     }
// //   }

// //   // Switch between tabs
// //   function switchTab(selectedTab, tabId) {
// //     // Update active tab
// //     tabs.forEach((tab) => tab.classList.remove("active"));
// //     selectedTab.classList.add("active");

// //     // Switch content based on tab
// //     if (currentStep === 1) {
// //       // Governance step has sub-tabs
// //       Object.values(governanceSubTabs).forEach((content) => {
// //         if (content) {
// //           content.classList.remove("active");
// //         }
// //       });

// //       if (governanceSubTabs[tabId]) {
// //         governanceSubTabs[tabId].classList.add("active");
// //       }
// //     }
// //   }

// //   // Navigate to specific step
// //   function navigateToStep(stepNumber) {
// //     // Ensure step number is valid
// //     if (stepNumber < 1 || stepNumber > steps.length) {
// //       return;
// //     }

// //     // Hide all content sections
// //     mainSections.forEach((section) => {
// //       if (section) {
// //         section.classList.add("hidden");
// //         section.classList.remove("active");
// //       }
// //     });

// //     // Show content for current step
// //     if (mainSections[stepNumber - 1]) {
// //       mainSections[stepNumber - 1].classList.remove("hidden");
// //       mainSections[stepNumber - 1].classList.add("active");
// //     }

// //     // Update step indicators
// //     steps.forEach((step, index) => {
// //       const stepNum = index + 1;
// //       step.classList.remove("active", "completed");

// //       // Mark previous steps as completed
// //       if (stepNum < stepNumber) {
// //         step.classList.add("completed");
// //         const checkIcon = step.querySelector(".check-icon");
// //         const stepNumber = step.querySelector(".step-number");

// //         if (checkIcon && stepNumber) {
// //           checkIcon.classList.remove("hidden");
// //           stepNumber.classList.add("hidden");
// //         }
// //       }
// //       // Mark current step as active
// //       else if (stepNum === stepNumber) {
// //         step.classList.add("active");
// //         const checkIcon = step.querySelector(".check-icon");
// //         const stepNumber = step.querySelector(".step-number");

// //         if (checkIcon && stepNumber) {
// //           checkIcon.classList.add("hidden");
// //           stepNumber.classList.remove("hidden");
// //         }
// //       }
// //       // Reset future steps
// //       else {
// //         const checkIcon = step.querySelector(".check-icon");
// //         const stepNumber = step.querySelector(".step-number");

// //         if (checkIcon && stepNumber) {
// //           checkIcon.classList.add("hidden");
// //           stepNumber.classList.remove("hidden");
// //         }
// //       }
// //     });

// //     // Update progress bar
// //     updateProgressBar(stepNumber);

// //     // Update buttons
// //     updateNavigationButtons(stepNumber);

// //     // Update current step
// //     currentStep = stepNumber;
// //   }

// //   // Update progress bar
// //   function updateProgressBar(stepNumber) {
// //     const totalSteps = steps.length;
// //     const progressPercentage = ((stepNumber - 1) / (totalSteps - 1)) * 100;
// //     progressLineFilled.style.width = `${progressPercentage}%`;
// //     progressLineFilled.style.backgroundColor = "#4caf50"; // Use green for progress
// //   }

// //   // Update navigation buttons
// //   function updateNavigationButtons(stepNumber) {
// //     const prevButton = document.getElementById("prev-btn");
// //     const nextButton = document.getElementById("next-btn");

// //     // Show/hide previous button
// //     if (prevButton) {
// //       prevButton.style.display = stepNumber === 1 ? "none" : "block";
// //     }

// //     // Update next button text
// //     if (nextButton) {
// //       if (stepNumber === steps.length) {
// //         nextButton.textContent = "Generate Report";
// //       } else {
// //         nextButton.textContent = "Next";
// //       }
// //     }
// //   }

// //   // Go to next step
// //   function goToNextStep() {
// //     if (currentStep === steps.length) {
// //       // Generate report
// //       generateReport();
// //       return;
// //     }

// //     navigateToStep(currentStep + 1);
// //   }

// //   // Go to previous step
// //   function goToPreviousStep() {
// //     if (currentStep > 1) {
// //       navigateToStep(currentStep - 1);
// //     }
// //   }

// //   // Generate report
// //   function generateReport() {
// //     // Show loading state on button
// //     const nextButton = document.getElementById("next-btn");
// //     const originalText = nextButton.textContent;
// //     nextButton.innerHTML =
// //       'Generating <span class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';
// //     nextButton.disabled = true;

// //     // Simulate API call
// //     setTimeout(() => {
// //       // Show notification
// //       notification.classList.remove("hidden");

// //       // Reset button
// //       nextButton.innerHTML = originalText;
// //       nextButton.disabled = false;

// //       // Here you would collect and send data to your backend
// //       console.log("Generating report with data:", collectFormData());
// //     }, 2000);
// //   }

// //   // Function to collect all form data
// //   function collectFormData() {
// //     const formData = {
// //       governance: {
// //         boardDiversity: {
// //           totalMembers: document.getElementById("total-board-members")?.value,
// //           blackMembers: document.getElementById("black-board-members")?.value,
// //           blackPercentage: document.getElementById("black-percentage")?.value,
// //           whiteMembers: document.getElementById("white-board-members")?.value,
// //           whitePercentage: document.getElementById("white-percentage")?.value,
// //           indianMembers: document.getElementById("indian-board-members")?.value,
// //           indianPercentage: document.getElementById("indian-percentage")?.value,
// //           asianMembers: document.getElementById("asian-board-members")?.value,
// //           asianPercentage: document.getElementById("asian-percentage")?.value,
// //           colouredMembers: document.getElementById("coloured-board-members")
// //             ?.value,
// //         },
// //         boardIndependence: {
// //           profile: document.getElementById("board-profile")?.value,
// //         },
// //         ethicalBehaviour: {
// //           hasCodeOfEthics: document.getElementById("has-code-of-ethics")?.value,
// //           ethicsPolicy: document.getElementById("ethics-policy")?.value,
// //         },
// //         compliance: {
// //           hasRiskFramework:
// //             document.getElementById("has-risk-framework")?.value,
// //           riskManagement: document.getElementById("risk-management")?.value,
// //         },
// //         tax: {
// //           hasTaxPolicy: document.getElementById("has-tax-policy")?.value,
// //           taxPolicy: document.getElementById("tax-policy")?.value,
// //         },
// //       },
// //       social: {
// //         employees: {
// //           totalEmployees: document.getElementById("total-employees")?.value,
// //           turnoverRate: document.getElementById("turnover-rate")?.value,
// //         },
// //         humanRights: {
// //           hasPolicy: document.getElementById("has-human-rights-policy")?.value,
// //           policyDescription: document.getElementById("human-rights-policy")
// //             ?.value,
// //         },
// //       },
// //       environmental: {
// //         carbonEmissions: {
// //           total: document.getElementById("carbon-emissions")?.value,
// //           reductionTarget: document.getElementById("carbon-target")?.value,
// //         },
// //         waterUsage: {
// //           total: document.getElementById("water-consumption")?.value,
// //           reductionTarget: document.getElementById("water-target")?.value,
// //         },
// //       },
// //       report: {
// //         companyName: document.getElementById("company-name")?.value,
// //         reportingYear: document.getElementById("reporting-year")?.value,
// //         format: document.getElementById("report-format")?.value,
// //         includeSummary: document.getElementById("include-summary")?.value,
// //         additionalComments: document.getElementById("additional-comments")
// //           ?.value,
// //       },
// //     };

// //     return formData;
// //   }

// //   // Initialize first step
// //   navigateToStep(1);
// // });


// document.addEventListener("DOMContentLoaded", function () {
//     // DOM Elements
//     const steps = document.querySelectorAll(".step");
//     const progressLineFilled = document.getElementById("progress-line-filled");
//     const tabs = document.querySelectorAll(".tab");
//     const notification = document.getElementById("notification");
//     const closeNotification = document.querySelector(".close-notification");
  
//     // Main navigation variables
//     const mainSections = [
//       document.getElementById("governance-content"),
//       document.getElementById("social-content"),
//       document.getElementById("environmental-content"),
//       document.getElementById("generate-report-content"),
//     ];
  
//     // Sub-tab content for governance
//     const governanceSubTabs = {
//       "board-composition": document.getElementById("board-composition-content"),
//       "ethical-behaviour": document.getElementById("ethical-behaviour-content"),
//       compliance: document.getElementById("compliance-content"),
//       tax: document.getElementById("tax-content"),
//     };
  
//     // Current step tracker
//     let currentStep = 1;
  
//     // Initialize navigation
//     initNavigation();
  
//     function initNavigation() {
//       // Remove any existing buttons first to avoid duplicates
//       const existingButtons = document.querySelector(".buttons");
//       if (existingButtons) {
//         existingButtons.remove();
//       }
      
//       // Add navigation buttons
//       addNavigationButtons();
      
//       // Initialize event listeners
//       initEventListeners();
      
//       // Initialize first step
//       navigateToStep(1);
//     }
  
//     // Function to add navigation buttons
//     function addNavigationButtons() {
//       const buttonsContainer = document.createElement("div");
//       buttonsContainer.className = "buttons";
  
//       const prevButton = document.createElement("button");
//       prevButton.className = "btn btn-outline";
//       prevButton.id = "prev-btn";
//       prevButton.textContent = "Previous";
//       prevButton.style.display = "none"; // Hide on first step
  
//       const nextButton = document.createElement("button");
//       nextButton.className = "btn btn-primary";
//       nextButton.id = "next-btn";
//       nextButton.textContent = "Next";
  
//       buttonsContainer.appendChild(prevButton);
//       buttonsContainer.appendChild(nextButton);
  
//       document.querySelector(".card").appendChild(buttonsContainer);
//     }
  
//     // Initialize all event listeners
//     function initEventListeners() {
//       // Remove any existing event listeners first
//       const oldPrevBtn = document.getElementById("prev-btn");
//       const oldNextBtn = document.getElementById("next-btn");
      
//       if (oldPrevBtn) {
//         const newPrevBtn = oldPrevBtn.cloneNode(true);
//         oldPrevBtn.parentNode.replaceChild(newPrevBtn, oldPrevBtn);
//       }
      
//       if (oldNextBtn) {
//         const newNextBtn = oldNextBtn.cloneNode(true);
//         oldNextBtn.parentNode.replaceChild(newNextBtn, oldNextBtn);
//       }
    
//       // Tab click events
//       tabs.forEach((tab) => {
//         tab.addEventListener("click", function () {
//           const tabId = this.getAttribute("data-tab");
//           switchTab(this, tabId);
//         });
//       });
  
//       // Step click events
//       steps.forEach((step) => {
//         step.addEventListener("click", function () {
//           const stepNumber = parseInt(this.getAttribute("data-step"));
//           navigateToStep(stepNumber);
//         });
//       });
  
//       // Navigation buttons
//       document.getElementById("prev-btn").addEventListener("click", goToPreviousStep);
//       document.getElementById("next-btn").addEventListener("click", goToNextStep);
  
//       // Close notification button
//       if (closeNotification) {
//         closeNotification.addEventListener("click", function () {
//           notification.classList.add("hidden");
//         });
//       }
//     }
  
//     // Switch between tabs
//     function switchTab(selectedTab, tabId) {
//       // Update active tab
//       tabs.forEach((tab) => tab.classList.remove("active"));
//       selectedTab.classList.add("active");
  
//       // Switch content based on tab
//       if (currentStep === 1) {
//         // Governance step has sub-tabs
//         Object.values(governanceSubTabs).forEach((content) => {
//           if (content) {
//             content.classList.remove("active");
//           }
//         });
  
//         if (governanceSubTabs[tabId]) {
//           governanceSubTabs[tabId].classList.add("active");
//         }
//       }
//     }
  
//     // Navigate to specific step
//     function navigateToStep(stepNumber) {
//       console.log("Navigating to step:", stepNumber);
      
//       // Ensure step number is valid
//       if (stepNumber < 1 || stepNumber > steps.length) {
//         return;
//       }
  
//       // Hide all content sections
//       mainSections.forEach((section) => {
//         if (section) {
//           section.classList.add("hidden");
//           section.classList.remove("active");
//         }
//       });
  
//       // Show content for current step
//       if (mainSections[stepNumber - 1]) {
//         mainSections[stepNumber - 1].classList.remove("hidden");
//         mainSections[stepNumber - 1].classList.add("active");
//         console.log("Showing section:", stepNumber);
//       }
  
//       // Update step indicators
//       steps.forEach((step, index) => {
//         const stepNum = index + 1;
//         step.classList.remove("active", "completed");
  
//         // Mark previous steps as completed
//         if (stepNum < stepNumber) {
//           step.classList.add("completed");
//           const checkIcon = step.querySelector(".check-icon");
//           const stepNumber = step.querySelector(".step-number");
  
//           if (checkIcon && stepNumber) {
//             checkIcon.classList.remove("hidden");
//             stepNumber.classList.add("hidden");
//           }
//         } 
//         // Mark current step as active
//         else if (stepNum === stepNumber) {
//           step.classList.add("active");
//           const checkIcon = step.querySelector(".check-icon");
//           const stepNumber = step.querySelector(".step-number");
  
//           if (checkIcon && stepNumber) {
//             checkIcon.classList.add("hidden");
//             stepNumber.classList.remove("hidden");
//           }
//         } 
//         // Reset future steps
//         else {
//           const checkIcon = step.querySelector(".check-icon");
//           const stepNumber = step.querySelector(".step-number");
  
//           if (checkIcon && stepNumber) {
//             checkIcon.classList.add("hidden");
//             stepNumber.classList.remove("hidden");
//           }
//         }
//       });
  
//       // Update progress bar
//       updateProgressBar(stepNumber);
  
//       // Update buttons
//       updateNavigationButtons(stepNumber);
  
//       // Update current step
//       currentStep = stepNumber;
//     }
  
//     // Update progress bar
//     function updateProgressBar(stepNumber) {
//       const totalSteps = steps.length;
//       const progressPercentage = ((stepNumber - 1) / (totalSteps - 1)) * 100;
//       progressLineFilled.style.width = `${progressPercentage}%`;
//       progressLineFilled.style.backgroundColor = "#4caf50"; // Use green for progress
//     }
  
//     // Update navigation buttons
//     function updateNavigationButtons(stepNumber) {
//       const prevButton = document.getElementById("prev-btn");
//       const nextButton = document.getElementById("next-btn");
  
//       // Show/hide previous button
//       if (prevButton) {
//         prevButton.style.display = stepNumber === 1 ? "none" : "block";
//       }
  
//       // Update next button text
//       if (nextButton) {
//         if (stepNumber === steps.length) {
//           nextButton.textContent = "Generate Report";
//         } else {
//           nextButton.textContent = "Next";
//         }
//       }
//     }
  
//     // Go to next step
//     function goToNextStep() {
//       if (currentStep === steps.length) {
//         // Generate report
//         generateReport();
//         return;
//       }
  
//       navigateToStep(currentStep + 1);
//     }
  
//     // Go to previous step
//     function goToPreviousStep() {
//       if (currentStep > 1) {
//         navigateToStep(currentStep - 1);
//       }
//     }
  
//     // Generate report
//     function generateReport() {
//       // Show loading state on button
//       const nextButton = document.getElementById("next-btn");
//       const originalText = nextButton.textContent;
//       nextButton.innerHTML =
//         'Generating <span class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';
//       nextButton.disabled = true;
  
//       // Simulate API call
//       setTimeout(() => {
//         // Show notification
//         notification.classList.remove("hidden");
  
//         // Reset button
//         nextButton.innerHTML = originalText;
//         nextButton.disabled = false;
  
//         // Here you would collect and send data to your backend
//         console.log("Generating report with data:", collectFormData());
//       }, 2000);
//     }
  
//     // Function to collect all form data
//     function collectFormData() {
//       const formData = {
//         governance: {
//           boardDiversity: {
//             totalMembers: document.getElementById("total-board-members")?.value,
//             blackMembers: document.getElementById("black-board-members")?.value,
//             blackPercentage: document.getElementById("black-percentage")?.value,
//             whiteMembers: document.getElementById("white-board-members")?.value,
//             whitePercentage: document.getElementById("white-percentage")?.value,
//             indianMembers: document.getElementById("indian-board-members")?.value,
//             indianPercentage: document.getElementById("indian-percentage")?.value,
//             asianMembers: document.getElementById("asian-board-members")?.value,
//             asianPercentage: document.getElementById("asian-percentage")?.value,
//             colouredMembers: document.getElementById("coloured-board-members")?.value
//           },
//           boardIndependence: {
//             profile: document.getElementById("board-profile")?.value
//           },
//           ethicalBehaviour: {
//             hasCodeOfEthics: document.getElementById("has-code-of-ethics")?.value,
//             ethicsPolicy: document.getElementById("ethics-policy")?.value
//           },
//           compliance: {
//             hasRiskFramework: document.getElementById("has-risk-framework")?.value,
//             riskManagement: document.getElementById("risk-management")?.value
//           },
//           tax: {
//             hasTaxPolicy: document.getElementById("has-tax-policy")?.value,
//             taxPolicy: document.getElementById("tax-policy")?.value
//           }
//         },
//         social: {
//           employees: {
//             totalEmployees: document.getElementById("total-employees")?.value,
//             turnoverRate: document.getElementById("turnover-rate")?.value
//           },
//           humanRights: {
//             hasPolicy: document.getElementById("has-human-rights-policy")?.value,
//             policyDescription: document.getElementById("human-rights-policy")?.value
//           }
//         },
//         environmental: {
//           carbonEmissions: {
//             total: document.getElementById("carbon-emissions")?.value,
//             reductionTarget: document.getElementById("carbon-target")?.value
//           },
//           waterUsage: {
//             total: document.getElementById("water-consumption")?.value,
//             reductionTarget: document.getElementById("water-target")?.value
//           }
//         },
//         report: {
//           companyName: document.getElementById("company-name")?.value,
//           reportingYear: document.getElementById("reporting-year")?.value,
//           format: document.getElementById("report-format")?.value,
//           includeSummary: document.getElementById("include-summary")?.value,
//           additionalComments: document.getElementById("additional-comments")?.value
//         }
//       };
      
//       return formData;
//     }
//   });

document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const steps = document.querySelectorAll(".step");
    const progressLineFilled = document.getElementById("progress-line-filled");
    const tabs = document.querySelectorAll(".tab");
    const notification = document.getElementById("notification");
    const closeNotification = document.querySelector(".close-notification");
  
    // Complete the Environmental section if it's cut off
    completeEnvironmentalSection();
  
    // Add Generate Report section if it doesn't exist
    addGenerateReportSection();
  
    // Main navigation variables
    const mainSections = [
      document.getElementById("governance-content"),
      document.getElementById("social-content"),
      document.getElementById("environmental-content"),
      document.getElementById("generate-report-content"),
    ];
  
    // Sub-tab content for governance
    const governanceSubTabs = {
      "board-composition": document.getElementById("board-composition-content"),
      "ethical-behaviour": document.getElementById("ethical-behaviour-content"),
      compliance: document.getElementById("compliance-content"),
      tax: document.getElementById("tax-content"),
    };
  
    // Current step tracker
    let currentStep = 1;
  
    // Add navigation buttons
    addNavigationButtons();
  
    // Initialize event listeners
    initEventListeners();
  
    // Function to complete the environmental section if it's cut off
    function completeEnvironmentalSection() {
      const environmentalContent = document.getElementById(
        "environmental-content"
      );
  
      // Check if it has proper content already
      if (environmentalContent && environmentalContent.children.length === 0) {
        environmentalContent.innerHTML = `
            <div class="form-section">
              <div class="section-title">
                1. Carbon Emissions
                <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm0-10h2v8h-2V6z"/>
                </svg>
              </div>
              <div class="form-group">
                <div class="form-group-half">
                  <label class="form-label required">Total carbon emissions (metric tons CO2e)</label>
                  <input type="number" class="form-control" id="carbon-emissions" min="0">
                </div>
                <div class="form-group-half">
                  <label class="form-label required">Carbon emission reduction target (%)</label>
                  <input type="number" class="form-control" id="carbon-target" min="0" max="100">
                </div>
              </div>
            </div>
            <div class="form-section">
              <div class="section-title">
                2. Water Usage
                <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm0-10h2v8h-2V6z"/>
                </svg>
              </div>
              <div class="form-group">
                <div class="form-group-half">
                  <label class="form-label required">Total water consumption (kiloliters)</label>
                  <input type="number" class="form-control" id="water-consumption" min="0">
                </div>
                <div class="form-group-half">
                  <label class="form-label required">Water usage reduction target (%)</label>
                  <input type="number" class="form-control" id="water-target" min="0" max="100">
                </div>
              </div>
            </div>
          `;
      }
    }
  
    // Function to add the Generate Report section
    function addGenerateReportSection() {
      let generateReportContent = document.getElementById(
        "generate-report-content"
      );
  
      if (!generateReportContent) {
        generateReportContent = document.createElement("div");
        generateReportContent.id = "generate-report-content";
        generateReportContent.className = "tab-content hidden";
        generateReportContent.innerHTML = `
            <div class="form-section">
              <div class="section-title">
                Report Generation
                <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm0-10h2v8h-2V6z"/>
                </svg>
              </div>
              <div class="form-group">
                <div class="form-group-half">
                  <label class="form-label required">Company Name</label>
                  <input type="text" class="form-control" id="company-name">
                </div>
                <div class="form-group-half">
                  <label class="form-label required">Reporting Year</label>
                  <select class="form-control" id="reporting-year">
                    <option value="2024" selected>2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <div class="form-group-half">
                  <label class="form-label">Report Format</label>
                  <select class="form-control" id="report-format">
                    <option value="pdf">PDF Document</option>
                    <option value="xlsx">Excel Spreadsheet</option>
                    <option value="html">Web Page</option>
                  </select>
                </div>
                <div class="form-group-half">
                  <label class="form-label">Include Executive Summary</label>
                  <select class="form-control" id="include-summary">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <div class="form-group-half">
                  <label class="form-label">Additional Comments</label>
                  <textarea class="form-control" id="additional-comments" placeholder="Any additional information you would like to include in the report..."></textarea>
                </div>
              </div>
            </div>
          `;
        document.querySelector(".card").appendChild(generateReportContent);
      }
    }
  
    // Function to add navigation buttons
    function addNavigationButtons() {
      // Remove any existing buttons first
      const existingButtons = document.querySelector(".buttons");
      if (existingButtons) {
        existingButtons.remove();
      }
  
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "buttons";
  
      const prevButton = document.createElement("button");
      prevButton.className = "btn btn-outline";
      prevButton.id = "prev-btn";
      prevButton.textContent = "Previous";
      prevButton.style.display = "none"; // Hide on first step
  
      const nextButton = document.createElement("button");
      nextButton.className = "btn btn-primary";
      nextButton.id = "next-btn";
      nextButton.textContent = "Next";
  
      buttonsContainer.appendChild(prevButton);
      buttonsContainer.appendChild(nextButton);
  
      document.querySelector(".card").appendChild(buttonsContainer);
    }
  
    // Initialize all event listeners
    function initEventListeners() {
      // Tab click events
      tabs.forEach((tab) => {
        tab.addEventListener("click", function () {
          const tabId = this.getAttribute("data-tab");
          switchTab(this, tabId);
        });
      });
  
      // Step click events for completed steps
      steps.forEach((step) => {
        step.addEventListener("click", function () {
          const stepNumber = parseInt(this.getAttribute("data-step"));
          if (stepNumber < currentStep) {
            navigateToStep(stepNumber);
          }
        });
      });
  
      // Navigation buttons
      document
        .getElementById("prev-btn")
        .addEventListener("click", goToPreviousStep);
      document.getElementById("next-btn").addEventListener("click", goToNextStep);
  
      // Close notification button
      if (closeNotification) {
        closeNotification.addEventListener("click", function () {
          notification.classList.add("hidden");
        });
      }
    }
  
    // Switch between tabs
    function switchTab(selectedTab, tabId) {
      // Update active tab
      tabs.forEach((tab) => tab.classList.remove("active"));
      selectedTab.classList.add("active");
  
      // Switch content based on tab
      if (currentStep === 1) {
        // Governance step has sub-tabs
        Object.values(governanceSubTabs).forEach((content) => {
          if (content) {
            content.classList.remove("active");
          }
        });
  
        if (governanceSubTabs[tabId]) {
          governanceSubTabs[tabId].classList.add("active");
        }
      }
    }
  
    // Navigate to specific step
    function navigateToStep(stepNumber) {
      // Ensure step number is valid
      if (stepNumber < 1 || stepNumber > steps.length) {
        return;
      }
  
      // Hide all content - IMPORTANT: Use the correct class manipulation
      mainSections.forEach((section) => {
        if (section) {
          section.classList.add("hidden");
          section.classList.remove("active"); // Also remove active class if present
        }
      });
  
      // Show content for current step
      if (mainSections[stepNumber - 1]) {
        mainSections[stepNumber - 1].classList.remove("hidden");
        mainSections[stepNumber - 1].classList.add("active"); // Make sure it's active
      }
  
      // Update step indicators
      steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove("active", "completed");
  
        if (stepNum < stepNumber) {
          step.classList.add("completed");
          const checkIcon = step.querySelector(".check-icon");
          const stepNumber = step.querySelector(".step-number");
  
          if (checkIcon && stepNumber) {
            checkIcon.classList.remove("hidden");
            stepNumber.classList.add("hidden");
          }
        } else if (stepNum === stepNumber) {
          step.classList.add("active");
          const checkIcon = step.querySelector(".check-icon");
          const stepNumber = step.querySelector(".step-number");
  
          if (checkIcon && stepNumber) {
            checkIcon.classList.add("hidden");
            stepNumber.classList.remove("hidden");
          }
        } else {
          const checkIcon = step.querySelector(".check-icon");
          const stepNumber = step.querySelector(".step-number");
  
          if (checkIcon && stepNumber) {
            checkIcon.classList.add("hidden");
            stepNumber.classList.remove("hidden");
          }
        }
      });
  
      // Update progress bar
      updateProgressBar(stepNumber);
  
      // Update buttons
      updateNavigationButtons(stepNumber);
  
      // Update current step
      currentStep = stepNumber;
      
      // Debug - log the visibility state of all sections
      console.log(`Now on step ${stepNumber}`);
      mainSections.forEach((section, i) => {
        if (section) {
          console.log(`Section ${i+1} visible:`, !section.classList.contains("hidden"));
        }
      });
    }
  
    // Update progress bar
    function updateProgressBar(stepNumber) {
      const totalSteps = steps.length;
      const progressPercentage = ((stepNumber - 1) / (totalSteps - 1)) * 100;
      progressLineFilled.style.width = `${progressPercentage}%`;
    }
  
    // Update navigation buttons
    function updateNavigationButtons(stepNumber) {
      const prevButton = document.getElementById("prev-btn");
      const nextButton = document.getElementById("next-btn");
  
      // Show/hide previous button
      prevButton.style.display = stepNumber === 1 ? "none" : "block";
  
      // Update next button text
      if (stepNumber === steps.length) {
        nextButton.textContent = "Generate Report";
      } else {
        nextButton.textContent = "Next";
      }
    }
  
    // Go to next step
    function goToNextStep() {
      if (currentStep === steps.length) {
        // Generate report
        generateReport();
        return;
      }
  
      navigateToStep(currentStep + 1);
    }
  
    // Go to previous step
    function goToPreviousStep() {
      if (currentStep > 1) {
        navigateToStep(currentStep - 1);
      }
    }
  
    // Generate report
    function generateReport() {
      // Show loading state on button
      const nextButton = document.getElementById("next-btn");
      const originalText = nextButton.textContent;
      nextButton.innerHTML =
        'Generating <span class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';
      nextButton.disabled = true;
  
      // Simulate API call
      setTimeout(() => {
        // Show notification
        notification.classList.remove("hidden");
  
        // Reset button
        nextButton.innerHTML = originalText;
        nextButton.disabled = false;
  
        // Here you would collect and send data to your backend
        console.log("Generating report...");
      }, 2000);
    }
  
    // Initialize first step
    navigateToStep(1);
  });