import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {feedbackValidator} from "../validators/qnaValidators";
import {
    deleteFeedback,
    getFeedback,
    getFeedbackList,
    newFeedback,
    updateFeedback
} from "../controllers/feedbackControllers";

const router = express.Router();

router.post("/new", checkAuth, feedbackValidator, newFeedback);

router.get("/", checkAuth, getFeedbackList);
router.get("/:feedbackId", checkAuth, getFeedback);

router.patch("/:feedbackId", checkAuth, feedbackValidator, updateFeedback);

router.delete("/:feedbackId", checkAuth, deleteFeedback);

export default router;