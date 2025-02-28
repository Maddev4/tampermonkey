// src/ui.js
export function displayHumanElement(text, score = null) {
  const stageFrame = document.getElementById("stageFrame");
  if (!stageFrame) return;

  // Only create style and container if they don't exist
  if (!document.querySelector("#custom-human-style")) {
    const rect = stageFrame.getBoundingClientRect();
    let style = document.createElement("style");
    style.id = "custom-human-style";
    style.innerHTML = `
      .human-container {
          position: absolute;
          left: ${rect.right + 20 + window.scrollX}px;
          top: ${rect.bottom - 120 + window.scrollY}px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          background: rgba(15, 23, 42, 0.75);
          padding: 10px;
          border-radius: 12px;
          font-size: 14px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 
                     inset 0 1px rgba(255, 255, 255, 0.1);
          width: 150px;
          height: 100px;
          text-align: center;
      }
      .human-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: white;
      }
      .human-circle-container {
          position: relative;
          width: 100px;
          height: 60px;
          margin: 0 auto;
      }
      .human-circle {
          fill: transparent;
          stroke: rgb(56, 189, 248);
          stroke-width: 10;
          transition: stroke-dashoffset 1.5s ease-in-out;
      }
      .human-text {
          font-size: 40px;
          font-weight: bold;
          fill: white;
      }
      @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      }
      .loading-spinner {
          animation: spin 1s linear infinite;
          transform-origin: center;
      }`;
    document.head.appendChild(style);
  }

  let container = document.querySelector(".human-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "human-container";
    container.innerHTML = `
      <div class="human-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-venetian-mask">
              <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7h-5a8 8 0 0 0-5 2 8 8 0 0 0-5-2H2Z"></path>
              <path d="M6 11c1.5 0 3 .5 3 2-2 0-3 0-3-2Z"></path>
              <path d="M18 11c-1.5 0-3 .5-3 2 2 0 3 0 3-2Z"></path>
          </svg>
          ${text}
      </div>
      <div class="human-circle-container">
          <svg width="100" height="60" viewBox="0 0 120 120" class="loading-spinner">
              <circle cx="60" cy="60" r="48" stroke="white" stroke-width="8" fill="none" stroke-dasharray="75" stroke-linecap="round"/>
          </svg>
          <svg width="100" height="60" viewBox="0 0 120 120" style="display: none;" class="score-display">
              <circle class="human-circle" cx="60" cy="60" r="48" stroke-dasharray="301.59" stroke-dashoffset="301.59" transform="rotate(-90 60 60)"/>
              <text x="60" y="60" text-anchor="middle" dominant-baseline="middle" class="human-text">0</text>
          </svg>
      </div>`;
    document.body.appendChild(container);
  }

  // Add resize event listener to update position
  const updatePosition = () => {
    const rect = stageFrame.getBoundingClientRect();
    container.style.left = `${rect.right + 20 + window.scrollX}px`;
    container.style.top = `${rect.bottom - 100 + window.scrollY}px`;
  };

  // Add resize and scroll event listeners
  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition);

  // Update display and animate when score is provided
  if (score !== null) {
    const loadingSpinner = container.querySelector(".loading-spinner");
    const scoreDisplay = container.querySelector(".score-display");
    const progressCircle = container.querySelector(".human-circle");
    const scoreText = container.querySelector(".human-text");

    loadingSpinner.style.display = "none";
    scoreDisplay.style.display = "block";
    scoreText.textContent = score;

    // Animate the circle with a smooth transition
    const circumference = 2 * Math.PI * 48; // 2πr where r=48
    const offset = circumference - (score / 100) * circumference;
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;

    // Trigger reflow to ensure transition works
    progressCircle.getBoundingClientRect();
    progressCircle.style.strokeDashoffset = offset;
  }
}
/**
 * Creates and inserts a draggable menu into the DOM.
 * @param {Function} onStartCallback - Callback function that receives the configuration object:
 * {
 *   isActive: boolean,
 *   submitDelay: { min: number, max: number },
 *   answerDelay: number,
 *   typingStyle: string
 * }
 */
