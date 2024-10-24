import express from "express";
import {
    deleteInquiry,
    getInquiries,
    getInquiry,
    getMyInquiries,
    likeInquiry,
    newInquiry,
    updateInquiry,
} from "../controllers/inquiriesControllers";
import checkAuth from "../middlewares/checkAuth";
import {inquiryValidator} from "../validators/qnaValidators";

const router = express.Router();

router.get("/", checkAuth, getInquiries); // 모든 문의 조회
router.get("/me", checkAuth, getMyInquiries); // 내 문의 조회
router.get("/:inquiryId", checkAuth, getInquiry); // 문의 디테일 조회

router.post("/new", checkAuth, inquiryValidator, newInquiry);
router.post("/like/:inquiryId", checkAuth, likeInquiry);

router.patch("/:inquiryId", checkAuth, inquiryValidator, updateInquiry);

router.delete("/:inquiryId", checkAuth, deleteInquiry);

export default router;