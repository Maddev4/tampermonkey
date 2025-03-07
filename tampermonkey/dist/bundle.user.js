// ==UserScript==
// @name         Automatic Writing
// @namespace    Revolt
// @version      1.1
// @description  Automatic writing assistant for Edgenuity
// @author       Revolt
// @match        https://*.core.learn.edgenuity.com/player/
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @connect      *
// ==/UserScript==
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/api.js":
/*!********************!*\
  !*** ./src/api.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getAnswer: () => (/* binding */ getAnswer),
/* harmony export */   getHumanScore: () => (/* binding */ getHumanScore),
/* harmony export */   saveDB: () => (/* binding */ saveDB)
/* harmony export */ });
// src/api.js

async function getAnswer(prompt) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://localhost:3000/api/process",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ prompt }),
      onload: function (response) {
        if (response.status === 200) {
          try {
            const data = JSON.parse(response.responseText);
            resolve(data);
          } catch (e) {
            reject("JSON parse error: " + e);
          }
        } else {
          reject("API failed with status: " + response.status);
        }
      },
      onerror: function (error) {
        reject("API error: " + error);
      },
    });
  });
}

async function getHumanScore(answers) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://localhost:3000/api/process/human-score",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ answers }),
      onload: function (response) {
        if (response.status === 200) {
          try {
            const data = JSON.parse(response.responseText);
            resolve(data);
          } catch (e) {
            reject("JSON parse error: " + e);
          }
        } else {
          reject("API failed with status: " + response.status);
        }
      },
      onerror: function (error) {
        reject("API error: " + error);
      },
    });
  });
}

async function saveDB(question, answer, score) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://localhost:3000/api/answer",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        question,
        answer,
        score,
      }),
      onload: function (response) {
        if (response.status === 200) {
          try {
            const data = JSON.parse(response.responseText);
            resolve(data);
          } catch (e) {
            reject("JSON parse error: " + e);
          }
        } else {
          reject("API failed with status: " + response.status);
        }
      },
      onerror: function (error) {
        reject("API error: " + error);
      },
    });
  });
}


/***/ }),

/***/ "./src/ui.js":
/*!*******************!*\
  !*** ./src/ui.js ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   displayHumanElement: () => (/* binding */ displayHumanElement),
