import { Router } from "express";
import answerRoute from "./answer.route";
import processRoute from "./process.route";
const router = Router();

router.get("/health", (req, res) => {
  res.send({ state: true });
});
router.use("/answer", answerRoute);
router.use("/process", processRoute);

export default router;
