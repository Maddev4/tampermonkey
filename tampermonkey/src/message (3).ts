// -- automatic-instruction.ts --
// Copyright (c) 2023 Revolt.

// Description:
// This module attempts to automate many kinds of instruction activities.

// ----------------------------------------------------------------------------------------------- */

import { getActivatedModules } from "../../module_manager";
import { Module } from "../modules";
import { getActivityTitle } from "../utilities/get_activity_title";
import { getIframePreview, getStageFrame } from "../utilities/get_stage_frame";

let interval: any;
let total_time = "";

function automateInstructions() {
  interval = setInterval(() => {
    const stageFrame = getStageFrame();
    if (!stageFrame) return;
    stageFrame.contentDocument!.getElementById("invis-o-div")?.remove();

    const activityTitle = getActivityTitle();
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
      const questionsFrame =
        stageFrame?.contentDocument?.getElementById("iFramePreview");
      const isAVideo = questionsFrame?.style.display === "none";

      if (isAVideo) {
        let timerEle =
          stageFrame.contentDocument?.getElementById("uid1_time") ||
          stageFrame.contentDocument?.getElementById("uid2_time");
        if (timerEle) {
          let timerText = timerEle.textContent;
          let timerSplit = timerText?.split(" / ");
          let elapsed_time = timerSplit![0];
          total_time = timerSplit![1];

          // Check if elapsed time is within a range of 5 seconds of total time
          let elapsed_time_split = elapsed_time.split(":");
          let total_time_split = total_time.split(":");
          let elapsed_seconds =
            parseInt(elapsed_time_split[0]) * 60 +
            parseInt(elapsed_time_split[1]);
          let total_seconds =
            parseInt(total_time_split[0]) * 60 + parseInt(total_time_split[1]);
          if (total_seconds - elapsed_seconds < 5 && total_seconds != 0) {
            nextFrame(stageFrame);
            return;
          } else return;
        }
      }

      const iframePreview = getIframePreview();
      if (iframePreview) {
        iframePreview
          .contentDocument!.querySelectorAll("div[fstack]")
          .forEach((question) => {
            setTimeout(() => {
              let clickedAmount = 0;
              let input = question.querySelectorAll("input");
              if (input) {
                Array.from(input).forEach((input) =>
                  Math.random() > 0.5 ? input.click() : null
                ); // Click a random input
                clickedAmount++;
              }

              let select = question.querySelector("select");
              // We don't need to do anything here, since edgenuity doesn't require you to select anything in these types of questions.
              if (select) clickedAmount++;

              let ifFW = question.querySelector("iframe");
              let hintButton = ifFW?.contentDocument?.getElementById(
                "onlyButton"
              ) as HTMLButtonElement;
              if (hintButton) {
                setInterval(() => {
                  hintButton.click();
                  clickedAmount++;
                }, 250);
              }

              const doneButton = question.querySelectorAll(
                "div[title='done']"
              ) as NodeListOf<HTMLButtonElement>;
              if (doneButton && clickedAmount > 0) {
                Array.from(doneButton).forEach((button) => button.click());
                nextFrame(stageFrame);
              }
            });
          }, 500);
      }
    }
  }, 1000);
}

function nextFrame(stageFrame: HTMLIFrameElement) {
  if (getActivatedModules().includes("delay-advance")) {
    let GMSettings = GM_getValue("settings") as any;
    let minDelay = GMSettings["advance-delay"]["Instruction"][0];
    let maxDelay = GMSettings["advance-delay"]["Instruction"][1];
    let delay =
      Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    setTimeout(() => {
      (stageFrame.contentWindow as any).API.FrameChain.nextFrame();
      // console.log("Next question clicked after " + delay + " seconds.");
    }, delay * 1000);
  } else {
    // console.log("Without delay.");
    (stageFrame.contentWindow as any).API.FrameChain.nextFrame();
  }
}

function deactivateInstructions() {
  if (interval) clearInterval(interval);
}

export const automaticInstruction: Module = {
  name: "automaticInstruction",
  activate: automateInstructions,
  deactivate: () => deactivateInstructions,
};

export default automaticInstruction;
