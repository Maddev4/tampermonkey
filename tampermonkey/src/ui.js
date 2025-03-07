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
          background: #141517;
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
          stroke: #006cff;
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
      <div class="menu-title">REVOLT | BETA</div>
    </div>
    <div class="menu-items">
      <div class="menu-item" id="autoWritingItem">
        <button class="menu-item-button">
          <div class="button-content">
            <div class="settings-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <span class="button-text">Auto writing</span>
          </div>
        </button>
        <div class="menu-item-content" style="display: none;">
          <div class="menu-body">
            <div class="menu-row">
              <label>Submit delay:</label>
              <div class="input-group" style="width: 100%;">
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
            <div class="menu-row">
              <label>Answer delay:</label>
              <div class="typing-dropdown answer-delay-dropdown" style="width: 100% !important;">
                <button class="dropdown-btn" id="answerDelayBtn">None</button>
                <div class="dropdown-content">
                  <div class="dropdown-option" data-value="none">None</div>
                  <div class="dropdown-option" data-value="custom">Custom</div>
                </div>
              </div>
              <div class="input-with-unit custom-delay-input" style="display: none; width: 60px;">
                <input type="number" min="0" step="1" value="0" id="answerDelay" style="width: 60px !important;">
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
        </div>
      </div>
      <div class="menu-item" id="examUnlockerItem">
        <button class="menu-item-button">
          <div class="button-content">
            <div class="unlock-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <span class="button-text">Exam unlocker</span>
          </div>
        </button>
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
      width: 320px;
      background: #141517;
      border-radius: 12px;
      font-family: 'Poppins', system-ui, -apple-system, sans-serif;
      z-index: 999999;
      cursor: default;
      color: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .menu-header {
      background: #222324;
      padding: 15px 20px;
      user-select: none;
      border-radius: 12px 12px 0 0;
    }

    .menu-title {
      color: white;
      font-size: 24px;
      font-weight: 800;
    }

    .menu-items {
      padding: 10px;
    }

    .menu-item {
      margin-bottom: 8px;
    }

    .menu-item-button {
      width: 100%;
      padding: 10px 15px;
      background: #242526;
      border: none;
      border-radius: 6px;
      color: white;
      font-family: 'Poppins', system-ui, -apple-system, sans-serif;
      font-size: 15px;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      transition: background 0.2s;
    }

    .menu-item-button:hover {
      background: #2a2b2c;
    }

    .menu-body {
      padding: 15px;
      background: #1a1b1c;
      border-radius: 6px;
      margin-top: 8px;
    }

    .menu-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      height: 32px;
    }

    .menu-row label {
      min-width: 100px;
      color: white;
      font-size: 15px;
      font-weight: 600;
      opacity: 0.9;
    }

    .input-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .input-with-unit {
      position: relative;
      width: 60px;
    }

    input[type="number"] {
      width: 100%;
      height: 28px;
      padding: 0 25px 0 8px;
      background: #242526;
      border: none;
      border-radius: 4px;
      color: white;
      font-family: 'Poppins', system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      -moz-appearance: textfield;
    }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .input-unit {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.6);
      font-size: 10px;
      pointer-events: none;
    }

    .typing-dropdown {
      position: relative;
      width: 100%;
    }

    .dropdown-btn {
      width: 100%;
      height: 28px;
      padding: 0 10px;
      background: #242526;
      border: none;
      border-radius: 4px;
      color: white;
      font-family: 'Poppins', system-ui, -apple-system, sans-serif;
      font-size: 15px;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .dropdown-btn::after {
      content: '▼';
      font-size: 10px;
      opacity: 0.7;
    }

    .dropdown-content {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: #242526;
      border-radius: 4px;
      margin-top: 4px;
      display: none;
      z-index: 1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
                  0 0 0 1px rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }

    .dropdown-option {
      padding: 8px 10px;
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .dropdown-option:last-child {
      border-bottom: none;
    }

    .dropdown-option:hover {
      background: #2a2b2c;
      padding-left: 15px;
    }

    .typing-dropdown.active .dropdown-content {
      display: block;
    }

    .custom-delay-input {
      transition: all 0.3s ease;
    }

    .button-content {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }

    .settings-icon,
    .unlock-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      transition: all 0.2s ease;
      color: rgba(255, 255, 255, 0.7);
    }

    .settings-icon:hover,
    .unlock-icon:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .button-text {
      flex: 1;
    }
  `;
  document.head.appendChild(style);

  // 3. ADD EVENT LISTENERS
  const autoWritingItem = document.getElementById("autoWritingItem");
  const autoWritingButton = autoWritingItem.querySelector(".menu-item-button");
  const settingsIcon = autoWritingItem.querySelector(".settings-icon");
  const autoWritingContent =
    autoWritingItem.querySelector(".menu-item-content");

  // Toggle menu content
  settingsIcon.addEventListener("click", () => {
    const isExpanded = autoWritingContent.style.display !== "none";
    autoWritingContent.style.display = isExpanded ? "none" : "block";
    autoWritingButton.style.background = isExpanded ? "#242526" : "#2a2b2c";
  });

  // Button click handler (excluding settings icon) - start auto writing
  autoWritingButton.addEventListener("click", (e) => {
    if (e.target.closest(".settings-icon")) {
      return; // Ignore if clicking on settings icon
    }

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

    // Toggle active state
    autoWritingButton.classList.toggle("active");

    // Collect configuration data
    const config = {
      isActive: autoWritingButton.classList.contains("active"),
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

  // Add dropdown functionality
  const dropdowns = menu.querySelectorAll(".typing-dropdown");
  dropdowns.forEach((dropdown) => {
    const btn = dropdown.querySelector(".dropdown-btn");
    const options = dropdown.querySelectorAll(".dropdown-option");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdowns.forEach((d) => {
        if (d !== dropdown) d.classList.remove("active");
      });
      dropdown.classList.toggle("active");
    });

    options.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedValue = option.getAttribute("data-value");
        btn.textContent = option.textContent;
        dropdown.classList.remove("active");

        if (dropdown.classList.contains("answer-delay-dropdown")) {
          const customDelayInput = menu.querySelector(".custom-delay-input");
          if (selectedValue === "custom") {
            customDelayInput.style.display = "block";
          } else {
            customDelayInput.style.display = "none";
            document.querySelector("#answerDelay").value = "0";
          }
        }
      });
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    dropdowns.forEach((dropdown) => dropdown.classList.remove("active"));
  });

  // Make menu draggable
  const header = menu.querySelector(".menu-header");
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  header.addEventListener("mousedown", (e) => {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      menu.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Add event listener for exam unlocker
  const examUnlockerItem = document.getElementById("examUnlockerItem");
  const examUnlockerButton =
    examUnlockerItem.querySelector(".menu-item-button");
  const unlockIcon = examUnlockerItem.querySelector(".unlock-icon");

  unlockIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    // Add your unlock icon click handler here
  });

  examUnlockerButton.addEventListener("click", (e) => {
    if (e.target.closest(".unlock-icon")) {
      return; // Ignore if clicking on unlock icon
    }
    // Add your exam unlocker button click handler here
  });
}

// Add this new function
export function displayLessonNumber(number) {
  const lessonTitle = document.getElementById("lessonInfo");
  if (!lessonTitle) return;

  // Get the width of the lesson title
  const titleWidth = lessonTitle.offsetWidth;
  console.log("Title Width", titleWidth);

  // Add styles if they don't exist
  if (!document.getElementById("lesson-number-style")) {
    const style = document.createElement("style");
    style.id = "lesson-number-style";
    style.textContent = `
      .lesson-number-container {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        z-index: 999999;
        animation: fadeIn 0.3s ease-out;
        height: 120px;
        width: ${titleWidth}px;
        margin: 0 auto;
        font-family: 'Poppins', system-ui, -apple-system, sans-serif;
      }

      .lesson-number {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        font-size: 15px;
        font-weight: 600;
        padding: 8px 12px;
        background: #141517;
        border: 1px solid rgba(0, 108, 255, 0.1);
        border-radius: 12px;
        color: white;
        font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
        height: 80px;
        position: relative;
      }

      .progress-bar {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #242526;
        border-radius: 10px;
      }

      .progress-text {
        margin-top: 8px;
        font-size: 13px;
        opacity: 0.9;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .progress-bar::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 10px;
        width: 100%;
        background: #242526;
        border-radius: 10px;
      }

      .progress-bar::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        height: 10px;
        width: 0%;
        background: #006cff;
        animation: fillBar 1s ease-out forwards;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 108, 255, 0.3);
      }

      @keyframes fillBar {
        from {
          width: 0%;
        }
        to {
          width: calc(100% * var(--progress) / 100);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Create or update the number element
  let container = document.querySelector(".lesson-number-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "lesson-number-container";
    container.style.width = `${titleWidth}px`; // Set width dynamically

    const numberElement = document.createElement("span");
    numberElement.className = "lesson-number";

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    const progressText = document.createElement("div");
    progressText.className = "progress-text";

    numberElement.appendChild(progressBar);
    numberElement.appendChild(progressText);
    container.appendChild(numberElement);

    document.body.appendChild(container);
  } else {
    // Update container width if lesson title width changes
    container.style.width = `${titleWidth}px`;
  }

  // Create ResizeObserver to watch lessonInfo element width changes
  const lessonInfo = document.getElementById("lessonInfo");
  if (lessonInfo) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const lessonInfoWidth = entry.contentRect.width;
        container.style.width = `${lessonInfoWidth}px`;
      }
    });
    resizeObserver.observe(lessonInfo);
  }

  // Update the number with animation
  const numberElement = container.querySelector(".lesson-number");
  const progressText = numberElement.querySelector(".progress-text");

  numberElement.style.animation = "none";
  numberElement.offsetHeight; // Trigger reflow
  numberElement.style.animation = "fadeIn 0.3s ease-out";

  // Set the progress percentage as a CSS variable
  numberElement.style.setProperty("--progress", `${number}`);

  // Update progress text
  progressText.textContent = `You are ${number}% completed`;
}
