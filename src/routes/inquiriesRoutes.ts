import express from "express";
import {deleteInquiry, getInquiries, getInquiry, newInquiry} from "../controllers/inquiriesControllers";
import checkAuth from "../middlewares/checkAuth";
import {newInquiryValidator} from "../validators/qnaValidators";

const router = express.Router();

router.post("/new", checkAuth, newInquiryValidator, newInquiry);

router.get("/", checkAuth, getInquiries);
router.get("/:inquiryId", checkAuth, getInquiry);

router.delete("/:inquiryId", checkAuth, deleteInquiry);

export default router;