export function initDraggableMenu(onStartCallback) {
  // 1. CREATE THE MENU CONTAINER
  const menu = document.createElement("div");
  menu.id = "autoWritingMenu";
  menu.innerHTML = `
    <div class="menu-header">
      <button class="menu-title">
        <svg id="toggleArrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Auto Writing
      </button>
    </div>
    <div class="menu-body" style="display: none;">
      <div class="menu-row">
        <label>Submit delay:</label>
        <div class="input-group">
          <div class="input-with-unit">
            <input type="number" min="0" step="1" value="0" id="submitDelay1">
            <span class="input-unit">sec</span>
          </div>
          <span>-</span>
          <div class="input-with-unit">
            <input type="number" min="0" step="1" value="0" id="submitDelay2">
            <span class="input-unit">sec</span>
          </div>
        </div>
      </div>
      <div class="menu-row" style="gap: 2px !important;">
        <label>Answer delay:</label>
        <div class="typing-dropdown answer-delay-dropdown" style="margin-left: 10px;">
          <button class="dropdown-btn" id="answerDelayBtn">None</button>
          <div class="dropdown-content">
            <div class="dropdown-option" data-value="none">None</div>
            <div class="dropdown-option" data-value="custom">Custom</div>
          </div>
        </div>
        <div class="input-with-unit custom-delay-input" style="display: none; width: 100px;">
          <input type="number" min="0" step="1" value="0" id="answerDelay">
          <span class="input-unit">wpm</span>
        </div>
      </div>
      <div class="menu-row">
        <label>Typing Style:</label>
        <div class="typing-dropdown">
          <button class="dropdown-btn" id="typingStyleBtn">None</button>
          <div class="dropdown-content">
            <div class="dropdown-option" data-value="default">None</div>
            <div class="dropdown-option" data-value="level1">Level 1</div>
            <div class="dropdown-option" data-value="level2">Level 2</div>
            <div class="dropdown-option" data-value="level3">Level 3</div>
          </div>
        </div>
      </div>
      <div class="menu-row">
        <label>Placeholder:</label>
        <div class="typing-dropdown">
          <button class="dropdown-btn" id="placeholderBtn">None</button>
          <div class="dropdown-content">
            <div class="dropdown-option" data-value="default">None</div>
            <div class="dropdown-option" data-value="enabled">Enabled</div>
            <div class="dropdown-option" data-value="disabled">Disabled</div>
          </div>
        </div>
      </div>
      
    </div>
  `;
  document.body.appendChild(menu);

  // 2. ADD STYLES
  const style = document.createElement("style");
  style.textContent = `
    #autoWritingMenu {
      position: fixed;
      top: 100px;
      left: 100px;
      width: 280px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.1);
      border-radius: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 999999;
      cursor: default;
      color: white;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2),
                 0 0 0 1px rgba(56, 189, 248, 0.1);
    }
    .menu-header {
      background: rgba(30, 41, 59, 0.5);
      font-weight: 500;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(56, 189, 248, 0.1);
      border-radius: 12px 12px 0 0;
      position: relative;
      overflow: hidden;
    }
    
    /* Add new animation styles */
    .menu-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(56, 189, 248, 0.2),
        rgba(56, 189, 248, 0.4),
        rgba(56, 189, 248, 0.2),
        transparent
      );
      transition: 0.5s;
      opacity: 0;
    }
    
    .menu-header.active::before {
      opacity: 1;
      animation: borderAnimation 2s linear infinite;
    }
    
    @keyframes borderAnimation {
      0% {
        left: -100%;
      }
      100% {
        left: 100%;
      }
    }

    .menu-title {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(56, 189, 248, 0.1);
      border-radius: 6px;
      color: white;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
    }
    .menu-title:hover {
      background: rgba(56, 189, 248, 0.1);
    }
    .menu-title.active {
      background: rgba(56, 189, 248, 0.2);
      border-color: rgba(56, 189, 248, 0.3);
      color: rgb(186, 230, 253);
    }
    #toggleArrow {
      cursor: pointer;
      transition: all 0.2s;
    }
    #toggleArrow:hover {
      opacity: 0.8;
    }
    #startAutoWritingBtn {
      margin-left: auto;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 13px;
      transition: all 0.2s;
    }
    #startAutoWritingBtn:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    #startAutoWritingBtn.active {
      background: rgba(59, 130, 246, 0.5);
      border-color: rgba(59, 130, 246, 0.7);
      color: rgb(219, 234, 254);
    }
    input {
      margin-bottom: 0 !important;
      background: rgba(30, 41, 59, 0.4) !important;
      border: 1px solid rgba(56, 189, 248, 0.1) !important;
      color: white !important;
      border-radius: 4px;
      padding: 2px 6px;
    }
    input[type="number"] {
      width: 50px !important;
    }
    .menu-body {
      display: none;
      padding: 16px;
      flex-direction: column;
      gap: 12px;
    }
    .menu-body.show {
      display: flex !important;
    }
    .menu-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      height: 32px;  /* Fixed height for all rows */
    }
    .menu-row label {
      width: 100px;  /* Fixed width for labels */
      margin-right: 4px;
      opacity: 0.9;
    }
    .menu-levels {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .level-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-left: 8px;
      width: 100%;
    }
    .level-options > div {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      transition: background 0.2s;
      cursor: pointer;
    }
    .level-options > div:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .menu-levels input[type="radio"] {
      margin: 0;
      cursor: pointer;
    }
    .menu-levels label {
      margin: 0;
      cursor: pointer;
      font-size: 13px;
    }
    .typing-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .typing-option {
      width: 100%;
      padding: 6px 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: white;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 13px;
    }
    
    .typing-option:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .typing-option.active {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    .typing-dropdown {
      position: relative;
      width: 150px;
      height: 28px;
    }
    
    .dropdown-btn {
      width: 100%;
      height: 100%;
      padding: 0 12px;
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(56, 189, 248, 0.1);
      border-radius: 4px;
      color: white;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
    }

    .dropdown-btn::after {
      content: '▼';
      font-size: 10px;
      margin-left: 8px;
    }

    .dropdown-content {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(56, 189, 248, 0.1);
      border-radius: 4px;
      margin-top: 4px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .typing-dropdown.active .dropdown-content {
      display: block;
    }

    .dropdown-option {
      padding: 8px 12px;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
      font-size: 13px;
    }

    .dropdown-option:hover {
      background: rgba(56, 189, 248, 0.1);
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 28px;  /* Match other elements */
    }

    .input-with-unit {
      position: relative;
      width: 60px;
      height: 28px;  /* Fixed height for input containers */
    }

    /* Remove spinner buttons for Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Remove spinner buttons for Firefox */
    input[type="number"] {
      -moz-appearance: textfield;
    }

    .input-with-unit input {
      width: 100% !important;
      height: 100% !important;  /* Make input fill container */
      padding-right: 28px !important;
      padding-left: 8px !important;
      text-align: left;
      box-sizing: border-box;
    }

    .input-unit {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      pointer-events: none;
    }

    /* Ensure all inputs have consistent styling */
    input[type="number"],
    .dropdown-btn {
      background: rgba(30, 41, 59, 0.4) !important;
      border: 1px solid rgba(56, 189, 248, 0.1) !important;
      border-radius: 4px;
      color: white !important;
    }

    .answer-delay-dropdown {
      margin-right: 8px;
    }

    .custom-delay-input {
      transition: all 0.3s ease;
    }
  `;
  document.head.appendChild(style);

  // 3. DRAGGABLE LOGIC
  const header = menu.querySelector(".menu-header");
  let offsetX = 0,
    offsetY = 0;
  let isDragging = false;

  header.addEventListener("mousedown", (e) => {
    // Only start drag if user didn't click the settings icon or inputs
    if (
      e.target.id === "toggleArrow" ||
      e.target.id === "submitDelay1" ||
      e.target.id === "submitDelay2" ||
      e.target.id === "answerDelay"
    ) {
      return;
    }
    isDragging = true;
    offsetX = e.clientX - menu.offsetLeft;
    offsetY = e.clientY - menu.offsetTop;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent selecting text while dragging
    menu.style.left = e.clientX - offsetX + "px";
    menu.style.top = e.clientY - offsetY + "px";
  });

  // 4. TOGGLE ARROW LOGIC
  const menuTitle = menu.querySelector(".menu-title");
  const menuBody = menu.querySelector(".menu-body");

  // Separate handlers for settings icon and Auto Writing button
  const settingsIcon = menu.querySelector("#toggleArrow");

  // Settings icon only toggles menu
  settingsIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    menuBody.classList.toggle("show");
  });

  // Add right-click handler for the menu header
  header.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const submitDelay1 = document.querySelector("#submitDelay1");
    const submitDelay2 = document.querySelector("#submitDelay2");
    const answerDelay = document.querySelector("#answerDelay");
    const answerDelayBtn = document.querySelector("#answerDelayBtn");
    const typingStyleBtn = document.querySelector("#typingStyleBtn");

    // Validate configuration
    if (
      (submitDelay1.value === "0" && submitDelay2.value === "0") ||
      parseInt(submitDelay1.value) > parseInt(submitDelay2.value)
    ) {
      alert("Error at submit delay");
      return;
    }

    if (
      answerDelay.value === "0" &&
      answerDelayBtn.textContent.trim() === "Custom"
    ) {
      alert("Error at answer delay");
      return;
    }

    // Toggle active state for both title and header
    menuTitle.classList.toggle("active");
    header.classList.toggle("active");

    // Collect configuration data
    const config = {
      isActive: menuTitle.classList.contains("active"),
      submitDelay: {
        min: parseInt(submitDelay1.value) || 0,
        max: parseInt(submitDelay2.value) || 0,
      },
      answerDelay: parseInt(answerDelay.value) || 0,
      typingStyle: typingStyleBtn.textContent.trim(),
      placeholder: document.querySelector("#placeholderBtn").textContent.trim(),
    };

    // Call the callback with the configuration
    if (typeof onStartCallback === "function") {
      onStartCallback(config);
    }
  });

  console.log("Finished 4th step");

  // 6. OPTIONAL: LEVEL BUTTONS
  const levelRadios = menu.querySelectorAll('input[name="level"]');
  levelRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        const level = radio.value;
        // Insert custom logic for level selection here
      }
    });
  });

  // Add dropdown functionality for both dropdowns
  const dropdowns = menu.querySelectorAll(".typing-dropdown");

  dropdowns.forEach((dropdown) => {
    const btn = dropdown.querySelector(".dropdown-btn");
    const options = dropdown.querySelectorAll(".dropdown-option");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Close all other dropdowns first
      dropdowns.forEach((d) => {
        if (d !== dropdown) {
          d.classList.remove("active");
        }
      });
      dropdown.classList.toggle("active");
    });

    options.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedValue = option.getAttribute("data-value");
        btn.textContent = option.textContent;
        dropdown.classList.remove("active");

        // Handle custom input for answer delay dropdown
        if (dropdown.classList.contains("answer-delay-dropdown")) {
          const customDelayInput = menu.querySelector(".custom-delay-input");
          if (selectedValue === "custom") {
            customDelayInput.style.display = "block";
          } else {
            customDelayInput.style.display = "none";
            document.querySelector("#answerDelay").value = "0";
          }
        }

        updateConfig();
      });
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("active");
    });
  });

  // Function to update configuration
  function updateConfig() {
    const config = {
      isActive: menuTitle.classList.contains("active"),
      submitDelay: {
        min: parseInt(document.querySelector("#submitDelay1").value) || 0,
        max: parseInt(document.querySelector("#submitDelay2").value) || 0,
      },
      answerDelay:
        document.querySelector("#answerDelayBtn").textContent === "Custom"
          ? parseInt(document.querySelector("#answerDelay").value) || 0
          : 0,
      typingStyle: document.querySelector("#typingStyleBtn").textContent.trim(),
      placeholder: document.querySelector("#placeholderBtn").textContent.trim(),
    };

    // Validate configuration
    if (config.submitDelay.min > config.submitDelay.max) {
      alert("Minimum submit delay cannot be greater than maximum submit delay");
      return false;
    }

    if (config.answerDelay < 0) {
      alert("Answer delay cannot be negative");
      return false;
    }

    // Call the callback with the updated config
    if (typeof onStartCallback === "function") {
      onStartCallback(config);
    }
    return true;
  }

  // Update dropdown option click handlers
  dropdowns.forEach((dropdown) => {
    const options = dropdown.querySelectorAll(".dropdown-option");
    options.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const btn = dropdown.querySelector(".dropdown-btn");
        const selectedValue = option.getAttribute("data-value");
        btn.textContent = option.textContent;
        dropdown.classList.remove("active");

        // Handle custom input for answer delay dropdown
        if (btn.id === "answerDelayBtn") {
          const customDelayInput = menu.querySelector(".custom-delay-input");
          if (selectedValue === "custom") {
            customDelayInput.style.display = "block";
          } else {
            customDelayInput.style.display = "none";
            document.querySelector("#answerDelay").value = "0";
          }
        }

        // Update configuration after changing dropdown value
        updateConfig();
      });
    });
  });

  // Initialize configuration with default values
  updateConfig();
}
