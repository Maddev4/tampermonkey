// src/api.js

export async function getAnswer(prompt) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://localhost:3000/api/process",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ prompt }),
      onload: function (response) {
        if (response.status === 200) {
          try {
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

export async function getHumanScore(answers) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://localhost:3000/api/process/human-score",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ answers }),
      onload: function (response) {
        if (response.status === 200) {
          try {
            const data = JSON.parse(response.responseText);
            console.log("Human Score:", data);
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

export async function saveDB(question, answer, score) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://localhost:3000/api/answer",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ question, answer, score }),
      onload: function (response) {
        if (response.status === 200) {
          try {
            const data = JSON.parse(response.responseText);
            console.log("Save DB response:", data);
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
