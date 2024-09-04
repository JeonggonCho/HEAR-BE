import {check} from "express-validator";
import {EMAIL_REGEX, PW_REGEX, STUDENTID_REGEX, TEL_REGEX} from "../constants/authRegex";

const signupValidator = [
    check("username", "이름을 입력해주세요")
        .not().isEmpty(),
    check("email", "이메일을 입력해주세요")
        .normalizeEmail()
        .isEmail().withMessage("유효한 이메일 주소를 입력해주세요")
        .matches(EMAIL_REGEX).withMessage("이메일은 '@hanyang.ac.kr' 만 사용이 가능합니다"),
    check("password", "비밀번호를 입력해주세요")
        .isLength({min: 8, max: 20}).withMessage("비밀번호는 8자 이상 20자 이하로 입력해주세요")
        .matches(PW_REGEX).withMessage("8~20자의 영문 대/소문자, 숫자, 특수문자 중 2가지 조합으로 입력해주세요"),
    check("year", "학년을 입력해주세요")
        .not().isEmpty().isIn(["1", "2", "3", "4", "5"]).withMessage("유효한 학년을 입력해주세요"),
    check("studentId", "학번을 입력해주세요")
        .not().isEmpty()
        .matches(STUDENTID_REGEX).withMessage("학번은 10자리의 숫자여야 합니다"),
    check("studio", "스튜디오 교수님을 입력해주세요").not().isEmpty(),
    check("tel", "전화번호를 입력해주세요")
        .not().isEmpty()
        .matches(TEL_REGEX).withMessage("전화번호는 10 또는 11자리 숫자여야 합니다"),
];

const loginValidator = [
    check("email", "이메일을 입력해주세요")
        .normalizeEmail()
        .isEmail().withMessage("유효한 이메일 주소를 입력해주세요")
        .matches(EMAIL_REGEX).withMessage("이메일은 '@hanyang.ac.kr' 만 사용이 가능합니다"),
    check("password", "비밀번호를 입력해주세요")
        .isLength({min: 8, max: 20}).withMessage("비밀번호는 8자 이상 20자 이하로 입력해주세요")
        .matches(PW_REGEX).withMessage("8~20자의 영문 대/소문자, 숫자, 특수문자 중 2가지 조합으로 입력해주세요"),
];

export {signupValidator, loginValidator}