import { getCourses, getStageFrame, getIFramePreview } from "./main";

let exampleQuestions = [];

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
      .human-loading-spinner {
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
          <svg width="100" height="60" viewBox="0 0 120 120" class="human-loading-spinner">
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
    const loadingSpinner = container.querySelector(".human-loading-spinner");
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
 * @param {Function} onStartCallback - Callback function for auto writing
 * @param {Function} onExamCallback - Callback function for exam automation
 */
export function initDraggableMenu(onStartCallback, onExamCallback) {
  try {
    // Check if document is ready
    if (!document.body) {
      console.error("Document body not ready");
      // Wait for DOM to be ready
      document.addEventListener("DOMContentLoaded", () => {
        initDraggableMenu(onStartCallback, onExamCallback);
      });
      return;
    }

    // Check for existing menu to prevent duplicates
    const existingMenu = document.getElementById("autoWritingMenu");
    if (existingMenu) {
      existingMenu.remove();
    }

    // 1. CREATE THE MENU CONTAINER
    const menu = document.createElement("div");
    menu.id = "autoWritingMenu";
    menu.innerHTML = `
      <div class="menu-header">
        <div class="menu-title">REVOLT | BETA</div>
      </div>
      <div class="menu-items">
      <div class="menu-item" id="autoVideoItem">
          <button class="menu-item-button">
            <div class="button-content">
              <div class="video-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
              <span class="button-text">Auto Video</span>
            </div>
          </button>
        </div>
        <div class="menu-item" id="autoInstructionItem">
          <button class="menu-item-button">
            <div class="button-content">
              <div class="instruction-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <span class="button-text">Auto Instruction</span>
            </div>
          </button>
        </div>
        <div class="menu-item" id="autoAdvanceItem">
          <button class="menu-item-button">
            <div class="button-content">
              <div class="rocket-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                </svg>
              </div>
              <span class="button-text">Auto Advance</span>
            </div>
          </button>
          <div class="menu-item-content" style="display: none;">
            <div class="menu-body">
            <div class="menu-row">
            <label>Advance Type:</label>
                <div class="typing-dropdown" style="width: 100%;">
                  <button class="dropdown-btn" id="autoAdvanceTypeBtn">Select type</button>
                  <div class="dropdown-content">
                    <div class="dropdown-option" data-value="activity">Activity Advance</div>
                    <div class="dropdown-option" data-value="unlocked">Unlocked Advance</div>
                  </div>
                </div>
                </div>
              </div>
                  </div>
                </div>
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
              <div class="custom-placeholder-input" style="display: none;">
                <textarea 
                  id="placeholderText" 
                  placeholder="Enter custom placeholder text..."
                  rows="3"
                >This topic has many sides to consider, each offering unique insights required to understand.</textarea>
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
              <span class="button-text">Auto Exam</span>
            </div>
          </button>
          <div class="menu-item-content" style="display: none;">
            <div class="menu-body">
              <div class="menu-row">
                <label>Exam Info:</label>
                <div class="typing-dropdown">
                  <button class="dropdown-btn" id="examInfoBtn">Disabled</button>
                  <div class="dropdown-content">
                    <div class="dropdown-option" data-value="enabled">Enabled</div>
                    <div class="dropdown-option" data-value="disabled">Disabled</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="menu-item" id="autoVocabItem">
          <button class="menu-item-button">
            <div class="button-content">
              <div class="wordbook-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <span class="button-text">Auto Vocabulary</span>
            </div>
          </button>
        </div>
      </div>
    `;

    // Create and append styles first
    const style = document.createElement("style");
    style.id = "autoWritingMenuStyle"; // Add ID to prevent duplicate styles
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
        cursor: grab;
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
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .menu-item-button:hover {
        background: #2a2b2c;
      }

      .menu-item-button.active {
        background: #006cff;
        animation: pulse 2s infinite;
      }

      .menu-item-button.writing {
        background: #006cff;
        animation: writing-pulse 2s infinite;
      }

      .menu-item-button.writing::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        animation: wave 2s linear infinite;
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(0, 108, 255, 0.4);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(0, 108, 255, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(0, 108, 255, 0);
        }
      }

      @keyframes writing-pulse {
        0% {
          box-shadow: 0 0 5px rgba(0, 108, 255, 0.5),
                      0 0 10px rgba(0, 108, 255, 0.3);
        }
        50% {
          box-shadow: 0 0 10px rgba(0, 108, 255, 0.7),
                      0 0 20px rgba(0, 108, 255, 0.5);
        }
        100% {
          box-shadow: 0 0 5px rgba(0, 108, 255, 0.5),
                      0 0 10px rgba(0, 108, 255, 0.3);
        }
      }

      @keyframes wave {
        0% {
          left: -100%;
        }
        100% {
          left: 100%;
        }
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
        z-index: 1;
        margin-top: 4px;
        display: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }

      .dropdown-option {
        text-align: left;
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

      .typing-dropdown.active .dropdown-content1 {
        height: 380px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
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
      .unlock-icon,
      .rocket-icon,
      .video-icon,
      .instruction-icon {
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
      .unlock-icon:hover,
      .rocket-icon:hover,
      .video-icon:hover,
      .instruction-icon:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .button-text {
        flex: 1;
      }

      /* Editor Writing Animation */
      .cke_editable.writing-active {
        position: relative;
        border: 1px solid rgba(0, 108, 255, 0.3) !important;
        box-shadow: 0 0 10px rgba(0, 108, 255, 0.2) !important;
      }

      .cke_editable.writing-active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, #006cff, transparent);
        animation: writing 2s ease-out infinite;
      }

      @keyframes writing {
        0% {
          width: 0;
          opacity: 1;
        }
        50% {
          width: 100%;
          opacity: 1;
        }
        100% {
          width: 100%;
          opacity: 0;
        }
      }

      .custom-placeholder-input {
        margin-top: 8px;
        transition: all 0.3s ease;
      }

      .custom-placeholder-input textarea {
        width: 100%;
        padding: 8px 12px;
        background: #242526;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        color: white;
        font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 600;
        resize: vertical;
        min-height: 80px;
        line-height: 1.5;
      }

      .custom-placeholder-input textarea:focus {
        outline: none;
        border-color: rgba(0, 108, 255, 0.5);
        box-shadow: 0 0 0 2px rgba(0, 108, 255, 0.2);
      }

      #examUnlockerItem .menu-item-button.active {
        background: #006cff;
        animation: pulse 2s infinite;
      }

      #examUnlockerItem .menu-body {
        padding: 15px;
        background: #1a1b1c;
        border-radius: 6px;
        margin-top: 8px;
      }

      .exam-panel-header {
        cursor: grab;
        user-select: none;
        border-radius: 12px 12px 0 0;
      }

      .exam-panel-header:active {
        cursor: grabbing;
      }

      .loading-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .loading-overlay.show {
        opacity: 1;
      }

      .loading-spinner-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top-color: #006cff;
        animation: spin 1s ease-in-out infinite;
      }

      .loading-text {
        color: white;
        margin-top: 16px;
        font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;

    // Check if styles already exist
    if (!document.getElementById("autoWritingMenuStyle")) {
      document.head.appendChild(style);
    }

    // Now append the menu
    document.body.appendChild(menu);

    // 2. ADD EVENT LISTENERS
    const autoWritingItem = document.getElementById("autoWritingItem");
    const autoWritingButton =
      autoWritingItem.querySelector(".menu-item-button");
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
        return;
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

      // Update button state
      const isActive = !autoWritingButton.classList.contains("active");
      updateAutoWritingState(isActive ? "active" : "idle");

      // Collect configuration data
      const config = {
        isActive: autoWritingButton.classList.contains("active"),
        submitDelay: {
          min: parseInt(submitDelay1.value) || 0,
          max: parseInt(submitDelay2.value) || 0,
        },
        answerDelay: parseInt(answerDelay.value) || 0,
        typingStyle: typingStyleBtn.textContent.trim(),
        placeholder: document
          .querySelector("#placeholderBtn")
          .textContent.trim(),
        placeholderText:
          document.querySelector("#placeholderBtn").textContent.trim() ===
          "Enabled"
            ? document.querySelector("#placeholderText").value.trim()
            : "",
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

          // Add this block to handle placeholder dropdown
          if (btn.id === "placeholderBtn") {
            const customPlaceholderInput = menu.querySelector(
              ".custom-placeholder-input"
            );
            if (option.textContent === "Enabled") {
              customPlaceholderInput.style.display = "block";
            } else {
              customPlaceholderInput.style.display = "none";
            }
          }

          // Add this block to handle exam info dropdown
          if (btn.id === "examInfoBtn") {
            if (option.textContent === "Enabled") {
              // Example questions array - replace with actual API data
              displayExamPanel(exampleQuestions);
            } else {
              const panel = document.querySelector("#examInfoPanel");
              if (panel) panel.remove();
            }

            // Update exam configuration
            const config = {
              isActive: examUnlockerButton.classList.contains("active"),
              examInfo: option.textContent,
            };

            // Call the callback with the configuration
            if (typeof onExamCallback === "function") {
              onExamCallback(config);
            }
          }
        });
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", () => {
      dropdowns.forEach((dropdown) => dropdown.classList.remove("active"));
    });

    // Update the Auto Advance button click handler
    const autoAdvanceItem = document.getElementById("autoAdvanceItem");
    const autoAdvanceButton =
      autoAdvanceItem?.querySelector(".menu-item-button");
    const rocketIcon = autoAdvanceItem.querySelector(".rocket-icon");
    const autoAdvanceContent =
      autoAdvanceItem.querySelector(".menu-item-content");

    // Toggle menu content when clicking the rocket icon
    rocketIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = autoAdvanceContent.style.display !== "none";
      autoAdvanceContent.style.display = isExpanded ? "none" : "block";
      autoAdvanceButton.style.background = isExpanded ? "#242526" : "#2a2b2c";
      // // Toggle dropdown content when clicking the dropdown button
      // const autoAdvanceTypeBtn = document.querySelector("#autoAdvanceTypeBtn");
      // const dropdownContent = autoAdvanceTypeBtn.nextElementSibling;

      // autoAdvanceTypeBtn.addEventListener("click", (e) => {
      //   e.stopPropagation();
      //   const isActive = dropdownContent.classList.contains("active");

      //   console.log("isActive", isActive);

      //   // Close all other dropdowns first
      //   document.querySelectorAll(".dropdown-content").forEach((content) => {
      //     content.classList.remove("active");
      //   });

      //   // Toggle this dropdown
      //   if (isActive) {
      //     dropdownContent.classList.remove("active");
      //   } else {
      //     dropdownContent.classList.add("active");
      //   }
      // });
    });

    // Handle main button click (excluding rocket icon)
    autoAdvanceButton.addEventListener("click", async (e) => {
      if (e.target.closest(".rocket-icon")) {
        return;
      }

      autoAdvanceButton.classList.add("active");

      const selectedType = document
        .querySelector("#autoAdvanceTypeBtn")
        .textContent.trim();

      if (selectedType === "Select type") {
        alert("Please select an advance type first");
        return;
      }

      // Set tamper value advanceClick as true
      GM_setValue("advanceClick", 1);
      GM_setValue("advanceType", selectedType);

      // Create and show loading overlay
      const loadingOverlay = document.createElement("div");
      loadingOverlay.className = "loading-overlay";
      loadingOverlay.innerHTML = `
          <div class="loading-spinner-container">
            <div class="loading-spinner"></div>
          </div>
        `;
      document.body.appendChild(loadingOverlay);

      // Show loading overlay with animation
      loadingOverlay.style.display = "block";
      loadingOverlay.offsetHeight; // Force reflow
      loadingOverlay.classList.add("show");

      try {
        // Fetch courses
        const courses = await getCourses();

        // Hide loading overlay
        loadingOverlay.classList.remove("show");
        setTimeout(() => {
          loadingOverlay.remove();
        }, 300);

        // Create and show modal
        const modal = await createAutoAdvanceModal(courses);
        if (modal.show) {
          modal.show();
        } else {
          modal.classList.add("show");
          modal.style.display = "block";
        }
      } catch (error) {
        console.error("Error loading courses:", error);

        // Hide loading overlay and show error message
        loadingOverlay.classList.remove("show");
        setTimeout(() => {
          loadingOverlay.remove();
          alert("Failed to load courses. Please try again.");
        }, 300);
      }
    });

    // Add dropdown functionality for auto advance type
    const autoAdvanceDropdown =
      autoAdvanceItem.querySelector(".typing-dropdown");
    const autoAdvanceBtn = autoAdvanceDropdown.querySelector(".dropdown-btn");
    const autoAdvanceOptions =
      autoAdvanceDropdown.querySelectorAll(".dropdown-option");

    autoAdvanceBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // console.log(autoAdvanceDropdown.classList, "autoAdvanceBtn clicked ? ");

      // autoAdvanceDropdown.classList.toggle("active");
      // if (autoAdvanceDropdown.classList.contains("active")) {
      //   autoAdvanceDropdown.classList.remove("active");
      // } else {
      //   autoAdvanceDropdown.classList.add("active");
      // }
    });

    autoAdvanceOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedValue = option.getAttribute("data-value");
        autoAdvanceBtn.textContent =
          selectedValue === "activity"
            ? "Activity Advance"
            : "Unlocked Advance";
        option.classList.remove("active");
      });
    });

    // Update the Auto Vocabulary button click handler
    const autoVocabItem = document.getElementById("autoVocabItem");
    const autoVocabButton = autoVocabItem?.querySelector(".menu-item-button");

    let nextWord = true;
    const stageFrame = getStageFrame();
    autoVocabButton.addEventListener("click", async (e) => {
      // Add wave animation effect
      try {
        if (!stageFrame?.contentWindow) {
          alert("Content Window not found");
          return;
        }
        autoVocabButton.classList.add("active", "writing");
        while (nextWord) {
          const contentWindow = stageFrame?.contentWindow;
          let { viewModel, API, ActivityKeys, initialData } = contentWindow;
          const word = viewModel?.currentWord();
          const wordText = word?.word();
          console.log("Current Word:", wordText);
          const wordTextbox =
            stageFrame?.contentDocument?.querySelector(".word-textbox");
          if (wordTextbox) {
            wordTextbox.value = wordText;

            const keyupEvent = new Event("keyup");
            wordTextbox.dispatchEvent(keyupEvent);

            const url =
              API.E2020.addresses.ContentEngineViewersPath +
              "Vocab/UpdateAttempt?attemptKey=" +
              ActivityKeys.resultKey +
              "&completedWordKey=" +
              word.key +
              "&enrollmentKey=" +
              ActivityKeys.enrollmentKey +
              "&version=" +
              ActivityKeys.version;

            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            });
            const result = await response.json();
            console.log("Result:", result);

            viewModel.currentWord().complete(true);
            console.log("Words:", viewModel.words());
            const currentWordIndex = viewModel.words().indexOf(word);
            nextWord = viewModel.words()[currentWordIndex + 1];
            if (nextWord) {
              console.log("Next Word Rank:", nextWord.rank());
              viewModel.nextAvailableWord(nextWord);
              viewModel.currentWord().nextButton().state(true);
              viewModel.selectWord(nextWord.rank());
            }

            console.log("Complete:", viewModel.complete(), result.complete);
            if (viewModel.complete() || result.complete) {
              initialData.Complete = true;

              stageFrame.src =
                API.E2020.addresses.ContentEngineViewersPath +
                "LTILogin/Complete?enrollmentKey=" +
                ActivityKeys.enrollmentKey;
            }
          } else {
            console.error("Could not find word textbox element");
          }
        }
      } finally {
        autoVocabButton.classList.remove("active", "writing");
      }
    });

    // Update the Auto Video button click handler
    const autoVideoItem = document.getElementById("autoVideoItem");
    const autoVideoButton = autoVideoItem?.querySelector(".menu-item-button");

    autoVideoButton.addEventListener("click", async (e) => {
      autoVideoButton.classList.add("active", "writing");
      const autoVideoInterval = setInterval(async () => {
        try {
          if (!stageFrame?.contentWindow) {
            alert("Content Window not found");
            return;
          }
          const contentWindow = stageFrame?.contentWindow;
          let { API } = contentWindow;

          // Find the activity title element
          const activityTitleElement =
            document.getElementById("activity-title");
          const activityTitle = activityTitleElement
            ? activityTitleElement.textContent.trim().toLowerCase()
            : null;

          const videoElement =
            stageFrame.contentDocument.getElementById("home_video_js");

          let duration = videoElement?.duration || null;
          let currentTime = videoElement?.currentTime || null;

          const isCompleted = API.Frame.isComplete();

          const questionsFrame =
            stageFrame?.contentDocument?.getElementById("iFramePreview");
          const isAVideo = questionsFrame?.style.display === "none";

          console.log("isAVideo", isAVideo);

          if (!isCompleted) {
            if (
              activityTitle &&
              [
                "instruction",
                "warmup",
                "summary",
                "lecture",
                "lablecture",
                "directinstruction",
              ].includes(activityTitle)
            ) {
              if (isAVideo) {
                if (duration - currentTime < 2 && duration != 0) {
                  nextFrame(stageFrame.contentWindow.API);
                  return;
                } else {
                  return;
                }
              }

              const iframePreview = getIFramePreview();
              // console.log("iframePreview", iframePreview);
              if (iframePreview) {
                const questions =
                  iframePreview.contentDocument?.querySelectorAll(
                    "div[fstack]"
                  );

                console.log("Questions:", questions);

                questions.forEach((question) => {
                  setTimeout(() => {
                    let clickedAmount = 0;
                    let input = question.querySelectorAll("input");
                    console.log("Input:", input);
                    if (input && input.length > 0) {
                      Array.from(input).forEach((input) =>
                        Math.random() > 0.5 ? input.click() : null
                      ); // Click a random input
                      clickedAmount++;
                    }

                    let select = question.querySelector("select");
                    // We don't need to do anything here, since edgenuity doesn't require you to select anything in these types of questions.
                    if (select) clickedAmount++;

                    let ifFW = question.querySelector("iframe");
                    let hintButton =
                      ifFW?.contentDocument?.getElementById("onlyButton");
                    if (hintButton) {
                      setInterval(() => {
                        hintButton.click();
                        clickedAmount++;
                      }, 250);
                    }

                    const doneButton =
                      question.querySelectorAll("div[title='done']");
                    if (
                      doneButton &&
                      doneButton.length > 0 &&
                      clickedAmount > 0
                    ) {
                      Array.from(doneButton).forEach((button) =>
                        button.click()
                      );
                      nextFrame(stageFrame);
                    }
                  }, 500);
                });
              }
            }
          } else {
            //   console.log("Activity already completed");
            //   // Find the first incomplete frame and mark it as complete
            //   const firstIncompleteIndex = API.FrameChain.framesStatus.findIndex(
            //     (status) => status !== "complete"
            //   );

            //   if (firstIncompleteIndex !== -1) {
            //     API.FrameChain.framesStatus[firstIncompleteIndex] = "complete";
            //   }
            //   console.log("Next Frame:", API.FrameChain.nextFrame());
            //   autoVideoButton.classList.remove("active", "writing");
            nextFrame(stageFrame);
          }
        } catch (error) {
          console.error("Error:", error);
          autoVideoButton.classList.remove("active", "writing");
        }
      }, 1000);
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
    const examContent = examUnlockerItem.querySelector(".menu-item-content");

    // Toggle menu content when clicking the unlock icon
    unlockIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = examContent.style.display !== "none";
      examContent.style.display = isExpanded ? "none" : "block";
      examUnlockerButton.style.background = isExpanded ? "#242526" : "#2a2b2c";
    });

    // Handle main button click (excluding unlock icon)
    examUnlockerButton.addEventListener("click", (e) => {
      if (e.target.closest(".unlock-icon")) {
        return;
      }

      // Update exam configuration
      const config = {
        isActive: examUnlockerButton.classList.contains("active"),
        examInfo: document.querySelector("#examInfoBtn").textContent.trim(),
      };

      // Call the callback with the configuration
      if (typeof onExamCallback === "function") {
        onExamCallback(config);
      }
    });
  } catch (error) {
    console.error("Error initializing draggable menu:", error);
  }
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

