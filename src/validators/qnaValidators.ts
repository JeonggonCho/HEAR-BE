import {check} from "express-validator";

const checkTitle = check("title", "제목을 입력해주세요").not().isEmpty();
const checkContent = check("content", "내용을 입력해주세요").isLength({
    min: 10,
    max: 400
}).withMessage("내용은 10자 이상 400자 이하로 입력해주세요");

const newInquiryValidator = [
    checkTitle,
    check("category", "카테고리를 선택해주세요")
        .not().isEmpty().isIn(["machine", "reservation", "room", "etc"]).withMessage("유효한 카테고리를 입력해주세요"),
    checkContent,
];

const newFeedbackValidator = [
    checkTitle,
    check("category", "카테고리를 선택해주세요")
        .not().isEmpty().isIn(["good", "bad", "suggest", "etc"]).withMessage("유효한 카테고리를 입력해주세요"),
    checkContent,
];

const newNoticeValidator = [
    checkTitle,
    checkContent
];

export {newInquiryValidator, newFeedbackValidator, newNoticeValidator};