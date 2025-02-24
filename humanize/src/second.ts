/*  -----------------------------------------------------------------------------------------------

    -- automatic_writing.ts --
    Copyright (c) 2024 Revolt.

    ----------------------------------------------------------------------------------------------- */

// import { getActivatedModules } from "../../../module_manager";
declare function GM_xmlhttpRequest(
  options: GMXMLHttpRequestOptions
): Promise<GMXMLHttpRequestResponse>;

export function getStageFrame(): HTMLIFrameElement | null {
  if (document.getElementById("stageFrame") === null) {
    return null;
  }
  return <HTMLIFrameElement>document.getElementById("stageFrame");
}

export function getIframePreview(): HTMLIFrameElement | null {
  let stageFrame = getStageFrame();
  if (stageFrame !== null && stageFrame.contentWindow !== null) {
    return stageFrame.contentWindow.document.getElementById(
      "iFramePreview"
    ) as HTMLIFrameElement;
  } else {
    return null;
  }
}

export async function getAnswer(answer: string) {
  return new Promise<GMXMLHttpRequestResponse>((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://localhost:3000/api/process",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        prompt: answer || null,
      }),
      onload: function (response: GMXMLHttpRequestResponse) {
        if (response.status === 200) {
          const data = JSON.parse(response.responseText);
          resolve(data);
        } else {
          reject("Failed to call the localhost API");
        }
      },
      onerror: function (error: any) {
        reject("Error calling the localhost API: " + error);
      },
    });
  });
}

let interval: NodeJS.Timeout;

function submitWriting(submitBtn: HTMLButtonElement) {
  // if (getActivatedModules().includes("delay-submit")) {
  //   let GMSettings = GM_getValue("settings") as any;
  //   let minDelay = GMSettings["submit-delay"]["Auto Writing"][0];
  //   let maxDelay = GMSettings["submit-delay"]["Auto Writing"][1];
  //   let delay =
  //     Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

  //   setTimeout(() => {
  //     submitBtn.click();
  //   }, delay * 1000);
  // } else {
  submitBtn.click();
  // }
}

function activateAutomaticWriting() {
  const stageFrame = getStageFrame();
  if (!stageFrame) return;
  interval = setInterval(async () => {
    let examTitle = document.getElementById("activity-title")?.innerText;
    if (!examTitle) return;
    if (document.getElementById("activity-status")?.innerText === "Complete")
      return;

    if (!stageFrame.contentWindow?.CKEDITOR) return;
    let links = stageFrame.contentDocument?.querySelectorAll(
      "#contentViewer #OnlineContent-Links .weblink"
    );
    if (links?.length === 0) {
      // no link
      clearInterval(interval);
      let text =
        stageFrame.contentWindow?.document.getElementById("journal-prompt") ||
        stageFrame.contentWindow?.document.querySelector(".text-box-container");
      let editor =
        stageFrame.contentWindow?.CKEDITOR.instances["Answer"] ||
        stageFrame.contentWindow?.CKEDITOR.instances["essay-Content"];
      editor.setData("Sit tight while Revolt generates a response... ✨");

      await getAnswer(text?.innerText as string).then((res) => {
        let parsedRes = JSON.parse(res.responseText);
        let answer = JSON.parse(parsedRes).data;
        editor.setData(answer);

        setTimeout(() => {
          let submitBtn =
            (stageFrame.contentWindow?.document.getElementById(
              "SubmitButton"
            ) as HTMLButtonElement) ||
            (stageFrame.contentWindow?.document.querySelector(
              ".uibtn.uibtn-blue.uibtn-med.uibtn-alt"
            ) as HTMLButtonElement);
          submitBtn.disabled = false;
          submitWriting(submitBtn);
        }, 1000);
      });
    } else {
      // link
      clearInterval(interval);
      let answered = 0;
      let needToAnswer = Object.keys(
        stageFrame.contentWindow?.CKEDITOR.instances
      ).length;
      Object.keys(stageFrame.contentWindow?.CKEDITOR.instances).forEach(
        async (key) => {
          let editor = stageFrame.contentWindow?.CKEDITOR.instances[key];
          let question = stageFrame.contentDocument
            ?.getElementById(editor.name)
            ?.parentElement?.querySelector("p")?.innerText;
          let siteNumber = question?.match(/\( *Site *[0-9]+ *\)/g)?.join("");
          siteNumber = siteNumber?.replace(/\( *Site *([0-9]+) *\)/, "$1");
          editor.setData("Sit tight while Revolt generates a response... ✨");

          let endpoint;
          if (!siteNumber)
            endpoint = links?.[0]?.getAttribute("href") as string;
          else
            endpoint = links?.[
              (siteNumber as unknown as number) - 1
            ]?.getAttribute("href") as string;

          await fetch(endpoint, {
            method: "GET",
          })
            .then((res) => res.text())
            .then(async (aRes) => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(aRes, "text/html");

              const footer = doc.querySelector("footer");
              if (footer) footer.remove();

              function extractTextFromTags(
                doc: Document,
                tags: string[]
              ): string {
                let textContent = "";
                tags.forEach((tag) => {
                  const elements = doc.getElementsByTagName(tag);
                  for (let element of elements) {
                    textContent += element.textContent?.trim() + " ";
                  }
                });
                return textContent.trim();
              }

              const extractedText = extractTextFromTags(doc, [
                "h1",
                "h2",
                "p",
                "li",
              ]);

              let GMSettings = GM_getValue("settings") as any;
              if (
                examTitle === "Online Content" &&
                GMSettings["auto-writing-use"] === "Keywords (100% Accuracy)"
              ) {
                editor.setData(extractedText);
                answered++;
              } else {
                await getAnswer(extractedText + "\n" + question).then((res) => {
                  let parsedRes = JSON.parse(res.responseText);
                  let answer = JSON.parse(parsedRes).data;
                  answer = answer.replace(/\*/g, "");
                  editor.setData(answer);
                  answered++;
                });
              }

              if (answered === needToAnswer) {
                setTimeout(() => {
                  let submitBtn =
                    stageFrame.contentWindow?.document.getElementById(
                      "SubmitQuestionsButton"
                    ) as HTMLButtonElement;
                  submitBtn.disabled = false;
                  submitWriting(submitBtn);
                }, 1000);
              }
            });
        }
      );
    }
  }, 1000);
}

activateAutomaticWriting();