// Add this function to handle button states
export function updateAutoWritingState(state) {
  const autoWritingButton = document.querySelector(
    "#autoWritingItem .menu-item-button"
  );
  if (!autoWritingButton) return;

  // Remove all states first
  autoWritingButton.classList.remove("active", "writing");

  switch (state) {
    case "idle":
      // Default state, no classes needed
      break;
    case "active":
      autoWritingButton.classList.add("active");
      break;
    case "writing":
      autoWritingButton.classList.add("active", "writing");
      break;
  }
}

// Update the createTypingAnimation function
export function createTypingAnimation(editor, text, config, onComplete) {
  // Update button state to writing
  updateAutoWritingState("writing");

  // Add writing animation class to the editor
  const editorElement = editor.container.querySelector(".cke_editable");
  editorElement.classList.add("writing-active");

  // Original typing animation code...
  const words = text.split(" ");
  editor.setData("");

  // When typing is complete
  const originalOnComplete = onComplete;
  onComplete = () => {
    editorElement.classList.remove("writing-active");
    // Keep button in active state but remove writing animation
    updateAutoWritingState("active");
    if (originalOnComplete) {
      originalOnComplete();
    }
  };

  // Rest of the existing typing animation code...
}

// Update the displayExamPanel function with working pagination and scrollable content
export function displayExamPanel(questions = []) {
  console.log("Displaying exam panel");

  // Remove existing panel if it exists
  const existingPanel = document.querySelector("#examInfoPanel");
  if (existingPanel) {
    existingPanel.remove();
  }

  // Update the style to include scrollable content
  if (!document.querySelector("#exam-panel-style")) {
    const style = document.createElement("style");
    style.id = "exam-panel-style";
    style.textContent = `
      #examInfoPanel {
        position: fixed;
        top: 100px;
        transform: translate(0, 0); /* Initial position */
        width: 300px;
        background: #141517;
        border-radius: 12px;
        font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        color: white;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 999998;
        display: flex;
        flex-direction: column;
        max-height: 80vh;
      }

      .exam-panel-header {
        background: #222324;
        padding: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
      }

      .exam-panel-title {
        font-size: 18px;
        font-weight: 600;
        color: white;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .exam-questions-container {
        padding: 15px;
        overflow-y: auto;
        flex-grow: 1;
        height: 400px;
      }

      /* Scrollbar styling */
      .exam-questions-container::-webkit-scrollbar {
        width: 4px;
      }

      .exam-questions-container::-webkit-scrollbar-track {
        background: #1a1b1c;
        border-radius: 4px;
      }

      .exam-questions-container::-webkit-scrollbar-thumb {
        background: #2a2b2c;
        border-radius: 4px;
        transition: all 0.3s ease;
      }

      .exam-questions-container::-webkit-scrollbar-thumb:hover {
        background: #006cff;
      }

      .exam-question-card {
        background: #1a1b1c;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
      }

      .exam-question-card:hover {
        border-color: rgba(0, 108, 255, 0.5);
        box-shadow: 0 0 0 1px rgba(0, 108, 255, 0.2);
        transform: translateX(-4px);
      }

      .question-id {
        color: #006cff;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .question-status {
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
        margin-top: 4px;
      }

      .status-pending {
        background: rgba(255, 170, 0, 0.2);
        color: #ffaa00;
      }

      .status-completed {
        background: rgba(0, 200, 83, 0.2);
        color: #00c853;
      }

      .exam-pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
      }

      .page-info {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      }

      .page-buttons {
        display: flex;
        gap: 8px;
      }

      .page-button {
        background: #242526;
        border: none;
        border-radius: 4px;
        color: white;
        font-family: 'Poppins', system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 600;
        padding: 6px 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .page-button:hover:not(:disabled) {
        background: #2a2b2c;
        transform: translateY(-1px);
      }

      .page-button:active:not(:disabled) {
        transform: translateY(0);
      }

      .page-button.active {
        background: #006cff;
      }

      .page-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .question-details {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 4px;
      }

      .question-type {
        display: inline-block;
        padding: 2px 6px;
        background: rgba(0, 108, 255, 0.1);
        color: #006cff;
        border-radius: 4px;
        font-size: 11px;
        margin-right: 8px;
      }

      .time-remaining {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .time-remaining svg {
        color: #006cff;
      }
    `;
    document.head.appendChild(style);
  }

  // Create the panel
  const panel = document.createElement("div");
  panel.id = "examInfoPanel";

  // Initialize state
  let currentPage = 1;
  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;

  function handleDragStart(e) {
    const header = e.target.closest(".exam-panel-header");
    if (!header) return;

    e.preventDefault();
    isDragging = true;

    // Get current panel position
    const transform = window.getComputedStyle(panel).transform;
    const matrix = new DOMMatrixReadOnly(transform);
    offsetX = matrix.m41;
    offsetY = matrix.m42;

    // Get start position
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;

    // Add temporary event listeners
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleDragEnd);
  }

  function handleDrag(e) {
    if (!isDragging) return;

    e.preventDefault();

    // Calculate new position
    let newX = e.clientX - startX;
    let newY = e.clientY - startY;

    // Get viewport and panel dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelRect = panel.getBoundingClientRect();

    // Constrain to viewport bounds
    newX = Math.min(Math.max(newX, 0), viewportWidth - panelRect.width);
    newY = Math.min(Math.max(newY, 0), viewportHeight - panelRect.height);

    // Update panel position
    panel.style.transform = `translate(${newX}px, ${newY}px)`;
  }

  function handleDragEnd() {
    isDragging = false;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", handleDragEnd);
  }

  // Add main drag event listener
  panel.addEventListener("mousedown", handleDragStart);

  // Handle window resize to keep panel in bounds
  function handleResize() {
    const rect = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get current transform values
    const transform = window.getComputedStyle(panel).transform;
    const matrix = new DOMMatrixReadOnly(transform);
    let currentX = matrix.m41;
    let currentY = matrix.m42;

    // Adjust position if outside viewport
    if (rect.right > viewportWidth) {
      currentX = viewportWidth - rect.width;
    }
    if (rect.bottom > viewportHeight) {
      currentY = viewportHeight - rect.height;
    }

    panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
  }

  window.addEventListener("resize", handleResize);

  // Add cleanup function to remove event listeners
  panel.cleanup = () => {
    panel.removeEventListener("mousedown", handleDragStart);
    window.removeEventListener("resize", handleResize);
  };

  function renderPanel() {
    const startIdx = (currentPage - 1) * questionsPerPage;
    const endIdx = startIdx + questionsPerPage;
    const currentQuestions = questions.slice(startIdx, endIdx);

    // Store the old transform value
    const oldTransform = panel.style.transform;

    panel.innerHTML = `
      <div class="exam-panel-header">
        <div class="exam-panel-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Exam Questions (${questions.length})
        </div>
      </div>
      <div class="exam-questions-container">
        ${currentQuestions
          .map(
            (q) => `
          <div class="exam-question-card">
            <div class="question-id">${q}</div>
            <div class="question-details">
              <span class="question-type">Assessment Question</span>
            </div>
            <div class="question-status status-pending">
              Pending
            </div>
            <div class="time-remaining">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Time remaining
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      <div class="exam-pagination">
        <div class="page-info">
          ${totalPages ? `Page ${currentPage} of ${totalPages}` : ""}
        </div>
        <div class="page-buttons">
          <button class="page-button" ${
            !totalPages || currentPage === 1 ? "disabled" : ""
          } id="prevPage">
            ←
          </button>
          <button class="page-button" ${
            !totalPages || currentPage === totalPages ? "disabled" : ""
          } id="nextPage">
            →
          </button>
        </div>
      </div>
    `;

    // Restore the transform value
    panel.style.transform = oldTransform;

    // Add pagination button listeners
    const prevButton = panel.querySelector("#prevPage");
    const nextButton = panel.querySelector("#nextPage");

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          renderPanel();
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderPanel();
        }
      });
    }
  }

  // Initial render
  renderPanel();
  document.body.appendChild(panel);

  return panel;
}

const setExampleQuestions = (questions) => {
  exampleQuestions = questions;
  // Update the questions array
  exampleQuestions = questions;

  // Re-render the exam panel if it exists
  const existingPanel = document.querySelector("#examInfoPanel");
  if (existingPanel) {
    displayExamPanel(questions);
  }
};

export { setExampleQuestions };

// Add this function to create and handle the auto advance modal
async function createAutoAdvanceModal(courses = []) {
  console.log("createAutoAdvanceModal");
  // Remove all elements with id autoAdvanceModal
  const autoAdvanceModals = document.querySelectorAll("#autoAdvanceModal");
  autoAdvanceModals.forEach((modal) => modal.remove());

  console.log("courses", courses);
  const modalHtml = `
    <div id="autoAdvanceModal" class="modal">
      <div class="modal-content">
        <div class="container1">
          <h1 style="font-size: 32px; margin-top: 30px;">Get <span class="title">school</span> done now</h1>
          <p class="info1">Select a class to get started with Revolt</p>
          <div class="typing-dropdown" style="margin-top: 10px;">
            <button class="dropdown-btn" id="placeholderBtn" style="height: 40px;">Select a class</button>
            <div class="dropdown-content1">
              ${courses
                .map(
                  (course) =>
                    `<div class="dropdown-option" data-value="${course.id}">
                      <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="font-size: 18px; font-weight: 500; color: #fff; margin-bottom: 4px;">${
                          course.subject
                        }</div>
                        <div style="display: flex; flex-direction: row; justify-content: space-between; font-size: 14px; font-weight: 350; color: #fff;">
                          <div>${course.name}</div>
                          <div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="11" stroke="white" stroke-width="2"/>
                              <path d="M10 7L16 12L10 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <div class="progress-bar" style="width: 100%; height: 3px; margin-top: 4px;">
                          <div style="width: ${
                            course.progress
                              ? course.progress.percentComplete
                              : 0
                          }%; height: 100%; background: #006CFF; border-radius: 10px; transition: width 0.3s ease;"></div>
                        </div>
                        ${
                          course.progress
                            ? `<div style="font-size: 12px; color: #9b9d9f;">You are ${course.progress.percentComplete}% complete and Ahead</div>`
                            : ""
                        }
                      </div>
                    </div>`
                )
                .join("")}
            </div>
          </div>
          <p class="info" id="cancelModalBtn" style="cursor: pointer;">Cancel</p>
        </div>
      </div>
    </div>
  `;

  // Update the modal styles to include animation
  const modalStyle = `
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      font-family: Arial, sans-serif;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
    }

    .modal.show {
      opacity: 1;
      z-index: 1000000;
    }

    .modal-content {
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.7);
      width: 540px;
      border-radius: 12px;
      background: #12141a;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .modal.show .modal-content {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }

    @keyframes modalPop {
      0% {
        transform: translate(-50%, -50%) scale(0.7);
        opacity: 0;
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }


    .container1 {
      text-align: center;
      padding: 30px;
      border-radius: 12px;
      height: 300px;
      transition: height 0.5s ease-in-out;
      margin-bottom: 30px;
      overflow-y: hidden;
      scrollbar-width: none;
    }

    .h-400 {
      height: 600px !important;
      overflow-y: scroll;
    }

    .dropdown-content1 {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      height: 0px;
      background: #242526;
      border-radius: 4px;
      z-index: 1;
      margin-top: 4px;
      overflow-y: scroll;
      scrollbar-width: none;
      transition: height 0.4s ease-in-out;
    }

    h1 {
      font-size: 24px;
      font-weight: bold;
      color: white;
      margin: 0;
    }

    .emoji {
      font-size: 24px;
      vertical-align: middle;
    }

    .dropdown {
      background: #23252b;
      color: white;
      border: none;
      padding: 10px;
      width: 100%;
      border-radius: 6px;
      font-size: 16px;
      margin-top: 5px;
    }

    .info {
      margin-top: 50px;
      font-size: 14px;
      background: rgba(255, 255, 255, 0.1);
      display: inline-block;
      padding: 6px 12px;
      border-radius: 8px;
      color: white;
    }

    .info1 {
      display: flex !important;
      justify-content: flex-start;
      margin-top: 40px;
      margin-bottom: 5px !important;
      font-size: 14px;
      color: white;
    }

    .title {
      margin-bottom: 0 !important;
      color: #006cff;
    }
  `;

  // Add styles to document
  if (!document.querySelector("#autoAdvanceModalStyle")) {
    const style = document.createElement("style");
    style.id = "autoAdvanceModalStyle";
    style.textContent = modalStyle;
    document.head.appendChild(style);
  }

  // Add modal to document
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Get modal elements
  const modal = document.getElementById("autoAdvanceModal");
  // Add dropdown functionality
  const dropdown = modal.querySelector(".typing-dropdown");
  console.log("dropdowns", dropdown);
  const btn = dropdown.querySelector(".dropdown-btn");
  const options = dropdown.querySelectorAll(".dropdown-option");
  const container1 = modal.querySelector(".container1");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    // Increase container1 height to 400px
    container1.classList.toggle("h-400");
    dropdown.classList.toggle("active");
  });

  options.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      container1.classList.remove("h-400");
      const selectedValue = option.getAttribute("data-value");

      // Redirect to current path + course id
      const currentPath = window.location.href;
      console.log(
        "path:",
        `${currentPath}enrollment/${selectedValue}/coursemap#`
      );
      window.location.href = `${currentPath}enrollment/${selectedValue}/coursemap#`;
      // Show loading spinner overlaid on original content
      const dropdownContent = dropdown.querySelector(".dropdown-content1");
      const spinnerHtml = `
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 100;">
          <div class="loading-spinner" style="width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.1); border-radius: 50%; border-top-color: #006cff; animation: spin 1s ease-in-out infinite;"></div>
        </div>
      `;
      dropdownContent.style.position = "relative";
      dropdownContent.insertAdjacentHTML("beforeend", spinnerHtml);
    });
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    const modalContent = modal.querySelector(".modal-content");
    if (
      !document.getElementById("autoAdvanceItem").contains(e.target) &&
      e.target !== modalContent
    ) {
      hideModal();
    }
  });

  const cancelModalBtn = document.getElementById("cancelModalBtn");
  cancelModalBtn.addEventListener("click", () => {
    hideModal();
  });

  modal.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("modal clicked");
    dropdown.classList.remove("active");
    container1.classList.remove("h-400");
    if (!modal.querySelector(".modal-content").contains(e.target)) {
      hideModal();
    }
  });

  // Show modal with animation
  function showModal() {
    modal.style.display = "block";
    // Trigger reflow
    modal.offsetHeight;
    modal.classList.add("show");
  }

  // Hide modal with animation
  function hideModal() {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
    }, 300); // Match the transition duration
  }

  // Update the display logic when opening the modal
  return {
    show: showModal,
    hide: hideModal,
    element: modal,
  };
}

