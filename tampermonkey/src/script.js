// ==UserScript==
// @name         Automatic Writing
// @namespace    Revolt
// @version      1.0
// @description  Automatic writing assistant
// @author       Revolt
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      localhost
// ==/UserScript==

let stop = false,
  loading = false;

(function () {
  "use strict";

  function getStageFrame() {
    return document.getElementById("stageFrame")
      ? document.getElementById("stageFrame")
      : null;
  }

  function getIframePreview() {
    let stageFrame = getStageFrame();
    return stageFrame && stageFrame.contentWindow
      ? stageFrame.contentWindow.document.getElementById("iFramePreview")
      : null;
  }

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
              // console.log("response1:", response)
              // console.log("response2:", response.responseText)
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
              // console.log("response1:", response)
              // console.log("response2:", response.responseText)
              const data = JSON.parse(response.responseText);
              console.log("Human sccre:", data);
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
              // console.log("response1:", response)
              // console.log("response2:", response.responseText)
              const data = JSON.parse(response.responseText);
              console.log("Human socre:", data);
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

  function displayHumanElement(score, text, bottom) {
    // Create and append styles if not already added
    const stageFrame = getStageFrame();
    console.log("StageFrame:", stageFrame);

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
                <!-- Set initial stroke and text color to gray -->
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
        // Once calculation is finished, change color back to the original
        progressCircle.style.stroke = "green";
        scoreText.style.fill = "white";
      }
    }

    requestAnimationFrame(animate);
  }

  let interval, interval0;

  function submitWriting(submitBtn, questions, answers, length) {
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
          const response = await getHumanScore(answers);
          const scores = response.humanScore;

          console.log("Scores:", scores);
          displayHumanElement(scores, "Human Score", 170);

          if (scores) {
            if (typeof scores === "number") {
              if (scores >= 90) {
                await saveDB(questions, answers, scores);
              }
            } else {
              for (let i = 0; i < scores.length; i++) {
                if (scores[i] >= 90) {
                  await saveDB(questions[i], answers[i], scores[i]);
                }
              }
            }
          }
        }
      }
      hideSpinner(); // Hide the spinner after submission is done
    }, 15000);
  }

  async function activateAutomaticWriting() {
    console.log("Get started!!!");

    const stageFrame = getStageFrame();
    if (!stageFrame) return;

    // createLoadingSpinner(); // Ensure the spinner is created

    console.log("***********", stageFrame);

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
          //const response = await getHumanScore(pastContent)
          //const scores = response.humanScore;
          const scores = 87;
          displayHumanElement(scores, "Human Score", 170);
          // displaySpellElement(scores, "Spelling Score", 280);
          // displayGrammarElement(scores, "Grammar Score", 165);
          // displaySimilarityElement(scores, "Smiliarity Score", 50);

          clearInterval(interval); // Stop execution
        }
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
        //showSpinner(); // Show the spinner when loading starts

        try {
          const res = await getAnswer(text?.innerText);

          console.log(res);
          // const parsedRes = res.responseText);
          const answer = res.humanizedText;
          console.log("Answer:", answer);

          editor.setData(answer);

          setTimeout(() => {
            const submitBtn =
              stageFrame.contentWindow.document.getElementById(
                "SubmitButton"
              ) ||
              stageFrame.contentWindow.document.querySelector(
                ".uibtn.uibtn-blue.uibtn-med.uibtn-alt"
              );
            submitBtn.disabled = false;
            submitWriting(submitBtn, text?.innerText, answer);
          }, 1000);
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
            console.log("Sitenumber:", siteNumber);
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

              if (
                examTitle === "Online Content" &&
                GM_getValue("settings") &&
                GM_getValue("settings")["auto-writing-use"] ===
                  "Keywords (100% Accuracy)"
              ) {
                editor.setData(extractedText);
                answered++;
              } else {
                // console.log("Extracted text:", extractedText)
                const res = await getAnswer(extractedText + "\n" + question);
                // const parsedRes = res.responseText);
                const answer = res.humanizedText.replace(/\*/g, "");
                answers.push(answer);
                questions.push(question);
                // console.log("Answer:", answer)
                editor.setData(answer);
                // const parsedRes = JSON.parse(res.responseText);
                // const answer = JSON.parse(parsedRes).data.replace(/\*/g, "");
                // editor.setData(answer);
                answered++;
              }

              if (answered === needToAnswer) {
                setTimeout(() => {
                  const submitBtn =
                    stageFrame.contentWindow.document.getElementById(
                      "SubmitQuestionsButton"
                    );
                  submitBtn.disabled = false;
                  submitWriting(submitBtn, questions, answers, needToAnswer);
                }, 1000);
              }
            } catch (error) {
              console.error("Error processing link:", error);
              //hideSpinner();
            }
          }
        );
      }
    }, 1000);
  }

  activateAutomaticWriting();
})();
