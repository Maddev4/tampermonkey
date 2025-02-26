// ==UserScript==
// @name         Automatic Writing
// @namespace    Revolt
// @version      1.0
// @description  Automatic writing assistant
// @author       Revolt
// @match        https://r22.core.learn.edgenuity.com/player/
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      localhost
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
/* harmony export */   initDraggableMenu: () => (/* binding */ initDraggableMenu)
/* harmony export */ });
// src/ui.js

function displayHumanElement(score, text, bottom) {
  const stageFrame = document.getElementById("stageFrame");
  if (!stageFrame) return;

  if (!document.querySelector("#custom-human-style")) {
    const rect = stageFrame.getBoundingClientRect();
    let style = document.createElement("style");
    style.id = "custom-human-style";
    style.innerHTML = `
      .human-container {
          position: absolute;
          left: ${rect.right + 20 + window.scrollX}px;
          top: ${rect.bottom - 100 + window.scrollY}px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          background: rgba(24, 24, 27, 0.65);
          padding: 10px;
          border-radius: 12px;
          font-size: 14px;
          box-shadow: inset 0 1px, inset 0 0 0 1px rgba(255, 255, 255, 0.025);
          width: 150px;
          height: 100px; /* Reduced height */
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
          stroke-width: 10;
          transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
      }
      .human-text {
          font-size: 40px;
          font-weight: bold;
          transition: opacity 0.5s ease-in-out, fill 0.3s ease;
      }`;
    document.head.appendChild(style);
  }

  let container = document.createElement("div");
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
        <svg width="100" height="60" viewBox="0 0 120 120">
            <circle class="human-circle progress" cx="60" cy="60" r="48" stroke="gray" stroke-dasharray="301.59" stroke-dashoffset="301.59" transform="rotate(-90 60 60)"></circle>
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="human-text" style="fill: gray;">0</text>
        </svg>
    </div>
    `;
  document.body.appendChild(container);

  // Animate the human and circle progress together
  let progressCircle = container.querySelector(".progress");
  let scoreText = container.querySelector(".human-text");
  let totalFrames = 60; // Approx. 1 second animation at 60fps
  let frame = 0;

  function animate() {
    frame++;
    let progress = Math.min(frame / totalFrames, 1);
    let currentScore = Math.round(progress * score);
    let offset = 301.59 - (currentScore / 100) * 301.59;

    scoreText.textContent = currentScore;
    progressCircle.style.strokeDashoffset = offset;

    if (frame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      progressCircle.style.stroke = "green";
      scoreText.style.fill = "white";
    }
  }

  requestAnimationFrame(animate);
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
      background: rgba(24, 24, 27, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 999999;
      cursor: default;
      color: white;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
    .menu-header {
      background: rgba(255, 255, 255, 0.05);
      font-weight: 500;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px 12px 0 0;
    }
    .menu-title {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: white;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
    }
    .menu-title:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .menu-title.active {
      background: rgba(59, 130, 246, 0.5);
      border-color: rgba(59, 130, 246, 0.7);
      color: rgb(219, 234, 254);
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
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
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
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
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
      background: rgba(24, 24, 27, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      margin-top: 4px;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
      background: rgba(255, 255, 255, 0.1);
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
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
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
    // Only start drag if user didn't click the "Start" button or arrow
    if (
      e.target.id === "startAutoWritingBtn" ||
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
    e.stopPropagation(); // Prevent triggering the menu-title click
    menuBody.classList.toggle("show");
  });

  // // Menu title click handler
  // menuTitle.addEventListener("click", (e) => {
  //   // Ignore clicks on the settings icon
  //   if (e.target === settingsIcon || e.target.closest("#toggleArrow")) {
  //     return;
  //   }

  //   // Toggle active state first
  //   menuTitle.classList.toggle("active");

  //   // Then update configuration
  //   // updateConfig();
  // });

  console.log("Finished 4th step");

  // 5. "START" BUTTON LOGIC
  const startButton = menu.querySelector(".menu-header");
  startButton.addEventListener("click", () => {
    const submitDelay1 = document.querySelector("#submitDelay1");
    const submitDelay2 = document.querySelector("#submitDelay2");
    const answerDelay = document.querySelector("#answerDelay");
    const answerDelayBtn = document.querySelector("#answerDelayBtn");
    const typingStyleBtn = document.querySelector("#typingStyleBtn");

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

    menuTitle.classList.toggle("active");

    // Collect all the configuration data
    const config = {
      isActive: menuTitle.classList.contains("active"),
      submitDelay: {
        min: parseInt(submitDelay1.value) || 0,
        max: parseInt(submitDelay2.value) || 0,
      },
      answerDelay: parseInt(answerDelay.value) || 0,
      typingStyle: typingStyleBtn.textContent.trim(),
      placeholder: placeholderBtn.textContent.trim(),
    };

    // Pass the configuration to the callback
    if (typeof onStartCallback === "function") {
      onStartCallback(config);
    } else {
      console.warn("No start callback provided!");
    }
  });

  console.log("Finished 5th step");

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

  function submitWriting(submitBtn, questions, answers) {
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
          const response = await (0,_api_js__WEBPACK_IMPORTED_MODULE_0__.getHumanScore)(answers);
          const scores = response.humanScore;

          console.log("Scores:", scores);
          (0,_ui_js__WEBPACK_IMPORTED_MODULE_1__.displayHumanElement)(scores, "Human Score", 170);

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

  function createTypingAnimation(editor, text, config, onComplete) {
    const words = text.split(" ");
    let currentIndex = 0;
    editor.setData("");

    const msPerWord = (60 * 1000) / (config.answerDelay || 30); // Default to 30 WPM if not set
    const typingStyle = config.typingStyle;
    const placeholderEnabled = config.placeholder === "Enabled";
    const placeholderText =
      "This topic has many sides to consider, each offering unique insights required to understand.";

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
                    "Level 1": 0.05,
                    "Level 2": 0.15,
                    "Level 3": 0.25,
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
      if (placeholderEnabled) {
        // Type placeholder first
        await typeText(placeholderText, true);
        // Wait a bit to simulate thinking
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Delete placeholder
        await deletePlaceholder();
        // Wait a bit before typing real answer
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Type actual answer
      await typeText(text, false);

      // Complete the animation
      if (onComplete) onComplete();
    };

    // Start the typing process
    setTimeout(() => {
      startTyping();
    }, 2000);
  }

  async function activateAutomaticWriting() {
    console.log("Get started!!!~~~~~~~~~~~!!!");

    // 1. INITIALIZE THE DRAGGABLE MENU
    (0,_ui_js__WEBPACK_IMPORTED_MODULE_1__.initDraggableMenu)((conf) => {
      console.log("Config:", conf);
      config = conf;
    }); // <--- Add this line to show the UI

    const stageFrame = getStageFrame();
    if (!stageFrame) return;

    interval = setInterval(async () => {
      if (stop) {
        console.log("Stopping script because pastContent is detected.");
        clearInterval(interval); // Stop the script from running further
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
          (0,_ui_js__WEBPACK_IMPORTED_MODULE_1__.displayHumanElement)(scores, "Human Score", 170);
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

        editor.setData("Sit tight while Revolt generates a response... ✨");

        try {
          // const res = await getAnswer(text?.innerText);
          // console.log(res);
          // const answer = res.humanizedText;
          // console.log("Answer:", answer);

          const answer = `The High Renaissance – my most favored period in art history. It's just the coolest thing, isn't it? The years from 15th to 17th century Italy Florence, Rome and Venice were home to some of the most iconic artists and works we see among us that inspires us till the date.
          The High Renaissance – my most favored period in art history. It's just the coolest thing, isn't it? The years from 15th to 17th century Italy Florence, Rome and Venice were home to some of the most iconic artists and works we see among us that inspires us till the date.
          The High Renaissance – my most favored period in art history. It's just the coolest thing, isn't it? The years from 15th to 17th century Italy Florence, Rome and Venice were home to some of the most iconic artists and works we see among us that inspires us till the date.
          `;

          createTypingAnimation(editor, answer, config, () => {
            const submitBtn =
              stageFrame.contentWindow.document.getElementById(
                "SubmitButton"
              ) ||
              stageFrame.contentWindow.document.querySelector(
                ".uibtn.uibtn-blue.uibtn-med.uibtn-alt"
              );
            submitBtn.disabled = false;
            submitWriting(submitBtn, text?.innerText, answer);
          });
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
            console.log("Key:", key);
            const editor = stageFrame.contentWindow.CKEDITOR.instances[key];
            const question = stageFrame.contentDocument
              .getElementById(editor.name)
              ?.parentElement?.querySelector("p")?.innerText;
            console.log("Question:", question);

            let siteNumber = question?.match(/\( *Site *[0-9]+ *\)/g)?.join("");
            siteNumber = siteNumber?.replace(/\( *Site *([0-9]+) *\)/, "$1");

            editor.setData("Sit tight while Revolt generates a response... ✨");

            let answers = [],
              questions = [];

            try {
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
                // const res = await getAnswer(extractedText + "\n" + question);
                // const answer = res.humanizedText.replace(/\*/g, "");
                const answer = `The High Renaissance – my most favored period in art history. It's just the coolest thing, isn't it? The years from 15th to 17th century Italy Florence, Rome and Venice were home to some of the most iconic artists and works we see among us that inspires us till the date.`;
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
                      submitWriting(
                        submitBtn,
                        questions,
                        answers,
                        needToAnswer
                      );
                    }
                  });
                }
              }
            } catch (error) {
              console.error("Error processing link:", error);
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