// Function to handle redirection to current activity
function redirectToCurrentActivity() {
  // Check if we're on the student.edgenuity.com domain
  console.log("Checking for current activity tile...");

  // Set up a function to check for the element
  const checkForCurrentActivity = () => {
    // Find the element with the current activity status
    const currentActivityElement = document.querySelector(
      ".ActivityTile-status-current"
    );

    if (currentActivityElement) {
      // Find the closest parent that has an href (likely an <a> tag)
      let parent = currentActivityElement;
      while (parent && !parent.href) {
        parent = parent.parentElement;
      }

      // If we found an element with href, redirect to it
      if (parent && parent.href) {
        console.log("Found current activity, redirecting to:", parent.href);
        // Set tamper value advanceClick as false
        window.location.href = parent.href;
        console.log("Redirecting to:", parent.href);
      } else {
        console.log("Current activity found but no href attribute available");
      }
      return true; // Element found
    } else {
      console.log("No current activity tile found yet, waiting...");
      return false; // Element not found
    }
  };

  // Try immediately first
  if (!checkForCurrentActivity()) {
    // If not found, set up an interval to keep checking
    const intervalId = setInterval(() => {
      if (checkForCurrentActivity()) {
        clearInterval(intervalId); // Stop checking once found
      }
    }, 1000); // Check every second

    // Stop checking after 30 seconds to prevent infinite loops
    setTimeout(() => {
      clearInterval(intervalId);
      console.log("Gave up waiting for current activity element");
    }, 30000);
  }
}

