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

const updateAccountValidator = [
    check("year", "학년을 입력해주세요")
        .not().isEmpty().isIn(["1", "2", "3", "4", "5"]).withMessage("유효한 학년을 입력해주세요"),
    check("studio", "스튜디오 교수님을 입력해주세요").not().isEmpty(),
    check("tel", "전화번호를 입력해주세요")
        .not().isEmpty()
        .matches(TEL_REGEX).withMessage("전화번호는 10 또는 11자리 숫자여야 합니다"),
];

const addWarningValidator = [
    check("message", "경고 사유를 입력해주세요")
        .not().isEmpty(),
    check("countOfWarning", "경고 부과 시, 경고 횟수는 0 이상 1 이하이어야 합니다")
        .isInt({min: 0, max: 1}),
];

const minusWarningValidator = [
    check("countOfWarning", "경고 차감 시, 경고 횟수는 1 이상 2 이하이어야 합니다")
        .isInt({min: 1, max: 2}),
];

const checkPassQuizValidator = [
    check("passQuiz", "교육 이수 여부 처리 시, 교육 이수 여부는 참 또는 거짓이여야 합니다")
        .isBoolean(),
];

export {
    signupValidator,
    loginValidator,
    updateAccountValidator,
    addWarningValidator,
    minusWarningValidator,
    checkPassQuizValidator
}