import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {noticeValidator} from "../validators/boardValidators";
import {
    deleteNotice,
    getLatestNotices,
    getNotice,
    getNotices,
    newNotice,
    updateNotice
} from "../controllers/noticesControllers";

const router = express.Router();

router.post("/new", checkAuth, noticeValidator, newNotice);

router.get("/", checkAuth, getNotices);
router.get("/latest", checkAuth, getLatestNotices);
router.get("/:noticeId", checkAuth, getNotice);

router.patch("/:noticeId", checkAuth, noticeValidator, updateNotice);

router.delete("/:noticeId", checkAuth, deleteNotice);

export default router;