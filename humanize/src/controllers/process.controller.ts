import { Request, Response } from "express";
import axios from "axios";
import Groq from "groq-sdk";
import { getAnswerByQuestion } from "../models/answer.model";

// import console from "../utils/console";

const axiosInstance = axios.create({
  timeout: 60000, // Timeout in milliseconds
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

// Humbot Part: Humanize text if either generated text or provided text exists
async function humanize(generatedText: string): Promise<{
  humanScore: number;
  output: string;
}> {
  console.log("Calling Humbot API with text...");
  // Create Humanization Task
  console.log("Generated Text", generatedText);
  const { data } = await axios.post(
    "https://humbot.ai/api/humbot/v1/create",
    {
      input: generatedText,
      model_type: "Advanced",
    },
    {
      headers: {
        "api-key": process.env.HUMBBOT_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const taskId = data?.data?.task_id;
  console.log("Task Id", taskId);

  // Poll Humbot API for task completion
  const { output, words_used, ai_score } = await new Promise<{
    output: string;
    words_used: number;
    ai_score: number;
  }>((resolve, reject) => {
    let timer = 0;
    const interval = setInterval(async () => {
      try {
        console.log("Retrieving Humbot API with task Id...", ++timer);
        const humbotRetrieveResponse = await axiosInstance.get(
          `https://humbot.ai/api/humbot/v1/retrieve?task_id=${taskId}`,
          {
            headers: {
              "api-key": process.env.HUMBBOT_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        const {
          words_used,
          output,
          detection_score: ai_score,
        } = humbotRetrieveResponse.data.data;

        // console.log(humbotRetrieveResponse.data.data);

        if (words_used) {
          clearInterval(interval);
          resolve({ output, words_used, ai_score });
        }
      } catch (error) {
        console.error("Error polling Humbot API:", error);
        clearInterval(interval);
        reject("Failed to retrieve humanized text");
      }
    }, 10000); // Poll every 10 seconds
  });

  const humanScore = await stealthDetect(output);
  console.log("==================================================");
  if (humanScore < 85) {
    const result = await humanize(output);
    return { humanScore, output: result?.output || "" };
  } else {
    console.log("Human Score is greater than 85");
    return { humanScore, output };
  }
}

async function humbotProcessController(req: Request, res: Response) {
  try {
    console.log("Humbot Process Controller URL", req.url);
    const { prompt: question } = req.body;

    const existingAnswer = await getAnswerByQuestion(question);

    if (existingAnswer) {
      res.json({
        success: true,
        // generatedText: generatedText || null,
        humanizedText: existingAnswer.answer,
      });
    }

    if (!process.env.GROQ_API_KEY || !process.env.HUMBBOT_API_KEY) {
      throw new Error(
        "API keys for Groq or Humbot are missing in the .env file"
      );
    }

    let generatedText = "",
      humanizedText = "";

    // Groq Part: Generate text if a prompt is provided
    if (question) {
      console.log("Calling Groq API with prompt...\n", question);
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: `${question}\n $ Generate answer based on above prompt as real american university student wrote and as humanized. And make it simple, cool, professional, human like answer as much as possible.`,
            },
          ],
          model: "llama-3.3-70b-versatile", // Verify if this model exists
        });

        console.log("Chat Completion", chatCompletion);
        generatedText =
          chatCompletion.choices[0]?.message?.content || "No content generated";
        // console.log("Generated Text from Groq:", generatedText);
      } catch (error: any) {
        console.error("Error creating chat completion:", error);
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
        }
      }
    }

    const result = await humanize(generatedText);
    humanizedText = result?.output || "";

    // Return the response
    res.json({
      success: true,
      // generatedText: generatedText || null,
      humanizedText: humanizedText || null,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while processing the request",
    });
  }
}

async function stealthDetect(answer: string) {
  const humbotCreateResponse = await axios.post(
    "https://www.stealthgpt.ai/api/trpc/input.aiCheckerScore?batch=1",
    {
      "0": {
        json: {
          feature: "ai_checker",
          input: answer,
        },
      },
    },
    {
      headers: {
        "api-key": process.env.STEALTH_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const humanScore =
    humbotCreateResponse.data[0]["result"]["data"]["json"]["data"]["score"];
  console.log("Human Score Detected", humanScore);
  console.log("**************************************");
  return humanScore;
}

async function humanScoreDetectController(req: Request, res: Response) {
  try {
    const { answers } = req.body;

    console.log("Answers =========", answers.length);

    if (!process.env.GROQ_API_KEY || !process.env.HUMBBOT_API_KEY) {
      throw new Error(
        "API keys for Groq or Humbot are missing in the .env file"
      );
    }

    // Humbot Part: Humanize text if either generated text or provided text exists
    if (answers) {
      if (typeof answers === "string") {
        console.log("Calling Humbot API with text...");
        // Create Humanization Task
        const humanScore = await stealthDetect(answers);
        // Return the response
        res.json({
          success: true,
          humanScore: humanScore || null,
        });
      } else {
        const results = [];
        for (const answer of answers) {
          console.log("Calling Stealth API with text...");
          const humanScore = await stealthDetect(answer);
          results.push(humanScore);
        }
        // Return the response
        res.json({
          success: true,
          humanScore: results,
        });
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while processing the request",
    });
  }
}

export default { humbotProcessController, humanScoreDetectController };
