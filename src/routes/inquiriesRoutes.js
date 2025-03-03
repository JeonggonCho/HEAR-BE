"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inquiriesControllers_1 = require("../controllers/inquiriesControllers");
const checkAuth_1 = __importDefault(require("../middlewares/checkAuth"));
const boardValidators_1 = require("../validators/boardValidators");
const router = express_1.default.Router();
router.get("/", checkAuth_1.default, inquiriesControllers_1.getInquiries); // 모든 문의 조회
router.get("/me", checkAuth_1.default, inquiriesControllers_1.getMyInquiries); // 내 문의 조회
router.get("/:inquiryId", checkAuth_1.default, inquiriesControllers_1.getInquiry); // 문의 디테일 조회
router.post("/new", checkAuth_1.default, boardValidators_1.inquiryValidator, inquiriesControllers_1.newInquiry);
router.post("/like/:inquiryId", checkAuth_1.default, inquiriesControllers_1.likeInquiry);
router.patch("/:inquiryId", checkAuth_1.default, boardValidators_1.inquiryValidator, inquiriesControllers_1.updateInquiry);
router.delete("/:inquiryId", checkAuth_1.default, inquiriesControllers_1.deleteInquiry);
exports.default = router;
