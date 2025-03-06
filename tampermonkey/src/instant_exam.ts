// @ts-nocheck

/*  -----------------------------------------------------------------------------------------------

    -- instant_exam.ts --
    Copyright (c) 2024 Revolt.

    ----------------------------------------------------------------------------------------------- */

import { Module } from "../../modules";
import { getStageFrame } from "../../utilities/get_stage_frame";
import {
  GMXMLHttpRequestOptions,
  GMXMLHttpRequestResponse,
} from "../../../types/greasemonkey.types";
import { getActivityTitle } from "../../utilities/get_activity_title";
import { getActivatedModules, deactivateModule } from "../../../module_manager";
import { retrieveAnswersFromDB } from "./automatic_exam";
import { getCookie, getUserID } from "../../../globals";

const whitelisted_activities = [
  "quiz",
  "unittest",
  "unittestreview",
  "cumulativeexam",
  "cumulativeexamreview",
  "practice",
  "pretest",
  "topicreviewactivity",
  "exam",
  "testreview",
  "test",
  "topictest",
  "gcquiz",
  "cumulativereviewactivity",
  "labassessment",
];

let findExamInterval;

function activateInstantExam() {
  const parser = new DOMParser();
  let prefix = getCookie("lms_base_url").split(".")[0];

  const getIds = () => {
    fetch(`https://${prefix}.core.learn.edgenuity.com/Player/LTILaunch`, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: Object.keys(initialization.InitialLaunchData)
        .map(
          (key) =>
            `${key}=${encodeURIComponent(
              initialization.InitialLaunchData[key]
            )}`
        )
        .join("&"),
      method: "POST",
    })
      .then((res) => res.text())
      .then((res) => {
        const parser = new DOMParser();
        const html = parser.parseFromString(res, "text/html");
        const form = html.querySelector("form");
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });

        fetch(
          `https://${prefix}.core.learn.edgenuity.com/contentviewers/ltilogin`,
          {
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: Object.keys(data)
              .map((key) => `${key}=${encodeURIComponent(data[key])}`)
              .join("&"),
            method: "POST",
          }
        )
          .then((res) => res.text())
          .then((res) => {
            const html = parser.parseFromString(res, "text/html");
            const thatWeirdShi = html.getElementById("launchdata").value;

            fetch(
              `https://${prefix}.core.learn.edgenuity.com/ContentViewers/AssessmentViewer/Activity`,
              {
                headers: {
                  "content-type": "application/x-www-form-urlencoded",
                },
                body: `launchdata=${thatWeirdShi}`,
                method: "POST",
              }
            )
              .then((res) => res.text())
              .then(async (res) => {
                const html = parser.parseFromString(res, "text/html");
                let ids = Array.from(
                  html.querySelectorAll(".question-buttons ol li")
                )
                  .slice(1, -1)
                  .map((li) => li.id);

                const keyFromGM = GM_getValue("user_key", null);
                const userId = getUserID() || "null";
                let dbAnswers = await retrieveAnswersFromDB(
                  ids,
                  keyFromGM,
                  userId
                );
                let parsedAnswers = JSON.parse(dbAnswers.responseText);

                // console.log(parsedAnswers);

                parsedAnswers = parsedAnswers.map((x: any) => {
                  if (x.question_id.startsWith("nq:"))
                    x.question_id = x.question_id.slice(3);
                  return x;
                });

                let ActivityKeys = {};
                const scriptTags = html.querySelectorAll("script");
                scriptTags.forEach((script) => {
                  const scriptContent = script.textContent;
                  if (scriptContent.includes("ActivityKeys")) {
                    // this.learningObjectKey = "6f9c8f36-6a62-6365-7473-000000000000";
                    // this.resultKey = "81ed520b-5a6f-ef11-8271-02d0f2328222";
                    // this.enrollmentKey = "824abfe6-596f-ef11-8271-02d0f2328222";
                    // this.sessionKey = "z0gbk5u3urdmrki32zy5zqe0";
                    // this.language = "0";

                    const keys = script.textContent.match(
                      /this\.[a-zA-Z]+Key = "(.*?)";/g
                    );
                    keys.forEach((key) => {
                      const keyName = key.match(/this\.([a-zA-Z]+Key)/)[1];
                      const keyValue = key.match(/"([^"]+)"/)[1];
                      ActivityKeys[keyName] = keyValue;
                    });
                  }
                });

                Promise.all(
                  ids.map((id) => loadQuestion(id, parsedAnswers, ActivityKeys))
                ).then(() => {
                  // console.log("All questions answered, submiting...");
                  fetch(
                    `https://${prefix}.core.learn.edgenuity.com/contentengineapi/api/assessment/SubmitAssessmentSimpleResponse?learningObjectKey=${ActivityKeys.learningObjectKey}&resultKey=${ActivityKeys.resultKey}&enrollmentKey=${ActivityKeys.enrollmentKey}&sessionKey=${ActivityKeys.sessionKey}&autoSubmitted=false&UpdateLastTime=true`
                  ).then((res) => {
                    // deactivateModule("instant-exam");
                    window.location.reload();
                  });
                });
              });
          });
      });
  };

  const loadQuestion = (id, parsedAnswers, ActivityKeys) => {
    let learningObjectKey = ActivityKeys.learningObjectKey;
    let resultKey = ActivityKeys.resultKey;
    let enrollmentKey = ActivityKeys.enrollmentKey;
    let sessionKey = ActivityKeys.sessionKey;

    return fetch(
      `https://${prefix}.core.learn.edgenuity.com/ContentViewers/AssessmentViewer/LoadQuestion`,
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: `learningObjectKey=${learningObjectKey}&resultKey=${resultKey}&enrollmentKey=${enrollmentKey}&questionKey=${id}&sessionKey=${sessionKey}`,
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((res) => {
        const html = parser.parseFromString(res.html, "text/html");

        let inputSelector = ".Practice_Question_Body .answer-choice input";
        let selectSelector = ".Practice_Question_Body select option";
        let inputTextSelector = "input[type='text']";

        let inputs = Array.from(html.querySelectorAll(inputSelector)).map(
          (li) => [li.name, li.value]
        );
        let selects = Array.from(html.querySelectorAll(selectSelector))
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

        return changeQuestionAnswer(answers, id, correctAnswers, ActivityKeys);
      });
  };

  const changeQuestionAnswer = (answers, id, correctAnswers, ActivityKeys) => {
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
            correctAnswer.optional_data.trim().replace(/"/g, ""),
          ]);
        }
      });
    });

    return fetch(
      `https://${prefix}.core.learn.edgenuity.com/ContentViewers/AssessmentViewer/ChangeQuestionAnswer`,
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: `learningObjectKey=${ActivityKeys.learningObjectKey}&resultKey=${
          ActivityKeys.resultKey
        }&enrollmentKey=${ActivityKeys.enrollmentKey}&sessionKey=${
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

  findExamInterval = setInterval(() => {
    // Initialization
    if (typeof initialization === "undefined") return;
    let stageFrame = getStageFrame();
    if (stageFrame && stageFrame.contentDocument) {
      let isAQuiz = false; // based on the object type
      let uWindow: any = unsafeWindow;
      let objectType = uWindow.initialization.InitialLaunchData.ObjectType;

      let stop = false;
      let beginBtn = stageFrame.contentDocument.querySelector(
        ".overlay-attempt.overlay-attempt-clickable .overlay-attempt-button-text"
      );
      if (beginBtn) {
        let beginBtnText = beginBtn.textContent;
        if (
          beginBtnText == "Click to Begin" ||
          beginBtnText == "Click to Continue" ||
          beginBtnText == "Click to BeginPre-Test"
        ) {
          if (objectType === undefined) isAQuiz = true;
        } else if (beginBtnText == "Begin Retake") {
          stop = true;
        }
      }

      if (objectType === "WP") isAQuiz = true;

      let activityTitle = getActivityTitle();
      let attemptId = uWindow.initialization.InitialActivityData.AttemptID;
      if (
        activityTitle &&
        !stop &&
        (attemptId === null ||
          isAQuiz ||
          whitelisted_activities.includes(activityTitle))
      ) {
        clearInterval(findExamInterval);
        fetch(
          `https://${prefix}.core.learn.edgenuity.com/lmsapi/req/navigation//StartActivity?UserID=${initialization.InitialLaunchData.UserID}&ContextID=${initialization.InitialLaunchData.ContextID}&ActivityOrder=${initialization.InitialActivityData.ActivityOrder}&IsSSLimited=${initialization.InitialLaunchData.IsSSLimited}&AllowPretestsAndQuizzes=${initialization.InitialLaunchData.AllowPretestsAndQuizzes}&SessionLogID=${initialization.InitialLaunchData.SessionID}`
        )
          .then((res) => res.json())
          .then((res) => {
            initialization.InitialLaunchData.ResourceLinkID =
              res.Navigation.ResourceLinkID;
            initialization.InitialLaunchData.ResultID =
              res.Navigation.AttemptID;
            initialization.InitialLaunchData.ObjectKey =
              res.Navigation.ObjectKey;
            getIds();
          });
      }
    }
    // let ids = Array.from(document.querySelectorAll(".question-buttons ol li")).slice(1, -1).map(li => li.id);
  }, 500);
}

function deactivateInstantExam() {
  clearInterval(findExamInterval);
}

export const instantExam: Module = {
  name: "Instant Exam",
  activate: activateInstantExam,
  deactivate: deactivateInstantExam,
};

export default instantExam;
