import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {feedbackValidator} from "../validators/boardValidators";
import {
    deleteFeedback,
    getFeedback,
    getFeedbackList,
    likeFeedback,
    newFeedback,
    updateFeedback
} from "../controllers/feedbackControllers";

const router = express.Router();

router.get("/", checkAuth, getFeedbackList);
router.get("/:feedbackId", checkAuth, getFeedback);

router.post("/new", checkAuth, feedbackValidator, newFeedback);
router.post("/like/:feedbackId", checkAuth, likeFeedback);

router.patch("/:feedbackId", checkAuth, feedbackValidator, updateFeedback);

router.delete("/:feedbackId", checkAuth, deleteFeedback);

export default router;