let checkForStageFrameInterval;
function validateFunction() {
  console.log("Checking for current activity tile...");

  // Try immediately first
  if (!checkForStageFrame()) {
    // If not found, set up an interval to keep checking
    checkForStageFrameInterval = setInterval(() => {
      console.log("checkforstageframe called");
      checkForStageFrame();
    }, 1000); // Check every second
    console.log(
      "checkForStageFrameInterval ##############",
      checkForStageFrameInterval
    );
  }
}

let currentFrame = null;
let videoCheckInterval = null;

function checkForStageFrame() {
  const stageFrame = getStageFrame();

  if (stageFrame && JSON.stringify(stageFrame) !== "{}") {
    console.log("Stage frame found, proceeding with validation");
    return processStageFrame(stageFrame);
  } else {
    console.log("Stage frame not found yet, waiting...");
    return false; // stageFrame not found
  }
}

function processStageFrame(stageFrame) {
  const contentWindow = stageFrame?.contentWindow;
  const autoAdvanceItem = document.getElementById("autoAdvanceItem");
  const autoAdvanceButton = autoAdvanceItem?.querySelector(".menu-item-button");

  let { API } = contentWindow;
  if (
    !API ||
    API?.FrameChain?.currentFrame === currentFrame ||
    (API.FrameChain.currentFrame === 1 && !API?.Video?.wrapper)
  ) {
    console.log("API is not available");
    return false;
  }
  // console.log("Current frame Updated", API?.FrameChain?.currentFrame);
  // currentFrame = API?.FrameChain?.currentFrame;
  console.log("checkForStageFrameInterval", checkForStageFrameInterval);
  clearInterval(checkForStageFrameInterval);
  clearInterval(videoCheckInterval);
  // autoAdvanceButton.classList.add("active", "writing");
  // const isCompleted = API.Frame.isComplete();

  // // Log API information for debugging
  // logAPIInfo(API);

  // // Determine if content is a video or not
  // const isAVideo = checkIfVideo(API);
  // console.log("isAVideo", isAVideo);

  // if (isAVideo) {
  //   handleVideoContent(stageFrame, isCompleted, API, autoAdvanceButton);
  // } else {
  //   handleNonVideoContent(stageFrame, isCompleted, API, autoAdvanceButton);
  // }

  try {
    // Find the activity title element
    const activityTitleElement = document.getElementById("activity-title");
    const activityTitle = activityTitleElement
      ? activityTitleElement.textContent.trim().toLowerCase()
      : null;

    autoAdvanceButton.classList.add("active", "writing");

    const videoElement =
      stageFrame.contentDocument.getElementById("home_video_js");

    let duration = videoElement?.duration || null;
    let currentTime = videoElement?.currentTime || null;

    const isCompleted = API.Frame.isComplete();

    const questionsFrame =
      stageFrame?.contentDocument?.getElementById("iFramePreview");
    const isAVideo = questionsFrame?.style.display === "none";

    console.log("isAVideo", isAVideo);

    if (!isCompleted) {
      if (isAVideo) {
        console.log("Video is playing");
        if (videoCheckInterval) {
          clearInterval(videoCheckInterval);
        }
        videoCheckInterval = setInterval(() => {
          currentTime = videoElement?.currentTime || 0;
          console.log("currentTime", currentTime);
          if (duration - currentTime < 2 && duration != 0) {
            clearInterval(videoCheckInterval);
            nextFrame(API);
            setTimeout(() => {
              checkForStageFrame();
              return;
            }, 5000);
          } else {
            return;
          }
        }, 1000);
        return;
      } else if (activityTitle === "instruction") {
        console.log("Instruction is playing");
        const iframePreview = getIFramePreview();
        // console.log("iframePreview", iframePreview);
        if (iframePreview) {
          const questions =
            iframePreview.contentDocument?.querySelectorAll("div[fstack]");

          console.log("Questions:", questions);

          questions.forEach((question) => {
            setTimeout(() => {
              let clickedAmount = 0;
              let input = question.querySelectorAll("input");
              console.log("Input:", input);
              if (input && input.length > 0) {
                Array.from(input).forEach((input) =>
                  Math.random() > 0.5 ? input.click() : null
                ); // Click a random input
                clickedAmount++;
              }

              let textArea = question.querySelectorAll("textarea");
              console.log("textArea:", textArea);
              if (textArea && textArea.length > 0) {
                Array.from(textArea).forEach((textArea) =>
                  Math.random() > 0.5 ? textArea.click() : null
                ); // Click a random input
                clickedAmount++;
              }

              let select = question.querySelector("select");
              console.log("select", select);
              // We don't need to do anything here, since edgenuity doesn't require you to select anything in these types of questions.
              if (select) clickedAmount++;

              let ifFW = question.querySelector("iframe");
              let hintButton =
                ifFW?.contentDocument?.getElementById("onlyButton");
              if (hintButton) {
                setInterval(() => {
                  hintButton.click();
                  clickedAmount++;
                }, 250);
              }

              const doneButton = question.querySelectorAll("div[title='done']");
              console.log("doneButton", doneButton);
              console.log("clickedAmount", clickedAmount);
              if (doneButton && doneButton.length > 0 && clickedAmount > 0) {
                Array.from(doneButton).forEach((button) => button.click());
                nextFrame(API);
                setTimeout(() => {
                  // checkForStageFrame();
                  validateFunction();
                  return;
                }, 5000);
              }
            }, 500);
          });
        }
        nextFrame(API);
        setTimeout(() => {
          checkForStageFrame();
          return;
        }, 5000);
      } else {
        console.log("Instruction is not playing");
      }
    } else {
      //   console.log("Activity already completed");
      //   // Find the first incomplete frame and mark it as complete
      //   const firstIncompleteIndex = API.FrameChain.framesStatus.findIndex(
      //     (status) => status !== "complete"
      //   );

      //   if (firstIncompleteIndex !== -1) {
      //     API.FrameChain.framesStatus[firstIncompleteIndex] = "complete";
      //   }
      //   console.log("Next Frame:", API.FrameChain.nextFrame());
      //   autoVideoButton.classList.remove("active", "writing");
      nextFrame(API);
      setTimeout(() => {
        checkForStageFrame();
        return;
      }, 5000);
    }
  } catch (error) {
    console.error("Error:", error);
    autoAdvanceButton.classList.remove("active", "writing");
  }
}

