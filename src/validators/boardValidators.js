"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noticeValidator = exports.feedbackValidator = exports.inquiryValidator = void 0;
const express_validator_1 = require("express-validator");
const checkTitle = (0, express_validator_1.check)("title", "제목을 입력해주세요").not().isEmpty();
const checkContent = (0, express_validator_1.check)("content", "내용을 입력해주세요").isLength({
    min: 10,
    max: 400
}).withMessage("내용은 10자 이상 400자 이하로 입력해주세요");
const inquiryValidator = [
    checkTitle,
    (0, express_validator_1.check)("category", "카테고리를 선택해주세요")
        .not().isEmpty().isIn(["machine", "reservation", "room", "etc"]).withMessage("유효한 카테고리를 입력해주세요"),
    checkContent,
];
exports.inquiryValidator = inquiryValidator;
const feedbackValidator = [
    checkTitle,
    (0, express_validator_1.check)("category", "카테고리를 선택해주세요")
        .not().isEmpty().isIn(["good", "bad", "suggest", "etc"]).withMessage("유효한 카테고리를 입력해주세요"),
    checkContent,
];
exports.feedbackValidator = feedbackValidator;
const noticeValidator = [
    checkTitle,
    checkContent
];
exports.noticeValidator = noticeValidator;
