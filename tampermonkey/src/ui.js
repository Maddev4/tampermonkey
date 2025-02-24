// src/ui.js

export function displayHumanElement(score, text, bottom) {
  // Get the stage frame element
  const stageFrame = document.getElementById("stageFrame");
  if (!stageFrame) return;

  // Add custom styles if not already present
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
          stroke-width: 10;
          transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
      }
      .human-text {
          font-size: 40px;
          font-weight: bold;
          transition: opacity 0.5s ease-in-out, fill 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // Create the human score container
  let container = document.createElement("div");
  container.className = "human-container";
  container.innerHTML = `
    <div class="human-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

  // Animate the progress
  let progressCircle = container.querySelector(".progress");
  let scoreText = container.querySelector(".human-text");
  let totalFrames = 60; // Approximately 1 second at 60fps
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
