function displaySpellElement(score, text, bottom) {
  // Create and append styles if not already added
  if (!document.querySelector("#custom-spell-style")) {
    let style = document.createElement("style");
    style.id = "custom-spell-style";
    style.innerHTML = `
          .spell-container {
              position: fixed;
              right: 50px;
              bottom: ${bottom}px;
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
          .spell-title {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              color: white;
          }
          .spell-circle-container {
              position: relative;
              width: 100px;
              height: 60px;
              margin: 0 auto;
          }
          .spell-circle {
              fill: transparent;
              stroke-width: 6;
              transition: stroke-dashoffset 1s linear;
          }
          .spell-text {
              font-size: 30px;
              font-weight: bold;
              fill: white;
              transition: opacity 0.5s ease-in-out;
          }
      `;
    document.head.appendChild(style);
  }

  let container = document.createElement("div");
  container.className = "spell-container";
  container.innerHTML = `
      <div class="spell-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-venetian-mask">
              <path d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1"></path><path d="M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5"></path><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"></path><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"></path><path d="M9 7v10"></path>
          </svg>
          ${text}
      </div>
      <div class="spell-circle-container">
          <svg width="100" height="60" viewBox="0 0 120 120">
              <circle class="spell-circle progress" cx="60" cy="60" r="48" stroke="green" stroke-dasharray="301.59" stroke-dashoffset="301.59" transform="rotate(-90 60 60)"></circle>
              <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="spell-text">0</text>
          </svg>
      </div>
  `;

  document.body.appendChild(container);

  // Animate the score and circle progress together
  let progressCircle = container.querySelector(".progress");
  let scoreText = container.querySelector(".spell-text");
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
    }
  }

  requestAnimationFrame(animate);
}

function displayGrammarElement(score, text, bottom) {
  // Create and append styles if not already added
  if (!document.querySelector("#custom-grammar-style")) {
    let style = document.createElement("style");
    style.id = "custom-grammar-style";
    style.innerHTML = `
          .grammar-container {
              position: fixed;
              right: 50px;
              bottom: ${bottom}px;
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
          .grammar-title {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              color: white;
          }
          .grammar-circle-container {
              position: relative;
              width: 100px;
              height: 60px;
              margin: 0 auto;
          }
          .grammar-circle {
              fill: transparent;
              stroke-width: 6;
              transition: stroke-dashoffset 1s linear;
          }
          .grammar-text {
              font-size: 30px;
              font-weight: bold;
              fill: white;
              transition: opacity 0.5s ease-in-out;
          }
      `;
    document.head.appendChild(style);
  }

  let container = document.createElement("div");
  container.className = "grammar-container";
  container.innerHTML = `
      <div class="grammar-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-venetian-mask">
              <path d="m3 17 2 2 4-4"></path><path d="m3 7 2 2 4-4"></path><path d="M13 6h8"></path><path d="M13 12h8"></path><path d="M13 18h8"></path>
          </svg>
          ${text}
      </div>
      <div class="grammar-circle-container">
          <svg width="100" height="60" viewBox="0 0 120 120">
              <circle class="grammar-circle progress" cx="60" cy="60" r="48" stroke="green" stroke-dasharray="301.59" stroke-dashoffset="301.59" transform="rotate(-90 60 60)"></circle>
              <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="grammar-text">0</text>
          </svg>
      </div>
  `;

  document.body.appendChild(container);

  // Animate the score and circle progress together
  let progressCircle = container.querySelector(".progress");
  let scoreText = container.querySelector(".grammar-text");
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
    }
  }

  requestAnimationFrame(animate);
}

function displaySimilarityElement(score, text, bottom) {
  // Create and append styles if not already added
  if (!document.querySelector("#custom-smilar-style")) {
    let style = document.createElement("style");
    style.id = "custom-smilar-style";
    style.innerHTML = `
          .smilar-container {
              position: fixed;
              right: 50px;
              bottom: ${bottom}px;
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
          .smilar-title {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              color: white;
          }
          .smilar-circle-container {
              position: relative;
              width: 100px;
              height: 60px;
              margin: 0 auto;
          }
          .smilar-circle {
              fill: transparent;
              stroke-width: 6;
              transition: stroke-dashoffset 1s linear;
          }
          .smilar-text {
              font-size: 30px;
              font-weight: bold;
              fill: white;
              transition: opacity 0.5s ease-in-out;
          }
      `;
    document.head.appendChild(style);
  }

  let container = document.createElement("div");
  container.className = "smilar-container";
  container.innerHTML = `
      <div class="smilar-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-venetian-mask">
              <circle cx="7" cy="12" r="3"></circle><path d="M10 9v6"></path><circle cx="17" cy="12" r="3"></circle><path d="M14 7v8"></path><path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1"></path>
          </svg>
          ${text}
      </div>
      <div class="smilar-circle-container">
          <svg width="100" height="60" viewBox="0 0 120 120">
              <circle class="smilar-circle progress" cx="60" cy="60" r="48" stroke="green" stroke-dasharray="301.59" stroke-dashoffset="301.59" transform="rotate(-90 60 60)"></circle>
              <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="smilar-text">0</text>
          </svg>
      </div>
  `;

  document.body.appendChild(container);

  // Animate the score and circle progress together
  let progressCircle = container.querySelector(".progress");
  let scoreText = container.querySelector(".smilar-text");
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
    }
  }

  requestAnimationFrame(animate);
}
