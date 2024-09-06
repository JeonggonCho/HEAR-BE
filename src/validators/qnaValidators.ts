import {check} from "express-validator";

const newInquiryValidator = [
    check("title", "제목을 입력해주세요")
        .not().isEmpty(),
    check("category", "카테고리를 선택해주세요")
        .not().isEmpty().isIn(["machine", "reservation", "room", "etc"]).withMessage("유효한 카테고리를 입력해주세요"),
    check("content", "내용을 입력해주세요").isLength({min: 10, max: 400}).withMessage("내용은 10자 이상 400자 이하로 입력해주세요"),
];

export {newInquiryValidator};