function nextFrame(API) {
  // Check if all frames except the current one are complete
  if (API?.FrameChain?.framesStatus) {
    // Check if all frames except the current one are complete
    const currentPosition = API.FrameChain.currentPosition;
    const allOtherFramesComplete = API.FrameChain.framesStatus.every(
      (status, index) => index === currentPosition || status === "complete"
    );

    console.log("Frame statuses:", API.FrameChain.framesStatus);
    console.log("All other frames complete:", allOtherFramesComplete);

    if (!allOtherFramesComplete) {
      console.log(
        "************* Not all frames are complete. Some frames may need attention. *************"
      );
    } else {
      console.log(
        "************* All frames are complete. Proceeding to next frame. *************"
      );
      const advanceType = GM_getValue("advanceType");
      if (advanceType === "Unlocked Advance") {
        const backUrl = GM_getValue("backUrl");
        console.log("backUrl", backUrl);
        GM_setValue("advanceClick", 1);
        window.location.href = backUrl;
      } else {
        console.log("All frames except current are complete.");
        let buttonCheckInterval;
        try {
          // Set up a function to check the button status
          const checkAndClickNextButton = () => {
            const nextActivityButton = document.querySelector(
              'a.footnav.goRight[data-bind*="getNextActivity"]'
            );

            // Check if the Next Activity button is disabled
            const isDisabled =
              nextActivityButton &&
              nextActivityButton.classList.contains("disabled");

            console.log("Next Activity button disabled:", isDisabled);

            // Only proceed if the button exists and is not disabled
            if (nextActivityButton && !isDisabled) {
              console.log(
                "############# Found Next Activity button, clicking it ##############"
              );
              nextActivityButton.click();
              setTimeout(() => {
                checkForStageFrame();
                return;
              }, 3000);

              // Clear the interval once we've clicked the button
              clearInterval(buttonCheckInterval);
            } else if (!nextActivityButton) {
              console.log("Next Activity button not found");
            } else {
              console.log("Next Activity button is disabled, waiting...");
            }
          };

          // Check for the button every 500ms
          buttonCheckInterval = setInterval(checkAndClickNextButton, 500);

          // Clear the interval after 30 seconds to prevent it from running indefinitely
          setTimeout(() => {
            clearInterval(buttonCheckInterval);
            console.log(
              "Stopped checking for Next Activity button after timeout"
            );
          }, 30000);
        } catch (error) {
          console.error(
            "Error finding or clicking Next Activity button:",
            error
          );
        }
      }
    }
    API.FrameChain.nextFrame();
  }
}

// Wait for DOM to be fully loaded before checking for the current activity
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded, executing redirect to current activity");
  if (window.location.hostname === "student.edgenuity.com") {
    if (GM_getValue("advanceClick") === 1) {
      GM_setValue("advanceClick", 2);
      const selectedType = GM_getValue("advanceType");
      if (selectedType === "Unlocked Advance") {
        console.log(
          "Unlocked Advance",
          window.location.href.split("coursemap")[0] + "coursemap"
        );
        GM_setValue(
          "backUrl",
          window.location.href.split("coursemap")[0] + "coursemap"
        );
      }
      redirectToCurrentActivity();
    }
  } else if (
    window.location.hostname.match(/^r\d+\.core\.learn\.edgenuity\.com$/)
  ) {
    if (GM_getValue("advanceClick") === 2) {
      GM_setValue("advanceClick", 0);
      validateFunction();
    }
  }
});
