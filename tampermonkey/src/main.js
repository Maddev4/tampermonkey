// src/main.js

import { getAnswer, getHumanScore, saveDB } from "./api.js";
import { displayHumanElement } from "./ui.js";

(function () {
  "use strict";

  let stop = false;
  let interval;

  // Helper to retrieve the stage frame element
  function getStageFrame() {
    return document.getElementById("stageFrame") || null;
  }

  // Simulated submission function
  function submitWriting(submitBtn, questions, answers) {
    submitBtn.click();
    console.log("Submit button clicked");

    setTimeout(async () => {
      // Simulated human score; in a real scenario, you might calculate or fetch this value
      const simulatedScore = 87;
      displayHumanElement(simulatedScore, "Human Score", 170);
      if (simulatedScore >= 90) {
        await saveDB(questions, answers, simulatedScore);
      }
    }, 15000);
  }

  // Main automatic writing activation function
  async function activateAutomaticWriting() {
    console.log("Automatic writing activated");

    const stageFrame = getStageFrame();
    if (!stageFrame) return;

    interval = setInterval(async () => {
      if (stop) {
        console.log("Script stopped");
        clearInterval(interval);
        return;
      }

      // Example: Check if the exam is complete (using a simulated status element)
      const examStatus = document.getElementById("activity-status")?.innerText;
      if (examStatus === "Complete") {
        stop = true;
        clearInterval(interval);
        return;
      }

      // Ensure CKEditor is available in the stage frame
      if (!stageFrame.contentWindow?.CKEDITOR) {
        console.log("CKEditor not available");
        return;
      }

      // If no external links are present, generate an answer
      const links = stageFrame.contentDocument?.querySelectorAll(
        "#contentViewer #OnlineContent-Links .weblink"
      );

      if (!links?.length) {
        clearInterval(interval);
        const textElement =
          stageFrame.contentWindow.document.getElementById("journal-prompt") ||
          stageFrame.contentWindow.document.querySelector(
            ".text-box-container"
          );
        const editor =
          stageFrame.contentWindow.CKEDITOR.instances["Answer"] ||
          stageFrame.contentWindow.CKEDITOR.instances["essay-Content"];

        editor.setData("Sit tight while Revolt generates a response... ✨");

        try {
          const response = await getAnswer(textElement?.innerText);
          const answer = response.humanizedText;
          console.log("Answer generated:", answer);
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
            submitWriting(submitBtn, textElement?.innerText, answer);
          }, 1000);
        } catch (error) {
          console.error("Error fetching answer:", error);
        }
      } else {
        // If multiple links are present, you can implement a multi-question workflow here
        console.log("Multiple links found. Custom handling required.");
        clearInterval(interval);
      }
    }, 1000);
  }

  // Start the automatic writing process
  activateAutomaticWriting();
})();
