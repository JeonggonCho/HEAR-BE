import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {newFeedbackValidator} from "../validators/qnaValidators";
import {deleteFeedback, getFeedback, getFeedbackList, newFeedback} from "../controllers/feedbackControllers";

const router = express.Router();

router.post("/new", checkAuth, newFeedbackValidator, newFeedback);

router.get("/", checkAuth, getFeedbackList);
router.get("/:feedbackId", checkAuth, getFeedback);

router.delete("/:feedbackId", checkAuth, deleteFeedback);

export default router;