/* harmony export */   displayLessonNumber: () => (/* binding */ displayLessonNumber),
/* harmony export */   initDraggableMenu: () => (/* binding */ initDraggableMenu)
/* harmony export */ });
// src/ui.js
function displayHumanElement(text, score = null) {
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
function initDraggableMenu(onStartCallback) {
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
function displayLessonNumber(number) {
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./api.js */ "./src/api.js");
/* harmony import */ var _ui_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui.js */ "./src/ui.js");
// src/main.js




(function () {
  "use strict";

  let stop = false,
    interval,
    config = {};

  function getStageFrame() {
    return document.getElementById("stageFrame")
      ? document.getElementById("stageFrame")
      : null;
  }

  function submitWriting(submitBtn, questions, answers, scores) {
    submitBtn.click();
    console.log("Clicked!!!!");

    setTimeout(async () => {
      const gradeBar = document.getElementById("lessonInfo");
      const value = gradeBar.querySelectorAll('thspan[data-rwthpgen="1"]');
      console.log("Length:", value.length, value);
      if (value.length === 4) {
        const number = value[2];
        console.log("gradeBar:", gradeBar, number);
        if (number.textContent.trim() === "100") {
          console.log("Answers:", answers);
          console.log("Scores:", scores);

          if (scores) {
            if (typeof scores === "number") {
              if (scores >= 90) {
                await (0,_api_js__WEBPACK_IMPORTED_MODULE_0__.saveDB)(questions, answers, scores);
              }
            } else {
              for (let i = 0; i < scores.length; i++) {
                if (scores[i] >= 90) {
                  await (0,_api_js__WEBPACK_IMPORTED_MODULE_0__.saveDB)(questions[i], answers[i], scores[i]);
                }
              }
            }
          }
        }
      }
    }, 15000);
  }

  // Helper functions for humanized typing
  function createTypingMistake(word, typingStyle) {
    const mistakeTypes = {
      swap: (w) => {
        if (w.length < 2) return w;
        const i = Math.floor(Math.random() * (w.length - 1));
        return w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2);
      },
      typo: (w) => {
        const nearby = {
          a: "sq",
          b: "vn",
          c: "xv",
          d: "sf",
          e: "wr",
          f: "dg",
          g: "fh",
          h: "gj",
          i: "uo",
          j: "hk",
          k: "jl",
          l: "k",
          m: "n",
          n: "bm",
          o: "ip",
          p: "o",
          q: "a",
          r: "et",
          s: "ad",
          t: "ry",
          u: "yi",
          v: "bc",
          w: "e",
          x: "c",
          y: "tu",
          z: "",
        };
        if (w.length < 1) return w;
        const i = Math.floor(Math.random() * w.length);
        const char = w[i].toLowerCase();
        const typoChar = nearby[char]
          ? nearby[char][Math.floor(Math.random() * nearby[char].length)]
          : char;
        return w.slice(0, i) + typoChar + w.slice(i + 1);
      },
      shuffle: (w) =>
        w
          .split("")
          .sort(() => Math.random() - 0.5)
          .join(""),
    };

    const mistakeType =
      typingStyle === "Level 1"
        ? "swap"
        : typingStyle === "Level 2"
        ? "typo"
        : "shuffle";
    console.log("Mistake Type:", mistakeType);
    return mistakeTypes[mistakeType](word);
  }

  async function createTypingAnimation(editor, text, config, onComplete) {
    const words = text.split(" ");
    let currentIndex = 0;
    editor.setData("");

    const msPerWord = (60 * 1000) / (config.answerDelay || 30); // Default to 30 WPM if not set
    const typingStyle = config.typingStyle;
    const placeholderEnabled = config.placeholder === "Enabled";
    const placeholderText =
      "This topic has many sides to consider, each offering unique insights required to understand.";

    // Skip placeholder if this is a placeholder typing call
    const isPlaceholderCall = text === placeholderText;

    const typeText = async (textToType, isPlaceholder = false) => {
      return new Promise((resolve) => {
        let wordIndex = 0;
        const words = textToType.split(" ");

        const typeWord = () => {
          if (wordIndex < words.length) {
            let word = words[wordIndex];
            let letterIndex = 0;
            const letters = word.split("");
            let mistakeMode = false;
            let mistakeText = "";
            let backspacing = false;

            const typeLetter = () => {
              if (backspacing) {
                if (mistakeText.length > 0) {
                  mistakeText = mistakeText.slice(0, -1);
                  let baseText =
                    wordIndex === 0
                      ? ""
                      : words.slice(0, wordIndex).join(" ") + " ";
                  editor.setData(baseText + mistakeText);
                  setTimeout(typeLetter, msPerWord / word.length);
                } else {
                  backspacing = false;
                  mistakeMode = false;
                  letterIndex = 0;
                  setTimeout(typeLetter, msPerWord / word.length);
                }
                return;
              }

              // Only make typing mistakes for actual answer, not placeholder
              if (!isPlaceholder && !mistakeMode && letterIndex === 0) {
                const mistakeChance =
                  {
                    "Level 1": 0.1,
                    "Level 2": 0.25,
                    "Level 3": 0.4,
                  }[typingStyle] || 0;

                mistakeMode = Math.random() < mistakeChance;
                if (mistakeMode) {
                  mistakeText = createTypingMistake(word);
                }
              }

              if (
                letterIndex <
                (mistakeMode ? mistakeText.length : letters.length)
              ) {
                let baseText =
                  wordIndex === 0
                    ? ""
                    : words.slice(0, wordIndex).join(" ") + " ";
                let currentWord = mistakeMode
                  ? mistakeText.slice(0, letterIndex + 1)
                  : letters.slice(0, letterIndex + 1).join("");

                editor.setData(baseText + currentWord);
                letterIndex++;

                if (mistakeMode && letterIndex === mistakeText.length) {
                  backspacing = true;
                  setTimeout(typeLetter, msPerWord / 2);
                  return;
                }

                setTimeout(typeLetter, msPerWord / word.length);
              } else {
                let completeText =
                  words.slice(0, wordIndex).join(" ") +
                  (wordIndex > 0 ? " " : "") +
                  (mistakeMode ? mistakeText : word);

                editor.setData(completeText);
                wordIndex++;
                setTimeout(typeWord, msPerWord);
              }
            };

            typeLetter();
          } else {
            resolve();
          }
        };

        typeWord();
      });
    };

    const deletePlaceholder = async () => {
      return new Promise((resolve) => {
        let text = editor.getData();
        const deleteChar = () => {
          if (text.length > 0) {
            text = text.slice(0, -1);
            editor.setData(text);
            setTimeout(deleteChar, msPerWord / 10); // Faster deletion
          } else {
            resolve();
          }
        };
        deleteChar();
      });
    };

    const startTyping = async () => {
      // Only handle placeholder if this is not a placeholder typing call
      if (placeholderEnabled && !isPlaceholderCall) {
        await typeText(placeholderText, true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await deletePlaceholder();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Type the main text
      await typeText(text, isPlaceholderCall);

      if (onComplete) onComplete();
    };

    // Start the typing process
    setTimeout(() => {
      startTyping();
    }, 2000);
  }

  async function activateAutomaticWriting() {
    let matchingEnrollment;
    console.log("Get started!!!~~~~~~~~~~~!!!");

    const lms_base_url = initialization?.InitialLaunchData?.LMSAPIBasePath;
    const prefix = lms_base_url.split("//")[1].split(".")[0];
    console.log("lms_base_url:", prefix);

    const session_user_id = initialization?.InitialLaunchData?.UserID;
    console.log("Session User ID:", session_user_id);

    const cookie_user_id = initialization?.pk;
    console.log("Cookie User ID:", cookie_user_id);

    // Get course name from the span element
    const courseName = initialization?.InitialLaunchData?.CourseName;
    console.log("Course name:", courseName);

    (0,_ui_js__WEBPACK_IMPORTED_MODULE_1__.displayLessonNumber)(initialization?.InitialActivityData?.Progress);

    // Get next activity data
    // Add click event listener to Next Activity button
    const nextActivityButton = document.querySelector("a.footnav.goRight");
    if (nextActivityButton) {
      nextActivityButton.addEventListener("click", async () => {
        console.log("Next Activity Button clicked!!!!");
        try {
          console.log("Fetching next activity data...");

          const activityId = initialization?.InitialActivityData?.ActivityOrder;
          console.log("Activity ID:", activityId);
          const ContextID = initialization?.InitialLaunchData?.ContextID;
          console.log("Context ID:", ContextID);

          const nextActivityResponse = await fetch(
            `https://${prefix}.core.learn.edgenuity.com/lmsapi/req/navigation/getnextactivity?UserID=${session_user_id}&StudentBuildID=${ContextID}&ActivityOrder=${activityId}&IsSSLimited=False&AllowPretestsAndQuizzes=False`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!nextActivityResponse.ok) {
            throw new Error(
              `HTTP error! status: ${nextActivityResponse.status}`
            );
          }

          const nextActivityData = await nextActivityResponse.json();
          const { IsRestrictedActivity } = nextActivityData?.Navigation;
          console.log("Is Restricted:", IsRestrictedActivity);

          if (IsRestrictedActivity) {
            // Add brilliant shadow border if activity is restricted
            let waitForContainer;
            const intervalFunc = () => {
              const stageFrame = getStageFrame();
              const overlayContainers =
                stageFrame?.contentWindow.document.querySelectorAll(
                  ".overlay-attempt"
                );
              const overlayContainer = Array.from(overlayContainers).find(
                (container) =>
                  container.querySelector(
                    ".overlay-attempt-button.overlay-attempt-button-lock"
                  )
              );
              if (overlayContainer) {
                overlayContainer.style.cursor = "pointer";
                overlayContainer.style.border =
                  "2px solid rgba(255, 215, 0, 0.7)";
                overlayContainer.style.transition = "all 0.3s ease";

                overlayContainer.addEventListener("mouseenter", () => {
                  overlayContainer.style.boxShadow =
                    "0 0 20px 10px rgba(255, 215, 0, 0.7)";
                });

                overlayContainer.addEventListener("mouseleave", () => {
                  overlayContainer.style.boxShadow = "none";
                });

                overlayContainer.addEventListener("click", () => {
                  overlayContainer.style.transform = "scale(0.95)";
                  overlayContainer.style.boxShadow =
                    "0 0 30px 15px rgba(255, 215, 0, 0.9)";
                  setTimeout(() => {
                    overlayContainer.style.transform = "scale(1)";
                    overlayContainer.style.boxShadow = "none";
                  }, 200);
                });
                overlayContainer.onclick = async () => {
                  console.log(
                    "Initial Activity Order:",
                    initialization?.InitialActivityData?.ActivityOrder
                  );

                  // window.parent.Namespace.global().playerView.startActivity(
                  //   initialization?.InitialActivityData?.ActivityOrder,
                  //   function (warning) {
                  //     if (warning == "NOATTEMPT")
                  //       window.parent.Namespace.global()
                  //         .playerView.stageView()
                  //         .loadUrl(
                  //           window.parent.Namespace.global().services.overlay
                  //             .basepath +
                  //             "?errormessage=" +
                  //             encodeURIComponent(
                  //               "You do not have any retakes available for this Assessment."
                  //             )
                  //         );
                  //   }
                  // );

                  const loadQuestion = async (
                    id,
                    parsedAnswers,
                    ActivityKeys
                  ) => {
                    const parser = new DOMParser();
                    let learningObjectKey = ActivityKeys.learningObjectKey;
                    let resultKey = ActivityKeys.resultKey;
                    let enrollmentKey = ActivityKeys.enrollmentKey;
                    let sessionKey = ActivityKeys.sessionKey;

                    return fetch(
                      `https://${prefix}.core.learn.edgenuity.com/ContentViewers/AssessmentViewer/LoadQuestion`,
                      {
                        headers: {
                          "content-type":
                            "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                        body: `learningObjectKey=${learningObjectKey}&resultKey=${resultKey}&enrollmentKey=${enrollmentKey}&questionKey=${id}&sessionKey=${sessionKey}`,
                        method: "POST",
                      }
                    )
                      .then((res) => res.json())
                      .then((res) => {
                        const html = parser.parseFromString(
                          res.html,
                          "text/html"
                        );

                        let inputSelector =
                          ".Practice_Question_Body .answer-choice input";
                        let selectSelector =
                          ".Practice_Question_Body select option";
                        let inputTextSelector = "input[type='text']";

                        let inputs = Array.from(
                          html.querySelectorAll(inputSelector)
                        ).map((li) => [li.name, li.value]);
                        console.log("Inputs:", inputs);
                        let selects = Array.from(
                          html.querySelectorAll(selectSelector)
                        )
                          .map((option) => {
                            if (option.hasAttribute("value")) {
                              return [option.parentElement.name, option.value];
                            }
                          })
                          .filter(Boolean);
                        let inputTexts = Array.from(
                          html.querySelectorAll(inputTextSelector)
                        ).map((input) => [input.name, "FILL_WITH_TEXT"]);
                        // console.log("YO BITH", inputs, selects, inputTexts);

                        let answers = inputs.concat(selects).concat(inputTexts);
                        let correctAnswers = parsedAnswers.filter((x) =>
                          x.question_id.includes(id)
                        );

                        return changeQuestionAnswer(
                          answers,
                          id,
                          correctAnswers,
                          ActivityKeys
                        );
                      });
                  };

                  const changeQuestionAnswer = async (
                    answers,
                    id,
                    correctAnswers,
                    ActivityKeys
                  ) => {
                    // console.log(answers, id, correctAnswers);

                    let answerToChange = [];
                    answers.find((answer) => {
                      correctAnswers.forEach((correctAnswer) => {
                        if (correctAnswer.question_id.includes(answer[1])) {
                          answerToChange.push([answer[0], answer[1]]);
                        } else if (
                          answer[1] == "on" &&
                          correctAnswer.question_id == answer[0]
                        ) {
                          answerToChange.push([answer[0], answer[1]]);
                        } else if (answer[1] == "FILL_WITH_TEXT") {
                          answerToChange.push([
                            answer[0],
                            correctAnswer.optional_data
                              .trim()
                              .replace(/"/g, ""),
                          ]);
                        }
                      });
                    });

                    return fetch(
                      `https://${prefix}.core.learn.edgenuity.com/ContentViewers/AssessmentViewer/ChangeQuestionAnswer`,
                      {
                        headers: {
                          "content-type":
                            "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                        body: `learningObjectKey=${
                          ActivityKeys.learningObjectKey
                        }&resultKey=${ActivityKeys.resultKey}&enrollmentKey=${
                          ActivityKeys.enrollmentKey
                        }&sessionKey=${
                          ActivityKeys.sessionKey
                        }&language=0&questionKey=${id}${answerToChange
                          .map((answer) => `&${answer[0]}=${answer[1]}`)
                          .join("")}`,
                        method: "POST",
                      }
                    )
                      .then((res) => res.json())
                      .then((res) => {
                        // console.log(res);
                      });
                  };

                  try {
                    const ltiLaunchResponse = await fetch(
                      `https://${prefix}.core.learn.edgenuity.com/Player/LTILaunch`,
                      {
                        headers: {
                          "content-type": "application/x-www-form-urlencoded",
                        },
                        body: Object.keys(initialization.InitialLaunchData)
                          .map(
                            (key) =>
                              `${key}=${encodeURIComponent(
                                initialization.InitialLaunchData[key]
                              )}`
                          )
                          .join("&"),
                        method: "POST",
                      }
                    );

                    const ltiLaunchHtml = await ltiLaunchResponse.text();
                    const parser = new DOMParser();
                    const html = parser.parseFromString(
                      ltiLaunchHtml,
                      "text/html"
                    );
                    const form = html.querySelector("form");
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData);
                    console.log("Data:", data);

                    const ltiLoginResponse = await fetch(
                      `https://${prefix}.core.learn.edgenuity.com/contentviewers/ltilogin`,
                      {
                        headers: {
                          "content-type": "application/x-www-form-urlencoded",
                        },
                        body: Object.keys(data)
                          .map(
                            (key) => `${key}=${encodeURIComponent(data[key])}`
                          )
                          .join("&"),
                        method: "POST",
                      }
                    );

                    const ltiLoginHtml = await ltiLoginResponse.text();
                    const loginHtml = parser.parseFromString(
                      ltiLoginHtml,
                      "text/html"
                    );
                    const launchData =
                      loginHtml.getElementById("launchdata").value;
                    console.log(
                      "Launch Data:",
                      `${launchData.substring(0, 10)}...`
                    );

                    const activityResponse = await fetch(
                      `https://${prefix}.core.learn.edgenuity.com/ContentViewers/AssessmentViewer/Activity`,
                      {
                        headers: {
                          "content-type": "application/x-www-form-urlencoded",
                        },
                        body: `launchdata=${launchData}`,
                        method: "POST",
                      }
                    );

                    const activityHtml = await activityResponse.text();
                    const parsedHtml = parser.parseFromString(
                      activityHtml,
                      "text/html"
                    );

                    const ids = Array.from(
                      parsedHtml.querySelectorAll(".question-buttons ol li")
                    )
                      .slice(1, -1)
                      .map((li) => li.id);

                    console.log("Ids:", ids);
                    let parsedAnswers = [];
                    // const keyFromGM = GM_getValue("user_key", null);
                    // console.log("Key From GM:", keyFromGM);
                    // const userId = getUserID() || "null";
                    // console.log("User ID:", userId);
                    // const dbAnswers = await retrieveAnswersFromDB(
                    //   ids,
                    //   keyFromGM,
                    //   userId
                    // );
                    // parsedAnswers = JSON.parse(dbAnswers.responseText);

                    // parsedAnswers = parsedAnswers.map((x) => {
                    //   if (x.question_id.startsWith("nq:")) {
                    //     x.question_id = x.question_id.slice(3);
                    //   }
                    //   return x;
                    // });

                    const ActivityKeys = {};
                    parsedHtml.querySelectorAll("script").forEach((script) => {
                      const scriptContent = script.textContent;
                      if (scriptContent.includes("ActivityKeys")) {
                        const keys = scriptContent.match(
                          /this\.[a-zA-Z]+Key = "(.*?)";/g
                        );
                        keys.forEach((key) => {
                          const keyName = key.match(/this\.([a-zA-Z]+Key)/)[1];
                          const keyValue = key.match(/"([^"]+)"/)[1];
                          ActivityKeys[keyName] = keyValue;
                        });
                      }
                    });

                    console.log("Activity Keys:", ActivityKeys);

                    await Promise.all(
                      ids.map((id) =>
                        loadQuestion(id, parsedAnswers, ActivityKeys)
                      )
                    );

                    await fetch(
                      `https://${prefix}.core.learn.edgenuity.com/contentengineapi/api/assessment/SubmitAssessmentSimpleResponse?learningObjectKey=${ActivityKeys.learningObjectKey}&resultKey=${ActivityKeys.resultKey}&enrollmentKey=${ActivityKeys.enrollmentKey}&sessionKey=${ActivityKeys.sessionKey}&autoSubmitted=false&UpdateLastTime=true`
                    );

                    // window.location.reload();
                  } catch (error) {
                    console.error("Error in overlay click handler:", error);
                  }
                };
                clearInterval(waitForContainer);
              }
            };

            waitForContainer = setInterval(intervalFunc, 3000);
          }

          // Check if eNotes button exists and activity type starts with 'A'
          const eNotesBtn = document.getElementById("aEnotes");
          if (nextActivityData.NextObjectType?.startsWith("A") && eNotesBtn) {
            eNotesBtn.click();
          }
        } catch (error) {
          console.error("Error fetching next activity data:", error);
        }
      });
    }

    (0,_ui_js__WEBPACK_IMPORTED_MODULE_1__.initDraggableMenu)((conf) => {
      console.log("Config:", conf);
      config = conf;
    });

    const stageFrame = getStageFrame();
    if (!stageFrame) return;

    interval = setInterval(async () => {
      if (stop) {
        console.log("Stopping script because pastContent is detected.");
        clearInterval(interval);
        return;
      }

      const examTitle = document.getElementById("activity-title")?.innerText;
      if (
        !examTitle ||
        document.getElementById("activity-status")?.innerText === "Complete"
      ) {
        const journalText = stageFrame?.contentWindow.document
          .getElementById("journal-ckeditor")
          ?.innerText?.trim();
        const linkText = stageFrame?.contentWindow.document
          .querySelector(".OnlineContent-textArea-div")
          ?.innerText?.trim();

        let pastContent = journalText || linkText;
        console.log("Completed!!!!!!!", pastContent);
        if (pastContent) {
          stop = true;
          const scores = 77;
          (0,_ui_js__WEBPACK_IMPORTED_MODULE_1__.displayHumanElement)("Human Score", scores);
          clearInterval(interval); // Stop execution
        }
        return;
      }

      if (!config.isActive) {
        console.log("Start button not clicked yet.");
        return;
      }

      if (!stageFrame.contentWindow?.CKEDITOR) {
        console.log("CKEditor not displayed!!!!!");
        return;
      }

      const links = stageFrame.contentDocument?.querySelectorAll(
        "#contentViewer #OnlineContent-Links .weblink"
      );
      console.log("Links:", links);

      if (!links?.length) {
        clearInterval(interval);
        const text =
          stageFrame.contentWindow.document.getElementById("journal-prompt") ||
          stageFrame.contentWindow.document.querySelector(
            ".text-box-container"
          );
        const editor =
          stageFrame.contentWindow.CKEDITOR.instances["Answer"] ||
          stageFrame.contentWindow.CKEDITOR.instances["essay-Content"];

        try {
          (0,_ui_js__WEBPACK_IMPORTED_MODULE_1__.displayHumanElement)("Human Score");

          // Create a promise that resolves after placeholder typing or immediately if disabled
          const placeholderPromise =
            config.placeholder === "Enabled"
              ? new Promise((resolve) => {
                  const placeholderText =
                    "This topic has many sides to consider, each offering unique insights required to understand.";
                  editor.setData(""); // Clear any existing content
                  createTypingAnimation(
                    editor,
                    placeholderText,
                    { ...config, typingStyle: "None" },
                    () => {
                      // Then backspace it character by character
                      let text = placeholderText;
                      const backspaceInterval = setInterval(() => {
                        if (text.length > 0) {
                          text = text.slice(0, -1);
                          editor.setData(text);
                        } else {
                          clearInterval(backspaceInterval);
                          resolve();
                        }
                      }, 50); // Backspace every 50ms
                    }
                  );
                })
              : Promise.resolve();

          // Wait for both placeholder typing and 5-second delay
          const [res, _] = await Promise.all([
            (0,_api_js__WEBPACK_IMPORTED_MODULE_0__.getAnswer)(text?.innerText),
            placeholderPromise,
          ]);
          console.log(res);
          const answer = res.humanizedText;
          console.log("Journal Answer:", answer);

          const response = await (0,_api_js__WEBPACK_IMPORTED_MODULE_0__.getHumanScore)(answer);
          const scores = response.humanScore;
          console.log("Journal scores:", scores);
          (0,_ui_js__WEBPACK_IMPORTED_MODULE_1__.displayHumanElement)("Human Score", scores);

          createTypingAnimation(
            editor,
            answer,
            {
              ...config,
              placeholder: "Disabled",
            },
            () => {
              const submitBtn =
                stageFrame.contentWindow.document.getElementById(
                  "SubmitButton"
                ) ||
                stageFrame.contentWindow.document.querySelector(
                  ".uibtn.uibtn-blue.uibtn-med.uibtn-alt"
                );
              submitBtn.disabled = false;
              submitWriting(submitBtn, text?.innerText, answer, scores);
            }
          );
        } catch (error) {
          console.error("Error:", error);
        }
      } else {
        console.log("Links length:", links.length);
        clearInterval(interval);
        let answered = 0;
        const needToAnswer = Object.keys(
          stageFrame.contentWindow.CKEDITOR.instances
        ).length;
        console.log("needToAnswer:", needToAnswer);

        Object.keys(stageFrame.contentWindow.CKEDITOR.instances).forEach(
          async (key) => {
            const editor = stageFrame.contentWindow.CKEDITOR.instances[key];
            const question = stageFrame.contentDocument
              .getElementById(editor.name)
              ?.parentElement?.querySelector("p")?.innerText;
            console.log("Question:", question);

            try {
              // Create a promise for placeholder typing
              const placeholderPromise =
                config.placeholder === "Enabled"
                  ? new Promise((resolve) => {
                      const placeholderText =
                        "This topic has many sides to consider, each offering unique insights required to understand.";
                      editor.setData(""); // Clear any existing content

                      // First type the placeholder text
                      createTypingAnimation(
                        editor,
                        placeholderText,
                        { ...config, typingStyle: "None" },
                        () => {
                          // Then backspace it character by character
                          let text = placeholderText;
                          const backspaceInterval = setInterval(() => {
                            if (text.length > 0) {
                              text = text.slice(0, -1);
                              editor.setData(text);
                            } else {
                              clearInterval(backspaceInterval);
                              resolve();
                            }
                          }, 50); // Backspace every 50ms
                        }
                      );
                    })
                  : Promise.resolve();

              let siteNumber = question
                ?.match(/\( *Site *[0-9]+ *\)/g)
                ?.join("");
              siteNumber = siteNumber?.replace(/\( *Site *([0-9]+) *\)/, "$1");

              let answers = [],
                questions = [];

              const endpoint = siteNumber
                ? links[parseInt(siteNumber) - 1]?.getAttribute("href")
                : links[0]?.getAttribute("href");

              const response = await fetch(endpoint);
              const aRes = await response.text();
              const parser = new DOMParser();
              const doc = parser.parseFromString(aRes, "text/html");

              doc.querySelector("footer")?.remove();

              const extractedText = ["h1", "h2", "p", "li"].reduce(
                (acc, tag) => {
                  Array.from(doc.getElementsByTagName(tag)).forEach(
                    (element) => {
                      acc += element.textContent?.trim() + " ";
                    }
                  );
                  return acc.trim();
                },
                ""
              );

              const examTitle =
                document.getElementById("activity-title")?.innerText;
              if (
                examTitle === "Online Content" &&
                GM_getValue("settings") &&
                GM_getValue("settings")["auto-writing-use"] ===
                  "Keywords (100% Accuracy)"
              ) {
                editor.setData(extractedText);
                answered++;
              } else {
                (0,_ui_js__WEBPACK_IMPORTED_MODULE_1__.displayHumanElement)("Human Score");

                //   const answer = `The High Renaissance – my most favored period in art history. It's just the coolest thing, isn't it? The years from 15th to 17th century Italy Florence, Rome and Venice were home to some of the most iconic artists and works we see among us that inspires us till the date.
                // The High Renaissance – my most favored period in art history. It's just the coolest thing, isn't it? The years from 15th to 17th century Italy Florence, Rome and Venice were home to some of the most iconic artists and works we see among us that inspires us till the date.
                // The High Renaissance – my most favored period in art history. It's just the coolest thing, isn't it? The years from 15th to 17th century Italy Florence, Rome and Venice were home to some of the most iconic artists and works we see among us that inspires us till the date.
                // `;

                // Wait for both placeholder typing and 5-second delay
                const [res, _] = await Promise.all([
                  (0,_api_js__WEBPACK_IMPORTED_MODULE_0__.getAnswer)(extractedText),
                  placeholderPromise,
                ]);

                const answer = res.humanizedText;
                console.log("Online Content Answer:", answer);

                const response = await (0,_api_js__WEBPACK_IMPORTED_MODULE_0__.getHumanScore)(answer);
                const scores = response.humanScore;
                console.log("Online Content scores:", scores);
                (0,_ui_js__WEBPACK_IMPORTED_MODULE_1__.displayHumanElement)("Human Score", scores);
                answers.push(answer);
                questions.push(question);

                if (!config.isActive) {
                  editor.setData(answer);
                  answered++;
                } else {
                  createTypingAnimation(editor, answer, config, () => {
                    answered++;
                    if (answered === needToAnswer) {
                      const submitBtn =
                        stageFrame.contentWindow.document.getElementById(
                          "SubmitQuestionsButton"
                        );
                      submitBtn.disabled = false;
                      submitWriting(submitBtn, questions, answers, scores);
                    }
                  });
                }
              }
            } catch (error) {
              console.error("Error processing answer:", error);
            }
          }
        );
      }
    }, 1000);
  }

  activateAutomaticWriting();
})();

})();

/******/ })()
;
//# sourceMappingURL=bundle.user.js.map