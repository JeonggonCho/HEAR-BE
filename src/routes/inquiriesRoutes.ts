import express from "express";
import {deleteInquiry, getInquiries, getInquiry, newInquiry, updateInquiry} from "../controllers/inquiriesControllers";
import checkAuth from "../middlewares/checkAuth";
import {inquiryValidator} from "../validators/qnaValidators";

const router = express.Router();

router.post("/new", checkAuth, inquiryValidator, newInquiry);

router.get("/", checkAuth, getInquiries);
router.get("/:inquiryId", checkAuth, getInquiry);

router.patch("/:inquiryId", checkAuth, inquiryValidator, updateInquiry);

router.delete("/:inquiryId", checkAuth, deleteInquiry);

export default router;