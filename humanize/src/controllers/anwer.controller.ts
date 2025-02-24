import { Request, Response } from "express";
import {
  createAnswer,
  getAnswerByQuestion,
  updateAnswer,
  deleteAnswer,
} from "../models/answer.model";
// import console from "../utils/console";

async function createAnswerController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { question, answer, score } = req.body;
    const existingAnswer = await getAnswerByQuestion(question);
    if (score < 90) {
      res.status(400).json({ error: "Score is less than 90" });
      return;
    } else if (existingAnswer) {
      res.status(400).json({ error: "Answer already exists" });
      return;
    }
    const newAnswer = await createAnswer({ question, answer, score });
    res.status(201).json({ newAnswer });
  } catch (err) {
    res.status(500).json({ error: "Error creating answer" });
  }
}

// Get answer by questionId
async function getAnswerByQuestionController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const question = req.params.question;
    const answer = await getAnswerByQuestion(question);
    if (answer) {
      res.status(200).json({ answer });
    } else {
      res.status(404).json({ message: "Answer not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error fetching answer" });
  }
}

// Update answer by questionId
async function updateAnswerController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const question = req.params.question;
    const updatedAnswer = req.body.answer;
    const updatedScore = req.body.score;
    const result = await updateAnswer(question, updatedAnswer, updatedScore);
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(500).json({ error: "Error updating answer" });
  }
}

// Delete answer by questionId
async function deleteAnswerController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const question = req.params.question;
    const result = await deleteAnswer(question);
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(500).json({ error: "Error deleting answer" });
  }
}

export default {
  createAnswerController,
  deleteAnswerController,
  updateAnswerController,
  getAnswerByQuestionController,
};
