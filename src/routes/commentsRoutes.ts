import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {deleteComment, likeComment, newComment, updateComment} from "../controllers/commentsControllers";

const router = express.Router();

router.post("/", checkAuth, newComment);
router.post("/like/:commentId", checkAuth, likeComment);

router.patch("/:commentId", checkAuth, updateComment);

router.delete("/:commentId", checkAuth, deleteComment);

export default router;