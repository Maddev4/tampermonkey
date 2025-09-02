// ==UserScript==
// @name         Revolt - Edgenuity Automation
// @namespace    https://github.com/tampermonkey
// @version      1.0.0
// @description  Advanced automation tool for Edgenuity platform with AI-powered content generation and human-like typing
// @author       Revolt Team
// @match        https://student.edgenuity.com/*
// @match        https://*.core.learn.edgenuity.com/*
// @match        https://r*.core.learn.edgenuity.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      localhost
// @connect      *.edgenuity.com
// @connect      *.core.learn.edgenuity.com
// @run-at       document-start
// @license      MIT
// @homepage     https://github.com/revolt-team
// @supportURL   https://github.com/revolt-team/issues
// @updateURL    https://github.com/revolt-team/updates
// @downloadURL  https://github.com/revolt-team/downloads
// ==/UserScript==

(() => {
    "use strict";
    var n = {
        d: (e, t) => {
            for (var o in t) n.o(t, o) && !n.o(e, o) && Object.defineProperty(e, o, {
                enumerable: !0,
                get: t[o]
            })
        },
        o: (n, e) => Object.prototype.hasOwnProperty.call(n, e)
    };
    async function e(n) {
        return new Promise(((e, t) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: "http://localhost:3000/api/process",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    prompt: n
                }),
                onload: function(n) {
                    if (200 === n.status) try {
                        const t = JSON.parse(n.responseText);
                        e(t)
                    } catch (n) {
                        t("JSON parse error: " + n)
                    } else t("API failed with status: " + n.status)
                },
                onerror: function(n) {
                    t("API error: " + n)
                }
            })
        }))
    }
    async function t(n) {
        return new Promise(((e, t) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: "http://localhost:3000/api/process/human-score",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    answers: n
                }),
                onload: function(n) {
                    if (200 === n.status) try {
                        const t = JSON.parse(n.responseText);
                        e(t)
                    } catch (n) {
                        t("JSON parse error: " + n)
                    } else t("API failed with status: " + n.status)
                },
                onerror: function(n) {
                    t("API error: " + n)
                }
            })
        }))
    }
    async function o(n, e, t) {
        return new Promise(((o, i) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: "http://localhost:3000/api/answer",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    question: n,
                    answer: e,
                    score: t
                }),
                onload: function(n) {
                    if (200 === n.status) try {
                        const e = JSON.parse(n.responseText);
                        o(e)
                    } catch (n) {
                        i("JSON parse error: " + n)
                    } else i("API failed with status: " + n.status)
                },
                onerror: function(n) {
                    i("API error: " + n)
                }
            })
        }))
    }
    n.d({}, {
        NJ: () => y,
        Fu: () => v,
        CQ: () => h
    });
    let i, a = [];

    function s(n, e = null) {
        const t = document.getElementById("stageFrame");
        if (!t) return;
        if (!document.querySelector("#custom-human-style")) {
            const n = t.getBoundingClientRect();
            let e = document.createElement("style");
            e.id = "custom-human-style", e.innerHTML = `\n      .human-container {\n          position: absolute;\n          left: ${n.right+20+window.scrollX}px;\n          top: ${n.bottom-120+window.scrollY}px;\n          z-index: 1000;\n          display: flex;\n          flex-direction: column;\n          background: #141517;\n          padding: 10px;\n          border-radius: 12px;\n          font-size: 14px;\n          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), \n                     inset 0 1px rgba(255, 255, 255, 0.1);\n          width: 150px;\n          height: 100px;\n          text-align: center;\n      }\n      .human-title {\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          gap: 4px;\n          color: white;\n      }\n      .human-circle-container {\n          position: relative;\n          width: 100px;\n          height: 60px;\n          margin: 0 auto;\n      }\n      .human-circle {\n          fill: transparent;\n          stroke: #006cff;\n          stroke-width: 10;\n          transition: stroke-dashoffset 1.5s ease-in-out;\n      }\n      .human-text {\n          font-size: 40px;\n          font-weight: bold;\n          fill: white;\n      }\n      @keyframes spin {\n          0% { transform: rotate(0deg); }\n          100% { transform: rotate(360deg); }\n      }\n      .human-loading-spinner {\n          animation: spin 1s linear infinite;\n          transform-origin: center;\n      }`, document.head.appendChild(e)
        }
        let o = document.querySelector(".human-container");
        o || (o = document.createElement("div"), o.className = "human-container", o.innerHTML = `\n      <div class="human-title">\n          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-venetian-mask">\n              <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7h-5a8 8 0 0 0-5 2 8 8 0 0 0-5-2H2Z"></path>\n              <path d="M6 11c1.5 0 3 .5 3 2-2 0-3 0-3-2Z"></path>\n              <path d="M18 11c-1.5 0-3 .5-3 2 2 0 3 0 3-2Z"></path>\n          </svg>\n          ${n}\n      </div>\n      <div class="human-circle-container">\n          <svg width="100" height="60" viewBox="0 0 120 120" class="human-loading-spinner">\n              <circle cx="60" cy="60" r="48" stroke="white" stroke-width="8" fill="none" stroke-dasharray="75" stroke-linecap="round"/>\n          </svg>\n          <svg width="100" height="60" viewBox="0 0 120 120" style="display: none;" class="score-display">\n              <circle class="human-circle" cx="60" cy="60" r="48" stroke-dasharray="301.59" stroke-dashoffset="301.59" transform="rotate(-90 60 60)"/>\n              <text x="60" y="60" text-anchor="middle" dominant-baseline="middle" class="human-text">0</text>\n          </svg>\n      </div>`, document.body.appendChild(o));
        const i = () => {
            const n = t.getBoundingClientRect();
            o.style.left = `${n.right+20+window.scrollX}px`, o.style.top = `${n.bottom-100+window.scrollY}px`
        };
        if (window.addEventListener("resize", i), window.addEventListener("scroll", i), null !== e) {
            const n = o.querySelector(".human-loading-spinner"),
                t = o.querySelector(".score-display"),
                i = o.querySelector(".human-circle"),
                a = o.querySelector(".human-text");
            n.style.display = "none", t.style.display = "block", a.textContent = e;
            const s = 2 * Math.PI * 48,
                r = s - e / 100 * s;
            i.style.strokeDasharray = s, i.style.strokeDashoffset = s, i.getBoundingClientRect(), i.style.strokeDashoffset = r
        }
    }

    function r(n, e) {
        try {
            if (!document.body) return console.error("Document body not ready"), void document.addEventListener("DOMContentLoaded", (() => {
                r(n, e)
            }));
            const t = document.getElementById("autoWritingMenu");
            t && t.remove();
            const o = document.createElement("div");
            o.id = "autoWritingMenu", o.innerHTML = '\n      <div class="menu-header">\n        <div class="menu-title">REVOLT | BETA</div>\n      </div>\n      <div class="menu-items">\n      <div class="menu-item" id="autoVideoItem">\n          <button class="menu-item-button">\n            <div class="button-content">\n              <div class="video-icon">\n                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n                  <polygon points="23 7 16 12 23 17 23 7"></polygon>\n                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>\n                </svg>\n              </div>\n              <span class="button-text">Auto Video</span>\n            </div>\n          </button>\n        </div>\n        <div class="menu-item" id="autoInstructionItem">\n          <button class="menu-item-button">\n            <div class="button-content">\n              <div class="instruction-icon">\n                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>\n                  <polyline points="14 2 14 8 20 8"></polyline>\n                  <line x1="16" y1="13" x2="8" y2="13"></line>\n                  <line x1="16" y1="17" x2="8" y2="17"></line>\n                  <polyline points="10 9 9 9 8 9"></polyline>\n                </svg>\n              </div>\n              <span class="button-text">Auto Instruction</span>\n            </div>\n          </button>\n        </div>\n        <div class="menu-item" id="autoAdvanceItem">\n          <button class="menu-item-button">\n            <div class="button-content">\n              <div class="rocket-icon">\n                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>\n                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>\n                </svg>\n              </div>\n              <span class="button-text">Auto Advance</span>\n            </div>\n          </button>\n          <div class="menu-item-content" style="display: none;">\n            <div class="menu-body">\n            <div class="menu-row">\n            <label>Advance Type:</label>\n                <div class="typing-dropdown" style="width: 100%;">\n                  <button class="dropdown-btn" id="autoAdvanceTypeBtn">Select type</button>\n                  <div class="dropdown-content">\n                    <div class="dropdown-option" data-value="activity">Activity Advance</div>\n                    <div class="dropdown-option" data-value="unlocked">Unlocked Advance</div>\n                  </div>\n                </div>\n                </div>\n              </div>\n                  </div>\n                </div>\n        <div class="menu-item" id="autoWritingItem">\n          <button class="menu-item-button">\n            <div class="button-content">\n              <div class="settings-icon">\n                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n                  <circle cx="12" cy="12" r="3"></circle>\n                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>\n                </svg>\n              </div>\n              <span class="button-text">Auto writing</span>\n            </div>\n          </button>\n          <div class="menu-item-content" style="display: none;">\n            <div class="menu-body">\n              <div class="menu-row">\n                <label>Submit delay:</label>\n                <div class="input-group" style="width: 100%;">\n                  <div class="input-with-unit">\n                    <input type="number" min="0" step="1" value="0" id="submitDelay1">\n                    <span class="input-unit">sec</span>\n                  </div>\n                  <span>-</span>\n                  <div class="input-with-unit">\n                    <input type="number" min="0" step="1" value="0" id="submitDelay2">\n                    <span class="input-unit">sec</span>\n                  </div>\n                </div>\n              </div>\n              <div class="menu-row">\n                <label>Answer delay:</label>\n                <div class="typing-dropdown answer-delay-dropdown" style="width: 100% !important;">\n                  <button class="dropdown-btn" id="answerDelayBtn">None</button>\n                  <div class="dropdown-content">\n                    <div class="dropdown-option" data-value="none">None</div>\n                    <div class="dropdown-option" data-value="custom">Custom</div>\n                  </div>\n                </div>\n                <div class="input-with-unit custom-delay-input" style="display: none; width: 60px;">\n                  <input type="number" min="0" step="1" value="0" id="answerDelay" style="width: 60px !important;">\n                  <span class="input-unit">wpm</span>\n                </div>\n              </div>\n              <div class="menu-row">\n                <label>Typing Style:</label>\n                <div class="typing-dropdown">\n                  <button class="dropdown-btn" id="typingStyleBtn">None</button>\n                  <div class="dropdown-content">\n                    <div class="dropdown-option" data-value="default">None</div>\n                    <div class="dropdown-option" data-value="level1">Level 1</div>\n                    <div class="dropdown-option" data-value="level2">Level 2</div>\n                    <div class="dropdown-option" data-value="level3">Level 3</div>\n                  </div>\n                </div>\n              </div>\n              <div class="menu-row">\n                <label>Placeholder:</label>\n                <div class="typing-dropdown">\n                  <button class="dropdown-btn" id="placeholderBtn">None</button>\n                  <div class="dropdown-content">\n                    <div class="dropdown-option" data-value="default">None</div>\n                    <div class="dropdown-option" data-value="enabled">Enabled</div>\n                    <div class="dropdown-option" data-value="disabled">Disabled</div>\n                  </div>\n                </div>\n              </div>\n              <div class="custom-placeholder-input" style="display: none;">\n                <textarea \n                  id="placeholderText" \n                  placeholder="Enter custom placeholder text..."\n                  rows="3"\n                >This topic has many sides to consider, each offering unique insights required to understand.</textarea>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class="menu-item" id="examUnlockerItem">\n          <button class="menu-item-button">\n            <div class="button-content">\n              <div class="unlock-icon">\n                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>\n                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>\n                </svg>\n              </div>\n              <span class="button-text">Auto Exam</span>\n            </div>\n          </button>\n          <div class="menu-item-content" style="display: none;">\n            <div class="menu-body">\n              <div class="menu-row">\n                <label>Exam Info:</label>\n                <div class="typing-dropdown">\n                  <button class="dropdown-btn" id="examInfoBtn">Disabled</button>\n                  <div class="dropdown-content">\n                    <div class="dropdown-option" data-value="enabled">Enabled</div>\n                    <div class="dropdown-option" data-value="disabled">Disabled</div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class="menu-item" id="autoVocabItem">\n          <button class="menu-item-button">\n            <div class="button-content">\n              <div class="wordbook-icon">\n                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>\n                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>\n                </svg>\n              </div>\n              <span class="button-text">Auto Vocabulary</span>\n            </div>\n          </button>\n        </div>\n      </div>\n    ';
            const i = document.createElement("style");
            i.id = "autoWritingMenuStyle", i.textContent = "\n      #autoWritingMenu {\n        position: fixed;\n        top: 100px;\n        left: 100px;\n        width: 320px;\n        background: #141517;\n        border-radius: 12px;\n        font-family: 'Poppins', system-ui, -apple-system, sans-serif;\n        z-index: 999999;\n        cursor: default;\n        color: white;\n        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);\n      }\n\n      .menu-header {\n        background: #222324;\n        padding: 15px 20px;\n        user-select: none;\n        border-radius: 12px 12px 0 0;\n        cursor: grab;\n      }\n\n      .menu-title {\n        color: white;\n        font-size: 24px;\n        font-weight: 800;\n      }\n\n      .menu-items {\n        padding: 10px;\n      }\n\n      .menu-item {\n        margin-bottom: 8px;\n      }\n\n      .menu-item-button {\n        width: 100%;\n        padding: 10px 15px;\n        background: #242526;\n        border: none;\n        border-radius: 6px;\n        color: white;\n        font-family: 'Poppins', system-ui, -apple-system, sans-serif;\n        font-size: 15px;\n        font-weight: 600;\n        text-align: left;\n        cursor: pointer;\n        transition: all 0.3s ease;\n        position: relative;\n        overflow: hidden;\n      }\n\n      .menu-item-button:hover {\n        background: #2a2b2c;\n      }\n\n      .menu-item-button.active {\n        background: #006cff;\n        animation: pulse 2s infinite;\n      }\n\n      .menu-item-button.writing {\n        background: #006cff;\n        animation: writing-pulse 2s infinite;\n      }\n\n      .menu-item-button.writing::before {\n        content: '';\n        position: absolute;\n        top: 0;\n        left: -100%;\n        width: 100%;\n        height: 100%;\n        background: linear-gradient(\n          90deg,\n          transparent,\n          rgba(255, 255, 255, 0.2),\n          transparent\n        );\n        animation: wave 2s linear infinite;\n      }\n\n      @keyframes pulse {\n        0% {\n          box-shadow: 0 0 0 0 rgba(0, 108, 255, 0.4);\n        }\n        70% {\n          box-shadow: 0 0 0 10px rgba(0, 108, 255, 0);\n        }\n        100% {\n          box-shadow: 0 0 0 0 rgba(0, 108, 255, 0);\n        }\n      }\n\n      @keyframes writing-pulse {\n        0% {\n          box-shadow: 0 0 5px rgba(0, 108, 255, 0.5),\n                      0 0 10px rgba(0, 108, 255, 0.3);\n        }\n        50% {\n          box-shadow: 0 0 10px rgba(0, 108, 255, 0.7),\n                      0 0 20px rgba(0, 108, 255, 0.5);\n        }\n        100% {\n          box-shadow: 0 0 5px rgba(0, 108, 255, 0.5),\n                      0 0 10px rgba(0, 108, 255, 0.3);\n        }\n      }\n\n      @keyframes wave {\n        0% {\n          left: -100%;\n        }\n        100% {\n          left: 100%;\n        }\n      }\n\n      .menu-body {\n        padding: 15px;\n        background: #1a1b1c;\n        border-radius: 6px;\n        margin-top: 8px;\n      }\n\n      .menu-row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        margin-bottom: 12px;\n        height: 32px;\n      }\n\n      .menu-row label {\n        min-width: 100px;\n        color: white;\n        font-size: 15px;\n        font-weight: 600;\n        opacity: 0.9;\n      }\n\n      .input-group {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n      }\n\n      .input-with-unit {\n        position: relative;\n        width: 60px;\n      }\n\n      input[type=\"number\"] {\n        width: 100%;\n        height: 28px;\n        padding: 0 25px 0 8px;\n        background: #242526;\n        border: none;\n        border-radius: 4px;\n        color: white;\n        font-family: 'Poppins', system-ui, -apple-system, sans-serif;\n        font-size: 14px;\n        font-weight: 600;\n        -moz-appearance: textfield;\n      }\n\n      input[type=\"number\"]::-webkit-outer-spin-button,\n      input[type=\"number\"]::-webkit-inner-spin-button {\n        -webkit-appearance: none;\n        margin: 0;\n      }\n\n      .input-unit {\n        position: absolute;\n        right: 8px;\n        top: 50%;\n        transform: translateY(-50%);\n        color: rgba(255, 255, 255, 0.6);\n        font-size: 10px;\n        pointer-events: none;\n      }\n\n      .typing-dropdown {\n        position: relative;\n        width: 100%;\n      }\n\n      .dropdown-btn {\n        width: 100%;\n        height: 28px;\n        padding: 0 10px;\n        background: #242526;\n        border: none;\n        border-radius: 4px;\n        color: white;\n        font-family: 'Poppins', system-ui, -apple-system, sans-serif;\n        font-size: 15px;\n        font-weight: 600;\n        text-align: left;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n      }\n\n      .dropdown-btn::after {\n        content: '▼';\n        font-size: 10px;\n        opacity: 0.7;\n      }\n\n      .dropdown-content {\n        position: absolute;\n        top: 100%;\n        left: 0;\n        width: 100%;\n        background: #242526;\n        border-radius: 4px;\n        z-index: 1;\n        margin-top: 4px;\n        display: none;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),\n                    0 0 0 1px rgba(255, 255, 255, 0.05);\n        border: 1px solid rgba(255, 255, 255, 0.1);\n        overflow: hidden;\n      }\n\n      .dropdown-option {\n        text-align: left;\n        padding: 8px 10px;\n        color: white;\n        font-size: 15px;\n        font-weight: 600;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n      }\n\n      .dropdown-option:last-child {\n        border-bottom: none;\n      }\n\n      .dropdown-option:hover {\n        background: #2a2b2c;\n        padding-left: 15px;\n      }\n\n      .typing-dropdown.active .dropdown-content {\n        display: block;\n      }\n\n      .typing-dropdown.active .dropdown-content1 {\n        height: 380px;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),\n                    0 0 0 1px rgba(255, 255, 255, 0.05);\n        border: 1px solid rgba(255, 255, 255, 0.1);\n      }\n\n      .custom-delay-input {\n        transition: all 0.3s ease;\n      }\n\n      .button-content {\n        display: flex;\n        align-items: center;\n        gap: 10px;\n        width: 100%;\n      }\n\n      .settings-icon,\n      .unlock-icon,\n      .rocket-icon,\n      .video-icon,\n      .instruction-icon {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        width: 24px;\n        height: 24px;\n        border-radius: 4px;\n        transition: all 0.2s ease;\n        color: rgba(255, 255, 255, 0.7);\n      }\n\n      .settings-icon:hover,\n      .unlock-icon:hover,\n      .rocket-icon:hover,\n      .video-icon:hover,\n      .instruction-icon:hover {\n        background: rgba(255, 255, 255, 0.1);\n        color: white;\n      }\n\n      .button-text {\n        flex: 1;\n      }\n\n      /* Editor Writing Animation */\n      .cke_editable.writing-active {\n        position: relative;\n        border: 1px solid rgba(0, 108, 255, 0.3) !important;\n        box-shadow: 0 0 10px rgba(0, 108, 255, 0.2) !important;\n      }\n\n      .cke_editable.writing-active::after {\n        content: '';\n        position: absolute;\n        bottom: 0;\n        left: 0;\n        width: 100%;\n        height: 2px;\n        background: linear-gradient(90deg, #006cff, transparent);\n        animation: writing 2s ease-out infinite;\n      }\n\n      @keyframes writing {\n        0% {\n          width: 0;\n          opacity: 1;\n        }\n        50% {\n          width: 100%;\n          opacity: 1;\n        }\n        100% {\n          width: 100%;\n          opacity: 0;\n        }\n      }\n\n      .custom-placeholder-input {\n        margin-top: 8px;\n        transition: all 0.3s ease;\n      }\n\n      .custom-placeholder-input textarea {\n        width: 100%;\n        padding: 8px 12px;\n        background: #242526;\n        border: 1px solid rgba(255, 255, 255, 0.1);\n        border-radius: 4px;\n        color: white;\n        font-family: 'Poppins', system-ui, -apple-system, sans-serif;\n        font-size: 14px;\n        font-weight: 600;\n        resize: vertical;\n        min-height: 80px;\n        line-height: 1.5;\n      }\n\n      .custom-placeholder-input textarea:focus {\n        outline: none;\n        border-color: rgba(0, 108, 255, 0.5);\n        box-shadow: 0 0 0 2px rgba(0, 108, 255, 0.2);\n      }\n\n      #examUnlockerItem .menu-item-button.active {\n        background: #006cff;\n        animation: pulse 2s infinite;\n      }\n\n      #examUnlockerItem .menu-body {\n        padding: 15px;\n        background: #1a1b1c;\n        border-radius: 6px;\n        margin-top: 8px;\n      }\n\n      .exam-panel-header {\n        cursor: grab;\n        user-select: none;\n        border-radius: 12px 12px 0 0;\n      }\n\n      .exam-panel-header:active {\n        cursor: grabbing;\n      }\n\n      .loading-overlay {\n        display: none;\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background: rgba(0, 0, 0, 0.7);\n        z-index: 1000000;\n        opacity: 0;\n        transition: opacity 0.3s ease;\n      }\n\n      .loading-overlay.show {\n        opacity: 1;\n      }\n\n      .loading-spinner-container {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        text-align: center;\n      }\n\n      .loading-spinner {\n        width: 40px;\n        height: 40px;\n        border: 3px solid rgba(255, 255, 255, 0.1);\n        border-radius: 50%;\n        border-top-color: #006cff;\n        animation: spin 1s ease-in-out infinite;\n      }\n\n      .loading-text {\n        color: white;\n        margin-top: 16px;\n        font-family: 'Poppins', system-ui, -apple-system, sans-serif;\n        font-size: 14px;\n        font-weight: 500;\n      }\n\n      @keyframes spin {\n        to { transform: rotate(360deg); }\n      }\n    ", document.getElementById("autoWritingMenuStyle") || document.head.appendChild(i), document.body.appendChild(o);
            const s = document.getElementById("autoWritingItem"),
                d = s.querySelector(".menu-item-button"),
                u = s.querySelector(".settings-icon"),
                p = s.querySelector(".menu-item-content");
            u.addEventListener("click", (() => {
                const n = "none" !== p.style.display;
                p.style.display = n ? "none" : "block", d.style.background = n ? "#242526" : "#2a2b2c"
            })), d.addEventListener("click", (e => {
                if (e.target.closest(".settings-icon")) return;
                const t = document.querySelector("#submitDelay1"),
                    o = document.querySelector("#submitDelay2"),
                    i = document.querySelector("#answerDelay"),
                    a = document.querySelector("#answerDelayBtn"),
                    s = document.querySelector("#typingStyleBtn");
                if ("0" === t.value && "0" === o.value || parseInt(t.value) > parseInt(o.value)) return void alert("Error at submit delay");
                if ("0" === i.value && "Custom" === a.textContent.trim()) return void alert("Error at answer delay");
                l(d.classList.contains("active") ? "idle" : "active");
                const r = {
                    isActive: d.classList.contains("active"),
                    submitDelay: {
                        min: parseInt(t.value) || 0,
                        max: parseInt(o.value) || 0
                    },
                    answerDelay: parseInt(i.value) || 0,
                    typingStyle: s.textContent.trim(),
                    placeholder: document.querySelector("#placeholderBtn").textContent.trim(),
                    placeholderText: "Enabled" === document.querySelector("#placeholderBtn").textContent.trim() ? document.querySelector("#placeholderText").value.trim() : ""
                };
                "function" == typeof n && n(r)
            }));
            const m = o.querySelectorAll(".typing-dropdown");
            m.forEach((n => {
                const t = n.querySelector(".dropdown-btn"),
                    i = n.querySelectorAll(".dropdown-option");
                t.addEventListener("click", (e => {
                    e.stopPropagation(), m.forEach((e => {
                        e !== n && e.classList.remove("active")
                    })), n.classList.toggle("active")
                })), i.forEach((i => {
                    i.addEventListener("click", (s => {
                        s.stopPropagation();
                        const r = i.getAttribute("data-value");
                        if (t.textContent = i.textContent, n.classList.remove("active"), n.classList.contains("answer-delay-dropdown")) {
                            const n = o.querySelector(".custom-delay-input");
                            "custom" === r ? n.style.display = "block" : (n.style.display = "none", document.querySelector("#answerDelay").value = "0")
                        }
                        if ("placeholderBtn" === t.id) {
                            const n = o.querySelector(".custom-placeholder-input");
                            "Enabled" === i.textContent ? n.style.display = "block" : n.style.display = "none"
                        }
                        if ("examInfoBtn" === t.id) {
                            if ("Enabled" === i.textContent) c(a);
                            else {
                                const n = document.querySelector("#examInfoPanel");
                                n && n.remove()
                            }
                            const n = {
                                isActive: K.classList.contains("active"),
                                examInfo: i.textContent
                            };
                            "function" == typeof e && e(n)
                        }
                    }))
                }))
            })), document.addEventListener("click", (() => {
                m.forEach((n => n.classList.remove("active")))
            }));
            const f = document.getElementById("autoAdvanceItem"),
                w = f?.querySelector(".menu-item-button"),
                b = f.querySelector(".rocket-icon"),
                x = f.querySelector(".menu-item-content");
            b.addEventListener("click", (n => {
                n.stopPropagation();
                const e = "none" !== x.style.display;
                x.style.display = e ? "none" : "block", w.style.background = e ? "#242526" : "#2a2b2c"
            })), w.addEventListener("click", (async n => {
                if (n.target.closest(".rocket-icon")) return;
                w.classList.add("active");
                const e = document.querySelector("#autoAdvanceTypeBtn").textContent.trim();
                if ("Select type" === e) return void alert("Please select an advance type first");
                GM_setValue("advanceClick", 1), GM_setValue("advanceType", e);
                const t = document.createElement("div");
                t.className = "loading-overlay", t.innerHTML = '\n          <div class="loading-spinner-container">\n            <div class="loading-spinner"></div>\n          </div>\n        ', document.body.appendChild(t), t.style.display = "block", t.offsetHeight, t.classList.add("show");
                try {
                    const n = await y();
                    t.classList.remove("show"), setTimeout((() => {
                        t.remove()
                    }), 300);
                    const e = await async function(n = []) {
                        console.log("createAutoAdvanceModal"), document.querySelectorAll("#autoAdvanceModal").forEach((n => n.remove())), console.log("courses", n);
                        const e = `\n    <div id="autoAdvanceModal" class="modal">\n      <div class="modal-content">\n        <div class="container1">\n          <h1 style="font-size: 32px; margin-top: 30px;">Get <span class="title">school</span> done now</h1>\n          <p class="info1">Select a class to get started with Revolt</p>\n          <div class="typing-dropdown" style="margin-top: 10px;">\n            <button class="dropdown-btn" id="placeholderBtn" style="height: 40px;">Select a class</button>\n            <div class="dropdown-content1">\n              ${n.map((n=>`<div class="dropdown-option" data-value="${n.id}">\n                      <div style="display: flex; flex-direction: column; gap: 4px;">\n                        <div style="font-size: 18px; font-weight: 500; color: #fff; margin-bottom: 4px;">${n.subject}</div>\n                        <div style="display: flex; flex-direction: row; justify-content: space-between; font-size: 14px; font-weight: 350; color: #fff;">\n                          <div>${n.name}</div>\n                          <div>\n                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n                              <circle cx="12" cy="12" r="11" stroke="white" stroke-width="2"/>\n                              <path d="M10 7L16 12L10 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n                            </svg>\n                          </div>\n                        </div>\n                        <div class="progress-bar" style="width: 100%; height: 3px; margin-top: 4px;">\n                          <div style="width: ${n.progress?n.progress.percentComplete:0}%; height: 100%; background: #006CFF; border-radius: 10px; transition: width 0.3s ease;"></div>\n                        </div>\n                        ${n.progress?`<div style="font-size: 12px; color: #9b9d9f;">You are ${n.progress.percentComplete}% complete and Ahead</div>`:""}\n                      </div>\n                    </div>`)).join("")}\n            </div>\n          </div>\n          <p class="info" id="cancelModalBtn" style="cursor: pointer;">Cancel</p>\n        </div>\n      </div>\n    </div>\n  `;
                        if (!document.querySelector("#autoAdvanceModalStyle")) {
                            const n = document.createElement("style");
                            n.id = "autoAdvanceModalStyle", n.textContent = "\n    .modal {\n      display: none;\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      background: rgba(0, 0, 0, 0.7);\n      font-family: Arial, sans-serif;\n      opacity: 0;\n      transition: opacity 0.5s ease-in-out;\n    }\n\n    .modal.show {\n      opacity: 1;\n      z-index: 1000000;\n    }\n\n    .modal-content {\n      position: absolute;\n      top: 30%;\n      left: 50%;\n      transform: translate(-50%, -50%) scale(0.7);\n      width: 540px;\n      border-radius: 12px;\n      background: #12141a;\n      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);\n      opacity: 0;\n      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);\n    }\n\n    .modal.show .modal-content {\n      transform: translate(-50%, -50%) scale(1);\n      opacity: 1;\n    }\n\n    @keyframes modalPop {\n      0% {\n        transform: translate(-50%, -50%) scale(0.7);\n        opacity: 0;\n      }\n      100% {\n        transform: translate(-50%, -50%) scale(1);\n        opacity: 1;\n      }\n    }\n\n\n    .container1 {\n      text-align: center;\n      padding: 30px;\n      border-radius: 12px;\n      height: 300px;\n      transition: height 0.5s ease-in-out;\n      margin-bottom: 30px;\n      overflow-y: hidden;\n      scrollbar-width: none;\n    }\n\n    .h-400 {\n      height: 600px !important;\n      overflow-y: scroll;\n    }\n\n    .dropdown-content1 {\n      position: absolute;\n      top: 100%;\n      left: 0;\n      width: 100%;\n      height: 0px;\n      background: #242526;\n      border-radius: 4px;\n      z-index: 1;\n      margin-top: 4px;\n      overflow-y: scroll;\n      scrollbar-width: none;\n      transition: height 0.4s ease-in-out;\n    }\n\n    h1 {\n      font-size: 24px;\n      font-weight: bold;\n      color: white;\n      margin: 0;\n    }\n\n    .emoji {\n      font-size: 24px;\n      vertical-align: middle;\n    }\n\n    .dropdown {\n      background: #23252b;\n      color: white;\n      border: none;\n      padding: 10px;\n      width: 100%;\n      border-radius: 6px;\n      font-size: 16px;\n      margin-top: 5px;\n    }\n\n    .info {\n      margin-top: 50px;\n      font-size: 14px;\n      background: rgba(255, 255, 255, 0.1);\n      display: inline-block;\n      padding: 6px 12px;\n      border-radius: 8px;\n      color: white;\n    }\n\n    .info1 {\n      display: flex !important;\n      justify-content: flex-start;\n      margin-top: 40px;\n      margin-bottom: 5px !important;\n      font-size: 14px;\n      color: white;\n    }\n\n    .title {\n      margin-bottom: 0 !important;\n      color: #006cff;\n    }\n  ", document.head.appendChild(n)
                        }
                        document.body.insertAdjacentHTML("beforeend", e);
                        const t = document.getElementById("autoAdvanceModal"),
                            o = t.querySelector(".typing-dropdown");
                        console.log("dropdowns", o);
                        const i = o.querySelector(".dropdown-btn"),
                            a = o.querySelectorAll(".dropdown-option"),
                            s = t.querySelector(".container1");

                        function r() {
                            t.classList.remove("show"), setTimeout((() => {
                                t.style.display = "none"
                            }), 300)
                        }
                        return i.addEventListener("click", (n => {
                            n.stopPropagation(), s.classList.toggle("h-400"), o.classList.toggle("active")
                        })), a.forEach((n => {
                            n.addEventListener("click", (e => {
                                e.stopPropagation(), s.classList.remove("h-400");
                                const t = n.getAttribute("data-value"),
                                    i = window.location.href;
                                console.log("path:", `${i}enrollment/${t}/coursemap#`), window.location.href = `${i}enrollment/${t}/coursemap#`;
                                const a = o.querySelector(".dropdown-content1");
                                a.style.position = "relative", a.insertAdjacentHTML("beforeend", '\n        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 100;">\n          <div class="loading-spinner" style="width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.1); border-radius: 50%; border-top-color: #006cff; animation: spin 1s ease-in-out infinite;"></div>\n        </div>\n      ')
                            }))
                        })), window.addEventListener("click", (n => {
                            const e = t.querySelector(".modal-content");
                            document.getElementById("autoAdvanceItem").contains(n.target) || n.target === e || r()
                        })), document.getElementById("cancelModalBtn").addEventListener("click", (() => {
                            r()
                        })), t.addEventListener("click", (n => {
                            n.stopPropagation(), console.log("modal clicked"), o.classList.remove("active"), s.classList.remove("h-400"), t.querySelector(".modal-content").contains(n.target) || r()
                        })), {
                            show: function() {
                                t.style.display = "block", t.offsetHeight, t.classList.add("show")
                            },
                            hide: r,
                            element: t
                        }
                    }(n);
                    e.show ? e.show() : (e.classList.add("show"), e.style.display = "block")
                } catch (n) {
                    console.error("Error loading courses:", n), t.classList.remove("show"), setTimeout((() => {
                        t.remove(), alert("Failed to load courses. Please try again.")
                    }), 300)
                }
            }));
            const k = f.querySelector(".typing-dropdown"),
                I = k.querySelector(".dropdown-btn"),
                S = k.querySelectorAll(".dropdown-option");
            I.addEventListener("click", (n => {
                n.stopPropagation()
            })), S.forEach((n => {
                n.addEventListener("click", (e => {
                    e.stopPropagation();
                    const t = n.getAttribute("data-value");
                    I.textContent = "activity" === t ? "Activity Advance" : "Unlocked Advance", n.classList.remove("active")
                }))
            }));
            const E = document.getElementById("autoVocabItem"),
                A = E?.querySelector(".menu-item-button");
            let C = !0;
            const q = h();
            A.addEventListener("click", (async n => {
                try {
                    if (!q?.contentWindow) return void alert("Content Window not found");
                    for (A.classList.add("active", "writing"); C;) {
                        const n = q?.contentWindow;
                        let {
                            viewModel: e,
                            API: t,
                            ActivityKeys: o,
                            initialData: i
                        } = n;
                        const a = e?.currentWord(),
                            s = a?.word();
                        console.log("Current Word:", s);
                        const r = q?.contentDocument?.querySelector(".word-textbox");
                        if (r) {
                            r.value = s;
                            const n = new Event("keyup");
                            r.dispatchEvent(n);
                            const l = t.E2020.addresses.ContentEngineViewersPath + "Vocab/UpdateAttempt?attemptKey=" + o.resultKey + "&completedWordKey=" + a.key + "&enrollmentKey=" + o.enrollmentKey + "&version=" + o.version,
                                c = await fetch(l, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json; charset=utf-8"
                                    }
                                }),
                                d = await c.json();
                            console.log("Result:", d), e.currentWord().complete(!0), console.log("Words:", e.words());
                            const u = e.words().indexOf(a);
                            C = e.words()[u + 1], C && (console.log("Next Word Rank:", C.rank()), e.nextAvailableWord(C), e.currentWord().nextButton().state(!0), e.selectWord(C.rank())), console.log("Complete:", e.complete(), d.complete), (e.complete() || d.complete) && (i.Complete = !0, q.src = t.E2020.addresses.ContentEngineViewersPath + "LTILogin/Complete?enrollmentKey=" + o.enrollmentKey)
                        } else console.error("Could not find word textbox element")
                    }
                } finally {
                    A.classList.remove("active", "writing")
                }
            }));
            const L = document.getElementById("autoVideoItem"),
                T = L?.querySelector(".menu-item-button");
            T.addEventListener("click", (async n => {
                T.classList.add("active", "writing"), setInterval((async () => {
                    try {
                        if (!q?.contentWindow) return void alert("Content Window not found");
                        const n = q?.contentWindow;
                        let {
                            API: e
                        } = n;
                        const t = document.getElementById("activity-title"),
                            o = t ? t.textContent.trim().toLowerCase() : null,
                            i = q.contentDocument.getElementById("home_video_js");
                        let a = i?.duration || null,
                            s = i?.currentTime || null;
                        const r = e.Frame.isComplete(),
                            l = q?.contentDocument?.getElementById("iFramePreview"),
                            c = "none" === l?.style.display;
                        if (console.log("isAVideo", c), r) g(q);
                        else if (o && ["instruction", "warmup", "summary", "lecture", "lablecture", "directinstruction"].includes(o)) {
                            if (c) return a - s < 2 && 0 != a ? void g(q.contentWindow.API) : void 0;
                            const n = v();
                            if (n) {
                                const e = n.contentDocument?.querySelectorAll("div[fstack]");
                                console.log("Questions:", e), e.forEach((n => {
                                    setTimeout((() => {
                                        let e = 0,
                                            t = n.querySelectorAll("input");
                                        console.log("Input:", t), t && t.length > 0 && (Array.from(t).forEach((n => Math.random() > .5 ? n.click() : null)), e++), n.querySelector("select") && e++;
                                        let o = n.querySelector("iframe"),
                                            i = o?.contentDocument?.getElementById("onlyButton");
                                        i && setInterval((() => {
                                            i.click(), e++
                                        }), 250);
                                        const a = n.querySelectorAll("div[title='done']");
                                        a && a.length > 0 && e > 0 && (Array.from(a).forEach((n => n.click())), g(q))
                                    }), 500)
                                }))
                            }
                        }
                    } catch (n) {
                        console.error("Error:", n), T.classList.remove("active", "writing")
                    }
                }), 1e3)
            }));
            const P = o.querySelector(".menu-header");
            let D, B, M, $, z = !1,
                j = 0,
                O = 0;
            P.addEventListener("mousedown", (n => {
                M = n.clientX - j, $ = n.clientY - O, z = !0
            })), document.addEventListener("mousemove", (n => {
                z && (n.preventDefault(), D = n.clientX - M, B = n.clientY - $, j = D, O = B, o.style.transform = `translate(${D}px, ${B}px)`)
            })), document.addEventListener("mouseup", (() => {
                z = !1
            }));
            const W = document.getElementById("examUnlockerItem"),
                K = W.querySelector(".menu-item-button"),
                F = W.querySelector(".unlock-icon"),
                N = W.querySelector(".menu-item-content");
            F.addEventListener("click", (n => {
                n.stopPropagation();
                const e = "none" !== N.style.display;
                N.style.display = e ? "none" : "block", K.style.background = e ? "#242526" : "#2a2b2c"
            })), K.addEventListener("click", (n => {
                if (n.target.closest(".unlock-icon")) return;
                const t = {
                    isActive: K.classList.contains("active"),
                    examInfo: document.querySelector("#examInfoBtn").textContent.trim()
                };
                "function" == typeof e && e(t)
            }))
        } catch (n) {
            console.error("Error initializing draggable menu:", n)
        }
    }

    function l(n) {
        const e = document.querySelector("#autoWritingItem .menu-item-button");
        if (e) switch (e.classList.remove("active", "writing"), n) {
            case "idle":
                break;
            case "active":
                e.classList.add("active");
                break;
            case "writing":
                e.classList.add("active", "writing")
        }
    }

    function c(n = []) {
        console.log("Displaying exam panel");
        const e = document.querySelector("#examInfoPanel");
        if (e && e.remove(), !document.querySelector("#exam-panel-style")) {
            const n = document.createElement("style");
            n.id = "exam-panel-style", n.textContent = "\n      #examInfoPanel {\n        position: fixed;\n        top: 100px;\n        transform: translate(0, 0); /* Initial position */\n        width: 300px;\n        background: #141517;\n        border-radius: 12px;\n        font-family: 'Poppins', system-ui, -apple-system, sans-serif;\n        color: white;\n        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);\n        z-index: 999998;\n        display: flex;\n        flex-direction: column;\n        max-height: 80vh;\n      }\n\n      .exam-panel-header {\n        background: #222324;\n        padding: 15px;\n        border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n        flex-shrink: 0;\n      }\n\n      .exam-panel-title {\n        font-size: 18px;\n        font-weight: 600;\n        color: white;\n        display: flex;\n        align-items: center;\n        gap: 8px;\n      }\n\n      .exam-questions-container {\n        padding: 15px;\n        overflow-y: auto;\n        flex-grow: 1;\n        height: 400px;\n      }\n\n      /* Scrollbar styling */\n      .exam-questions-container::-webkit-scrollbar {\n        width: 4px;\n      }\n\n      .exam-questions-container::-webkit-scrollbar-track {\n        background: #1a1b1c;\n        border-radius: 4px;\n      }\n\n      .exam-questions-container::-webkit-scrollbar-thumb {\n        background: #2a2b2c;\n        border-radius: 4px;\n        transition: all 0.3s ease;\n      }\n\n      .exam-questions-container::-webkit-scrollbar-thumb:hover {\n        background: #006cff;\n      }\n\n      .exam-question-card {\n        background: #1a1b1c;\n        border-radius: 8px;\n        padding: 12px;\n        margin-bottom: 10px;\n        border: 1px solid rgba(255, 255, 255, 0.1);\n        transition: all 0.3s ease;\n      }\n\n      .exam-question-card:hover {\n        border-color: rgba(0, 108, 255, 0.5);\n        box-shadow: 0 0 0 1px rgba(0, 108, 255, 0.2);\n        transform: translateX(-4px);\n      }\n\n      .question-id {\n        color: #006cff;\n        font-weight: 600;\n        font-size: 14px;\n        margin-bottom: 4px;\n      }\n\n      .question-status {\n        font-size: 12px;\n        padding: 4px 8px;\n        border-radius: 4px;\n        display: inline-block;\n        margin-top: 4px;\n      }\n\n      .status-pending {\n        background: rgba(255, 170, 0, 0.2);\n        color: #ffaa00;\n      }\n\n      .status-completed {\n        background: rgba(0, 200, 83, 0.2);\n        color: #00c853;\n      }\n\n      .exam-pagination {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        padding: 15px;\n        border-top: 1px solid rgba(255, 255, 255, 0.1);\n        flex-shrink: 0;\n      }\n\n      .page-info {\n        font-size: 14px;\n        color: rgba(255, 255, 255, 0.7);\n      }\n\n      .page-buttons {\n        display: flex;\n        gap: 8px;\n      }\n\n      .page-button {\n        background: #242526;\n        border: none;\n        border-radius: 4px;\n        color: white;\n        font-family: 'Poppins', system-ui, -apple-system, sans-serif;\n        font-size: 14px;\n        font-weight: 600;\n        padding: 6px 12px;\n        cursor: pointer;\n        transition: all 0.2s ease;\n        min-width: 32px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n      }\n\n      .page-button:hover:not(:disabled) {\n        background: #2a2b2c;\n        transform: translateY(-1px);\n      }\n\n      .page-button:active:not(:disabled) {\n        transform: translateY(0);\n      }\n\n      .page-button.active {\n        background: #006cff;\n      }\n\n      .page-button:disabled {\n        opacity: 0.5;\n        cursor: not-allowed;\n      }\n\n      .question-details {\n        font-size: 13px;\n        color: rgba(255, 255, 255, 0.7);\n        margin-top: 4px;\n      }\n\n      .question-type {\n        display: inline-block;\n        padding: 2px 6px;\n        background: rgba(0, 108, 255, 0.1);\n        color: #006cff;\n        border-radius: 4px;\n        font-size: 11px;\n        margin-right: 8px;\n      }\n\n      .time-remaining {\n        font-size: 12px;\n        color: rgba(255, 255, 255, 0.6);\n        margin-top: 4px;\n        display: flex;\n        align-items: center;\n        gap: 4px;\n      }\n\n      .time-remaining svg {\n        color: #006cff;\n      }\n    ", document.head.appendChild(n)
        }
        const t = document.createElement("div");
        t.id = "examInfoPanel";
        let o = 1;
        const i = Math.ceil(n.length / 5);
        let a = !1,
            s = 0,
            r = 0,
            l = 0,
            c = 0;

        function d(n) {
            if (!n.target.closest(".exam-panel-header")) return;
            n.preventDefault(), a = !0;
            const e = window.getComputedStyle(t).transform,
                o = new DOMMatrixReadOnly(e);
            l = o.m41, c = o.m42, s = n.clientX - l, r = n.clientY - c, document.addEventListener("mousemove", u), document.addEventListener("mouseup", p)
        }

        function u(n) {
            if (!a) return;
            n.preventDefault();
            let e = n.clientX - s,
                o = n.clientY - r;
            const i = window.innerWidth,
                l = window.innerHeight,
                c = t.getBoundingClientRect();
            e = Math.min(Math.max(e, 0), i - c.width), o = Math.min(Math.max(o, 0), l - c.height), t.style.transform = `translate(${e}px, ${o}px)`
        }

        function p() {
            a = !1, document.removeEventListener("mousemove", u), document.removeEventListener("mouseup", p)
        }

        function m() {
            const n = t.getBoundingClientRect(),
                e = window.innerWidth,
                o = window.innerHeight,
                i = window.getComputedStyle(t).transform,
                a = new DOMMatrixReadOnly(i);
            let s = a.m41,
                r = a.m42;
            n.right > e && (s = e - n.width), n.bottom > o && (r = o - n.height), t.style.transform = `translate(${s}px, ${r}px)`
        }
        return t.addEventListener("mousedown", d), window.addEventListener("resize", m), t.cleanup = () => {
                t.removeEventListener("mousedown", d), window.removeEventListener("resize", m)
            },
            function e() {
                const a = 5 * (o - 1),
                    s = a + 5,
                    r = n.slice(a, s),
                    l = t.style.transform;
                t.innerHTML = `\n      <div class="exam-panel-header">\n        <div class="exam-panel-title">\n          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>\n            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>\n          </svg>\n          Exam Questions (${n.length})\n        </div>\n      </div>\n      <div class="exam-questions-container">\n        ${r.map((n=>`\n          <div class="exam-question-card">\n            <div class="question-id">${n}</div>\n            <div class="question-details">\n              <span class="question-type">Assessment Question</span>\n            </div>\n            <div class="question-status status-pending">\n              Pending\n            </div>\n            <div class="time-remaining">\n              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n                <circle cx="12" cy="12" r="10"></circle>\n                <polyline points="12 6 12 12 16 14"></polyline>\n              </svg>\n              Time remaining\n            </div>\n          </div>\n        `)).join("")}\n      </div>\n      <div class="exam-pagination">\n        <div class="page-info">\n          ${i?`Page ${o} of ${i}`:""}\n        </div>\n        <div class="page-buttons">\n          <button class="page-button" ${i&&1!==o?"":"disabled"} id="prevPage">\n            ←\n          </button>\n          <button class="page-button" ${i&&o!==i?"":"disabled"} id="nextPage">\n            →\n          </button>\n        </div>\n      </div>\n    `, t.style.transform = l;
                const c = t.querySelector("#prevPage"),
                    d = t.querySelector("#nextPage");
                c && c.addEventListener("click", (() => {
                    o > 1 && (o--, e())
                })), d && d.addEventListener("click", (() => {
                    o < i && (o++, e())
                }))
            }(), document.body.appendChild(t), t
    }

    function d() {
        console.log("Checking for current activity tile..."), m() || (i = setInterval((() => {
            console.log("checkforstageframe called"), m()
        }), 1e3), console.log("checkForStageFrameInterval ##############", i))
    }
    let u = null,
        p = null;

    function m() {
        const n = h();
        return n && "{}" !== JSON.stringify(n) ? (console.log("Stage frame found, proceeding with validation"), function(n) {
            const e = n?.contentWindow,
                t = document.getElementById("autoAdvanceItem"),
                o = t?.querySelector(".menu-item-button");
            let {
                API: a
            } = e;
            if (!a || a?.FrameChain?.currentFrame === u || 1 === a.FrameChain.currentFrame && !a?.Video?.wrapper) return console.log("API is not available"), !1;
            console.log("checkForStageFrameInterval", i), clearInterval(i), clearInterval(p);
            try {
                const e = document.getElementById("activity-title"),
                    t = e ? e.textContent.trim().toLowerCase() : null;
                o.classList.add("active", "writing");
                const i = n.contentDocument.getElementById("home_video_js");
                let s = i?.duration || null,
                    r = i?.currentTime || null;
                const l = a.Frame.isComplete(),
                    c = n?.contentDocument?.getElementById("iFramePreview"),
                    u = "none" === c?.style.display;
                if (console.log("isAVideo", u), l) g(a), setTimeout((() => {
                    m()
                }), 5e3);
                else {
                    if (u) return console.log("Video is playing"), p && clearInterval(p), void(p = setInterval((() => {
                        r = i?.currentTime || 0, console.log("currentTime", r), s - r < 2 && 0 != s && (clearInterval(p), g(a), setTimeout((() => {
                            m()
                        }), 5e3))
                    }), 1e3));
                    if ("instruction" === t) {
                        console.log("Instruction is playing");
                        const n = v();
                        if (n) {
                            const e = n.contentDocument?.querySelectorAll("div[fstack]");
                            console.log("Questions:", e), e.forEach((n => {
                                setTimeout((() => {
                                    let e = 0,
                                        t = n.querySelectorAll("input");
                                    console.log("Input:", t), t && t.length > 0 && (Array.from(t).forEach((n => Math.random() > .5 ? n.click() : null)), e++);
                                    let o = n.querySelectorAll("textarea");
                                    console.log("textArea:", o), o && o.length > 0 && (Array.from(o).forEach((n => Math.random() > .5 ? n.click() : null)), e++);
                                    let i = n.querySelector("select");
                                    console.log("select", i), i && e++;
                                    let s = n.querySelector("iframe"),
                                        r = s?.contentDocument?.getElementById("onlyButton");
                                    r && setInterval((() => {
                                        r.click(), e++
                                    }), 250);
                                    const l = n.querySelectorAll("div[title='done']");
                                    console.log("doneButton", l), console.log("clickedAmount", e), l && l.length > 0 && e > 0 && (Array.from(l).forEach((n => n.click())), g(a), setTimeout((() => {
                                        d()
                                    }), 5e3))
                                }), 500)
                            }))
                        }
                        g(a), setTimeout((() => {
                            m()
                        }), 5e3)
                    } else console.log("Instruction is not playing")
                }
            } catch (n) {
                console.error("Error:", n), o.classList.remove("active", "writing")
            }
        }(n)) : (console.log("Stage frame not found yet, waiting..."), !1)
    }

    function g(n) {
        if (n?.FrameChain?.framesStatus) {
            const e = n.FrameChain.currentPosition,
                t = n.FrameChain.framesStatus.every(((n, t) => t === e || "complete" === n));
            if (console.log("Frame statuses:", n.FrameChain.framesStatus), console.log("All other frames complete:", t), t)
                if (console.log("************* All frames are complete. Proceeding to next frame. *************"), "Unlocked Advance" === GM_getValue("advanceType")) {
                    const n = GM_getValue("backUrl");
                    console.log("backUrl", n), GM_setValue("advanceClick", 1), window.location.href = n
                } else {
                    let n;
                    console.log("All frames except current are complete.");
                    try {
                        n = setInterval((() => {
                            const e = document.querySelector('a.footnav.goRight[data-bind*="getNextActivity"]'),
                                t = e && e.classList.contains("disabled");
                            console.log("Next Activity button disabled:", t), e && !t ? (console.log("############# Found Next Activity button, clicking it ##############"), e.click(), setTimeout((() => {
                                m()
                            }), 3e3), clearInterval(n)) : e ? console.log("Next Activity button is disabled, waiting...") : console.log("Next Activity button not found")
                        }), 500), setTimeout((() => {
                            clearInterval(n), console.log("Stopped checking for Next Activity button after timeout")
                        }), 3e4)
                    } catch (n) {
                        console.error("Error finding or clicking Next Activity button:", n)
                    }
                }
            else console.log("************* Not all frames are complete. Some frames may need attention. *************");
            n.FrameChain.nextFrame()
        }
    }
    async function y() {
        const n = function() {
            try {
                const n = document.cookie.split(";").find((n => n.trim().startsWith("TokenData=")));
                if (!n) return console.log("Token cookie not found"), null;
                const e = JSON.parse(decodeURIComponent(n.split("=")[1]));
                return e && e.UserId ? e.UserId : (console.log("User ID not found in token data"), null)
            } catch (n) {
                return console.error("Error getting user ID from cookie:", n), null
            }
        }();
        if (console.log("User ID:", n), n) try {
            const e = await fetch(`https://r22.core.learn.edgenuity.com/lmsapi/sle/api/enrollments/user/${n}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
            if (!e.ok) throw new Error(`HTTP error! status: ${e.status}`);
            return await e.json()
        } catch (n) {
            return console.error("Error fetching courses:", n), null
        } else console.error("No user ID available")
    }

    function h() {
        return document.getElementById("stageFrame") ? document.getElementById("stageFrame") : null
    }

    function v() {
        const n = h();
        if (n) return n.contentDocument?.getElementById("iFramePreview") ? n.contentDocument?.getElementById("iFramePreview") : null
    }
    document.addEventListener("DOMContentLoaded", (() => {
            console.log("DOM fully loaded, executing redirect to current activity"), "student.edgenuity.com" === window.location.hostname ? 1 === GM_getValue("advanceClick") && (GM_setValue("advanceClick", 2), "Unlocked Advance" === GM_getValue("advanceType") && (console.log("Unlocked Advance", window.location.href.split("coursemap")[0] + "coursemap"), GM_setValue("backUrl", window.location.href.split("coursemap")[0] + "coursemap")), function() {
                console.log("Checking for current activity tile...");
                const n = () => {
                    const n = document.querySelector(".ActivityTile-status-current");
                    if (n) {
                        let e = n;
                        for (; e && !e.href;) e = e.parentElement;
                        return e && e.href ? (console.log("Found current activity, redirecting to:", e.href), window.location.href = e.href, console.log("Redirecting to:", e.href)) : console.log("Current activity found but no href attribute available"), !0
                    }
                    return console.log("No current activity tile found yet, waiting..."), !1
                };
                if (!n()) {
                    const e = setInterval((() => {
                        n() && clearInterval(e)
                    }), 1e3);
                    setTimeout((() => {
                        clearInterval(e), console.log("Gave up waiting for current activity element")
                    }), 3e4)
                }
            }()) : window.location.hostname.match(/^r\d+\.core\.learn\.edgenuity\.com$/) && 2 === GM_getValue("advanceClick") && (GM_setValue("advanceClick", 0), d())
        })),
        function() {
            let n, i = !1,
                d = {};

            function u(n, e, t, i) {
                n.click(), console.log("Clicked!!!!"), setTimeout((async () => {
                    const n = document.getElementById("lessonInfo"),
                        a = n.querySelectorAll('thspan[data-rwthpgen="1"]');
                    if (console.log("Length:", a.length, a), 4 === a.length) {
                        const s = a[2];
                        if (console.log("gradeBar:", n, s), "100" === s.textContent.trim() && (console.log("Answers:", t), console.log("Scores:", i), i))
                            if ("number" == typeof i) i >= 90 && await o(e, t, i);
                            else
                                for (let n = 0; n < i.length; n++) i[n] >= 90 && await o(e[n], t[n], i[n])
                    }
                }), 15e3)
            }
            async function p(n, e, t, o) {
                l("writing"), e.split(" "), n.setData("");
                const i = 6e4 / (t.answerDelay || 30),
                    a = t.typingStyle,
                    s = "Enabled" === t.placeholder,
                    r = t.placeholderText || "This topic has many sides to consider, each offering unique insights required to understand.",
                    c = e === r,
                    d = async (e, t = !1) => new Promise((o => {
                        let s = 0;
                        const r = e.split(" "),
                            l = () => {
                                if (s < r.length) {
                                    let e = r[s],
                                        o = 0;
                                    const c = e.split("");
                                    let d = !1,
                                        u = "",
                                        p = !1;
                                    const m = () => {
                                        if (p)
                                            if (u.length > 0) {
                                                u = u.slice(0, -1);
                                                let t = 0 === s ? "" : r.slice(0, s).join(" ") + " ";
                                                n.setData(t + u), setTimeout(m, i / e.length)
                                            } else p = !1, d = !1, o = 0, setTimeout(m, i / e.length);
                                        else {
                                            if (!t && !d && 0 === o) {
                                                const n = {
                                                    "Level 1": .1,
                                                    "Level 2": .25,
                                                    "Level 3": .4
                                                } [a] || 0;
                                                d = Math.random() < n, d && (u = function(n) {
                                                    const e = {
                                                            swap: n => {
                                                                if (n.length < 2) return n;
                                                                const e = Math.floor(Math.random() * (n.length - 1));
                                                                return n.slice(0, e) + n[e + 1] + n[e] + n.slice(e + 2)
                                                            },
                                                            typo: n => {
                                                                const e = {
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
                                                                    z: ""
                                                                };
                                                                if (n.length < 1) return n;
                                                                const t = Math.floor(Math.random() * n.length),
                                                                    o = n[t].toLowerCase(),
                                                                    i = e[o] ? e[o][Math.floor(Math.random() * e[o].length)] : o;
                                                                return n.slice(0, t) + i + n.slice(t + 1)
                                                            },
                                                            shuffle: n => n.split("").sort((() => Math.random() - .5)).join("")
                                                        },
                                                        t = "shuffle";
                                                    return console.log("Mistake Type:", t), e[t](n)
                                                }(e))
                                            }
                                            if (o < (d ? u.length : c.length)) {
                                                let t = 0 === s ? "" : r.slice(0, s).join(" ") + " ",
                                                    a = d ? u.slice(0, o + 1) : c.slice(0, o + 1).join("");
                                                if (n.setData(t + a), o++, d && o === u.length) return p = !0, void setTimeout(m, i / 2);
                                                setTimeout(m, i / e.length)
                                            } else {
                                                let t = r.slice(0, s).join(" ") + (s > 0 ? " " : "") + (d ? u : e);
                                                n.setData(t), s++, setTimeout(l, i)
                                            }
                                        }
                                    };
                                    m()
                                } else o()
                            };
                        l()
                    }));
                setTimeout((() => {
                    (async () => {
                        s && !c && (await d(r, !0), await new Promise((n => setTimeout(n, 2e3))), await (async () => new Promise((e => {
                            let t = n.getData();
                            const o = () => {
                                t.length > 0 ? (t = t.slice(0, -1), n.setData(t), setTimeout(o, i / 10)) : e()
                            };
                            o()
                        })))(), await new Promise((n => setTimeout(n, 1e3)))), await d(e, c), o && o()
                    })()
                }), 2e3)
            }!async function() {
                console.log("Get started!!!~~~~~~~~~~~!!!");
                try {
                    if (initialization) {
                        const n = initialization?.InitialLaunchData?.LMSAPIBasePath,
                            e = n.split("//")[1].split(".")[0];
                        console.log("lms_base_url:", e);
                        const t = initialization?.InitialLaunchData?.UserID;
                        console.log("Session User ID:", t);
                        const o = initialization?.pk;
                        console.log("Cookie User ID:", o);
                        const i = initialization?.InitialLaunchData?.CourseName;
                        console.log("Course name:", i),
                            function(n) {
                                const e = document.getElementById("lessonInfo");
                                if (!e) return;
                                const t = e.offsetWidth;
                                if (console.log("Title Width", t), !document.getElementById("lesson-number-style")) {
                                    const n = document.createElement("style");
                                    n.id = "lesson-number-style", n.textContent = `\n      .lesson-number-container {\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        text-align: center;\n        z-index: 999999;\n        animation: fadeIn 0.3s ease-out;\n        height: 120px;\n        width: ${t}px;\n        margin: 0 auto;\n        font-family: 'Poppins', system-ui, -apple-system, sans-serif;\n      }\n\n      .lesson-number {\n        display: flex;\n        flex-direction: column;\n        justify-content: center;\n        align-items: flex-start;\n        width: 100%;\n        font-size: 15px;\n        font-weight: 600;\n        padding: 8px 12px;\n        background: #141517;\n        border: 1px solid rgba(0, 108, 255, 0.1);\n        border-radius: 12px;\n        color: white;\n        font-family: 'Poppins', system-ui, -apple-system, sans-serif;\n        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);\n        box-sizing: border-box;\n        height: 80px;\n        position: relative;\n      }\n\n      .progress-bar {\n        position: relative;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        background: #242526;\n        border-radius: 10px;\n      }\n\n      .progress-text {\n        margin-top: 8px;\n        font-size: 13px;\n        opacity: 0.9;\n      }\n\n      @keyframes fadeIn {\n        from {\n          opacity: 0;\n          transform: translateY(10px);\n        }\n        to {\n          opacity: 1;\n          transform: translateY(0);\n        }\n      }\n\n      .progress-bar::before {\n        content: '';\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        height: 10px;\n        width: 100%;\n        background: #242526;\n        border-radius: 10px;\n      }\n\n      .progress-bar::after {\n        content: '';\n        position: absolute;\n        top: 50%;\n        left: 0;\n        transform: translateY(-50%);\n        height: 10px;\n        width: 0%;\n        background: #006cff;\n        animation: fillBar 1s ease-out forwards;\n        border-radius: 10px;\n        box-shadow: 0 0 10px rgba(0, 108, 255, 0.3);\n      }\n\n      @keyframes fillBar {\n        from {\n          width: 0%;\n        }\n        to {\n          width: calc(100% * var(--progress) / 100);\n        }\n      }\n    `, document.head.appendChild(n)
                                }
                                let o = document.querySelector(".lesson-number-container");
                                if (o) o.style.width = `${t}px`;
                                else {
                                    o = document.createElement("div"), o.className = "lesson-number-container", o.style.width = `${t}px`;
                                    const n = document.createElement("span");
                                    n.className = "lesson-number";
                                    const e = document.createElement("div");
                                    e.className = "progress-bar";
                                    const i = document.createElement("div");
                                    i.className = "progress-text", n.appendChild(e), n.appendChild(i), o.appendChild(n), document.body.appendChild(o)
                                }
                                const i = document.getElementById("lessonInfo");
                                i && new ResizeObserver((n => {
                                    for (const e of n) {
                                        const n = e.contentRect.width;
                                        o.style.width = `${n}px`
                                    }
                                })).observe(i);
                                const a = o.querySelector(".lesson-number"),
                                    s = a.querySelector(".progress-text");
                                a.style.animation = "none", a.offsetHeight, a.style.animation = "fadeIn 0.3s ease-out", a.style.setProperty("--progress", `${n}`), s.textContent = `You are ${n}% completed`
                            }(initialization?.InitialActivityData?.Progress);
                        const s = document.querySelector("a.footnav.goRight");
                        s && s.addEventListener("click", (async () => {
                            console.log("Next Activity Button clicked!!!!");
                            try {
                                console.log("Fetching next activity data...");
                                const n = initialization?.InitialActivityData?.ActivityOrder;
                                console.log("Activity ID:", n);
                                const o = initialization?.InitialLaunchData?.ContextID;
                                console.log("Context ID:", o);
                                const i = await fetch(`https://${e}.core.learn.edgenuity.com/lmsapi/req/navigation/getnextactivity?UserID=${t}&StudentBuildID=${o}&ActivityOrder=${n}&IsSSLimited=False&AllowPretestsAndQuizzes=False`, {
                                    method: "GET",
                                    credentials: "include",
                                    headers: {
                                        Accept: "application/json"
                                    }
                                });
                                if (!i.ok) throw new Error(`HTTP error! status: ${i.status}`);
                                const s = await i.json(),
                                    {
                                        IsRestrictedActivity: r
                                    } = s?.Navigation;
                                if (console.log("Is Restricted:", r), r) {
                                    let n;
                                    const t = () => {
                                        const t = h(),
                                            o = t?.contentWindow.document.querySelectorAll(".overlay-attempt"),
                                            i = Array.from(o).find((n => n.querySelector(".overlay-attempt-button.overlay-attempt-button-lock")));
                                        i && (i.style.cursor = "pointer", i.style.border = "2px solid rgba(255, 215, 0, 0.7)", i.style.transition = "all 0.3s ease", i.addEventListener("mouseenter", (() => {
                                            i.style.boxShadow = "0 0 20px 10px rgba(255, 215, 0, 0.7)"
                                        })), i.addEventListener("mouseleave", (() => {
                                            i.style.boxShadow = "none"
                                        })), i.addEventListener("click", (() => {
                                            i.style.transform = "scale(0.95)", i.style.boxShadow = "0 0 30px 15px rgba(255, 215, 0, 0.9)", setTimeout((() => {
                                                i.style.transform = "scale(1)", i.style.boxShadow = "none"
                                            }), 200)
                                        })), i.onclick = async () => {
                                            console.log("Initial Activity Order:", initialization?.InitialActivityData?.ActivityOrder);
                                            try {
                                                const t = await fetch(`https://${e}.core.learn.edgenuity.com/Player/LTILaunch`, {
                                                        headers: {
                                                            "content-type": "application/x-www-form-urlencoded"
                                                        },
                                                        body: Object.keys(initialization.InitialLaunchData).map((n => `${n}=${encodeURIComponent(initialization.InitialLaunchData[n])}`)).join("&"),
                                                        method: "POST"
                                                    }),
                                                    o = await t.text(),
                                                    i = new DOMParser,
                                                    s = i.parseFromString(o, "text/html").querySelector("form"),
                                                    r = new FormData(s),
                                                    l = Object.fromEntries(r);
                                                console.log("Data:", l);
                                                const d = await fetch(`https://${e}.core.learn.edgenuity.com/contentviewers/ltilogin`, {
                                                        headers: {
                                                            "content-type": "application/x-www-form-urlencoded"
                                                        },
                                                        body: Object.keys(l).map((n => `${n}=${encodeURIComponent(l[n])}`)).join("&"),
                                                        method: "POST"
                                                    }),
                                                    u = await d.text(),
                                                    p = i.parseFromString(u, "text/html").getElementById("launchdata").value;
                                                console.log("Launch Data:", `${p.substring(0,10)}...`);
                                                const m = await fetch(`https://${e}.core.learn.edgenuity.com/ContentViewers/AssessmentViewer/Activity`, {
                                                        headers: {
                                                            "content-type": "application/x-www-form-urlencoded"
                                                        },
                                                        body: `launchdata=${p}`,
                                                        method: "POST"
                                                    }),
                                                    g = await m.text(),
                                                    y = i.parseFromString(g, "text/html"),
                                                    h = Array.from(y.querySelectorAll(".question-buttons ol li")).slice(1, -1).map((n => n.id));
                                                console.log("Ids:", h), localStorage.setItem("ids", JSON.stringify(h)), a = n = h, a = n, document.querySelector("#examInfoPanel") && c(n);
                                                let v = [];
                                                const f = {};
                                                y.querySelectorAll("script").forEach((n => {
                                                    const e = n.textContent;
                                                    e.includes("ActivityKeys") && e.match(/this\.[a-zA-Z]+Key = "(.*?)";/g).forEach((n => {
                                                        const e = n.match(/this\.([a-zA-Z]+Key)/)[1],
                                                            t = n.match(/"([^"]+)"/)[1];
                                                        f[e] = t
                                                    }))
                                                })), console.log("Activity Keys:", f), await Promise.all(h.map((n => (async (n, t, o) => {
                                                    const i = new DOMParser;
                                                    let a = o.learningObjectKey,
                                                        s = o.resultKey,
                                                        r = o.enrollmentKey,
                                                        l = o.sessionKey;
                                                    return fetch(`https://${e}.core.learn.edgenuity.com/ContentViewers/AssessmentViewer/LoadQuestion`, {
                                                        headers: {
                                                            "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                                                        },
                                                        body: `learningObjectKey=${a}&resultKey=${s}&enrollmentKey=${r}&questionKey=${n}&sessionKey=${l}`,
                                                        method: "POST"
                                                    }).then((n => n.json())).then((a => {
                                                        const s = i.parseFromString(a.html, "text/html");
                                                        let r = Array.from(s.querySelectorAll(".Practice_Question_Body .answer-choice input")).map((n => [n.name, n.value]));
                                                        console.log("Inputs:", r);
                                                        let l = Array.from(s.querySelectorAll(".Practice_Question_Body select option")).map((n => {
                                                                if (n.hasAttribute("value")) return [n.parentElement.name, n.value]
                                                            })).filter(Boolean),
                                                            c = Array.from(s.querySelectorAll("input[type='text']")).map((n => [n.name, "FILL_WITH_TEXT"])),
                                                            d = r.concat(l).concat(c),
                                                            u = t.filter((e => e.question_id.includes(n)));
                                                        return (async (n, t, o, i) => {
                                                            let a = [];
                                                            return n.find((n => {
                                                                o.forEach((e => {
                                                                    e.question_id.includes(n[1]) || "on" == n[1] && e.question_id == n[0] ? a.push([n[0], n[1]]) : "FILL_WITH_TEXT" == n[1] && a.push([n[0], e.optional_data.trim().replace(/"/g, "")])
                                                                }))
                                                            })), fetch(`https://${e}.core.learn.edgenuity.com/ContentViewers/AssessmentViewer/ChangeQuestionAnswer`, {
                                                                headers: {
                                                                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                                                                },
                                                                body: `learningObjectKey=${i.learningObjectKey}&resultKey=${i.resultKey}&enrollmentKey=${i.enrollmentKey}&sessionKey=${i.sessionKey}&language=0&questionKey=${t}${a.map((n=>`&${n[0]}=${n[1]}`)).join("")}`,
                                                                method: "POST"
                                                            }).then((n => n.json())).then((n => {}))
                                                        })(d, n, u, o)
                                                    }))
                                                })(n, v, f)))), await fetch(`https://${e}.core.learn.edgenuity.com/contentengineapi/api/assessment/SubmitAssessmentSimpleResponse?learningObjectKey=${f.learningObjectKey}&resultKey=${f.resultKey}&enrollmentKey=${f.enrollmentKey}&sessionKey=${f.sessionKey}&autoSubmitted=false&UpdateLastTime=true`)
                                            } catch (n) {
                                                console.error("Error in overlay click handler:", n)
                                            }
                                            var n
                                        }, clearInterval(n))
                                    };
                                    n = setInterval(t, 3e3)
                                }
                                const l = document.getElementById("aEnotes");
                                s.NextObjectType?.startsWith("A") && l && l.click()
                            } catch (n) {
                                console.error("Error fetching next activity data:", n)
                            }
                        }))
                    }
                } catch (n) {
                    console.log(n.message)
                }
                r((n => {
                    console.log("Config:", n), d = n
                }));
                const o = h();
                o && (n = setInterval((async () => {
                    if (i) return console.log("Stopping script because pastContent is detected."), void clearInterval(n);
                    const a = document.getElementById("activity-title")?.innerText;
                    if (!a || "Complete" === document.getElementById("activity-status")?.innerText) {
                        const e = o?.contentWindow.document.getElementById("journal-ckeditor")?.innerText?.trim(),
                            t = o?.contentWindow.document.querySelector(".OnlineContent-textArea-div")?.innerText?.trim();
                        let a = e || t;
                        return console.log("Completed!!!!!!!", a), void(a && (i = !0, s("Human Score", 77), clearInterval(n)))
                    }
                    if (!d.isActive) return void console.log("Start button not clicked yet.");
                    if (!o.contentWindow?.CKEDITOR) return void console.log("CKEditor not displayed!!!!!");
                    const r = o.contentDocument?.querySelectorAll("#contentViewer #OnlineContent-Links .weblink");
                    if (console.log("Links:", r), r?.length) {
                        console.log("Links length:", r.length), clearInterval(n);
                        let i = 0;
                        const a = Object.keys(o.contentWindow.CKEDITOR.instances).length;
                        console.log("needToAnswer:", a), Object.keys(o.contentWindow.CKEDITOR.instances).forEach((async n => {
                            const l = o.contentWindow.CKEDITOR.instances[n],
                                c = o.contentDocument.getElementById(l.name)?.parentElement?.querySelector("p")?.innerText;
                            console.log("Question:", c);
                            try {
                                const n = "Enabled" === d.placeholder ? new Promise((n => {
                                    const e = "This topic has many sides to consider, each offering unique insights required to understand.";
                                    l.setData(""), p(l, e, {
                                        ...d,
                                        typingStyle: "None"
                                    }, (() => {
                                        let t = e;
                                        const o = setInterval((() => {
                                            t.length > 0 ? (t = t.slice(0, -1), l.setData(t)) : (clearInterval(o), n())
                                        }), 50)
                                    }))
                                })) : Promise.resolve();
                                let m = c?.match(/\( *Site *[0-9]+ *\)/g)?.join("");
                                m = m?.replace(/\( *Site *([0-9]+) *\)/, "$1");
                                let g = [],
                                    y = [];
                                const h = m ? r[parseInt(m) - 1]?.getAttribute("href") : r[0]?.getAttribute("href"),
                                    v = await fetch(h),
                                    f = await v.text(),
                                    w = (new DOMParser).parseFromString(f, "text/html");
                                w.querySelector("footer")?.remove();
                                const b = ["h1", "h2", "p", "li"].reduce(((n, e) => (Array.from(w.getElementsByTagName(e)).forEach((e => {
                                        n += e.textContent?.trim() + " "
                                    })), n.trim())), ""),
                                    x = document.getElementById("activity-title")?.innerText;
                                if ("Online Content" === x && GM_getValue("settings") && "Keywords (100% Accuracy)" === GM_getValue("settings")["auto-writing-use"]) l.setData(b), i++;
                                else {
                                    s("Human Score");
                                    const [r, m] = await Promise.all([e(b), n]), h = r.humanizedText;
                                    console.log("Online Content Answer:", h);
                                    const v = (await t(h)).humanScore;
                                    console.log("Online Content scores:", v), s("Human Score", v), g.push(h), y.push(c), d.isActive ? p(l, h, d, (() => {
                                        if (i++, i === a) {
                                            const n = o.contentWindow.document.getElementById("SubmitQuestionsButton");
                                            n.disabled = !1, u(n, y, g, v)
                                        }
                                    })) : (l.setData(h), i++)
                                }
                            } catch (n) {
                                console.error("Error processing answer:", n)
                            }
                        }))
                    } else {
                        clearInterval(n);
                        const i = o.contentWindow.document.getElementById("journal-prompt") || o.contentWindow.document.querySelector(".text-box-container"),
                            a = o.contentWindow.CKEDITOR.instances.Answer || o.contentWindow.CKEDITOR.instances["essay-Content"];
                        try {
                            s("Human Score");
                            const n = "Enabled" === d.placeholder ? new Promise((n => {
                                    const e = "This topic has many sides to consider, each offering unique insights required to understand.";
                                    a.setData(""), p(a, e, {
                                        ...d,
                                        typingStyle: "None"
                                    }, (() => {
                                        let t = e;
                                        const o = setInterval((() => {
                                            t.length > 0 ? (t = t.slice(0, -1), a.setData(t)) : (clearInterval(o), n())
                                        }), 50)
                                    }))
                                })) : Promise.resolve(),
                                [r, l] = await Promise.all([e(i?.innerText), n]);
                            console.log(r);
                            const c = r.humanizedText;
                            console.log("Journal Answer:", c);
                            const m = (await t(c)).humanScore;
                            console.log("Journal scores:", m), s("Human Score", m), p(a, c, {
                                ...d,
                                placeholder: "Disabled"
                            }, (() => {
                                const n = o.contentWindow.document.getElementById("SubmitButton") || o.contentWindow.document.querySelector(".uibtn.uibtn-blue.uibtn-med.uibtn-alt");
                                n.disabled = !1, u(n, i?.innerText, c, m)
                            }))
                        } catch (n) {
                            console.error("Error:", n)
                        }
                    }
                }), 1e3))
            }()
        }()
})();
//# sourceMappingURL=bundle.user.js.map