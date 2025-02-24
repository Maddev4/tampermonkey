import { Router } from "express";
import { processController } from "../controllers";

const router = Router();

router.post("/", processController.humbotProcessController);
router.post("/human-score", processController.humanScoreDetectController);
export default router;
