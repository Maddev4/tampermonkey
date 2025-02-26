// src/main.js

import { getAnswer, getHumanScore, saveDB } from "./api.js";
import { displayHumanElement, initDraggableMenu } from "./ui.js";

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
    initDraggableMenu((conf) => {
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
          displayHumanElement(scores, "Human Score", 170);
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
