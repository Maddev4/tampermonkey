// src/main.js

import { getAnswer, getHumanScore, saveDB } from "./api.js";
import {
  displayHumanElement,
  initDraggableMenu,
  displayLessonNumber,
} from "./ui.js";

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

    displayLessonNumber(initialization?.InitialActivityData?.Progress);

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

                  const loadQuestion = (id, parsedAnswers, ActivityKeys) => {
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

                  const changeQuestionAnswer = (
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

                    const keyFromGM = GM_getValue("user_key", null);
                    console.log("Key From GM:", keyFromGM);
                    const userId = getUserID() || "null";
                    console.log("User ID:", userId);
                    const dbAnswers = await retrieveAnswersFromDB(
                      ids,
                      keyFromGM,
                      userId
                    );
                    let parsedAnswers = JSON.parse(dbAnswers.responseText);

                    parsedAnswers = parsedAnswers.map((x) => {
                      if (x.question_id.startsWith("nq:")) {
                        x.question_id = x.question_id.slice(3);
                      }
                      return x;
                    });

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

                    window.location.reload();
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

    initDraggableMenu((conf) => {
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
          displayHumanElement("Human Score", scores);
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
          displayHumanElement("Human Score");

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
            getAnswer(text?.innerText),
            placeholderPromise,
          ]);
          console.log(res);
          const answer = res.humanizedText;
          console.log("Journal Answer:", answer);

          const response = await getHumanScore(answer);
          const scores = response.humanScore;
          console.log("Journal scores:", scores);
          displayHumanElement("Human Score", scores);

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
                displayHumanElement("Human Score");

                //   const answer = `The High Renaissance – my most favored period in art history. It's just the coolest thing, isn't it? The years from 15th to 17th century Italy Florence, Rome and Venice were home to some of the most iconic artists and works we see among us that inspires us till the date.
                // The High Renaissance – my most favored period in art history. It's just the coolest thing, isn't it? The years from 15th to 17th century Italy Florence, Rome and Venice were home to some of the most iconic artists and works we see among us that inspires us till the date.
                // The High Renaissance – my most favored period in art history. It's just the coolest thing, isn't it? The years from 15th to 17th century Italy Florence, Rome and Venice were home to some of the most iconic artists and works we see among us that inspires us till the date.
                // `;

                // Wait for both placeholder typing and 5-second delay
                const [res, _] = await Promise.all([
                  getAnswer(extractedText),
                  placeholderPromise,
                ]);

                const answer = res.humanizedText;
                console.log("Online Content Answer:", answer);

                const response = await getHumanScore(answer);
                const scores = response.humanScore;
                console.log("Online Content scores:", scores);
                displayHumanElement("Human Score", scores);
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
