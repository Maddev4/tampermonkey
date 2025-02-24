import { Router } from "express";
import answerController from "../controllers/anwer.controller";

const router = Router();

// Create a new answer
router.post("/", answerController.createAnswerController);

// Get an answer by question
router.get("/:question", answerController.getAnswerByQuestionController);

// Update an answer by question
router.put("/:question", answerController.updateAnswerController);

// Delete an answer by question
router.delete("/:question", answerController.deleteAnswerController);

export default router;
