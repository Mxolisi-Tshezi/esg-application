document.addEventListener("DOMContentLoaded", function () {
  // Debug function to check visibility of all sections
  function debugSections() {
    console.log("-----DEBUG SECTION VISIBILITY-----");

    // Check main sections
    const sections = [
      "governance-content",
      "social-content",
      "environmental-content",
      "generate-report-content",
    ];

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        console.log(
          `${id}: hidden=${element.classList.contains(
            "hidden"
          )}, active=${element.classList.contains("active")}`
        );
        console.log(`${id} classes: ${element.className}`);
      } else {
        console.error(`${id} element not found in DOM!`);
      }
    });

    // Check governance sub-tabs
    if (document.querySelector(".tab.active")) {
      console.log(
        "Active governance tab:",
        document.querySelector(".tab.active").getAttribute("data-tab")
      );
    }

    console.log("--------------------------------");
  }

  // Override the navigateToStep function to add debugging
  const originalNavigateToStep = window.navigateToStep;
  if (typeof originalNavigateToStep === "function") {
    window.navigateToStep = function (stepNumber) {
      console.log(`Navigating to step ${stepNumber}`);
      originalNavigateToStep(stepNumber);
      debugSections();
    };
  }

  // Add a small debugger UI
  const debuggerContainer = document.createElement("div");
  debuggerContainer.style.position = "fixed";
  debuggerContainer.style.bottom = "10px";
  debuggerContainer.style.right = "10px";
  debuggerContainer.style.backgroundColor = "#f0f0f0";
  debuggerContainer.style.padding = "10px";
  debuggerContainer.style.borderRadius = "5px";
  debuggerContainer.style.zIndex = "1000";

  const debugButton = document.createElement("button");
  debugButton.textContent = "Debug Sections";
  debugButton.style.padding = "5px 10px";
  debugButton.addEventListener("click", debugSections);

  debuggerContainer.appendChild(debugButton);
  document.body.appendChild(debuggerContainer);

  // Initial debug
  setTimeout(debugSections, 500);
});
