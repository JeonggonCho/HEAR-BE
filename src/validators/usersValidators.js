"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPassEducationValidator = exports.minusWarningValidator = exports.addWarningValidator = exports.findPasswordValidator = exports.updatePasswordValidator = exports.updateAccountValidator = exports.loginValidator = exports.signupValidator = void 0;
const express_validator_1 = require("express-validator");
const regex_1 = require("../constants/regex");
const checkUsername = (0, express_validator_1.check)("username", "이름을 입력해주세요")
    .not().isEmpty();
const checkEmail = (0, express_validator_1.check)("email", "이메일을 입력해주세요")
    .normalizeEmail()
    .isEmail().withMessage("유효한 이메일 주소를 입력해주세요")
    .matches(regex_1.EMAIL_REGEX).withMessage("이메일은 '@hanyang.ac.kr' 만 사용이 가능합니다");
const checkPassword = (0, express_validator_1.check)("password", "비밀번호를 입력해주세요")
    .isLength({ min: 8, max: 20 }).withMessage("비밀번호는 8자 이상 20자 이하로 입력해주세요")
    .matches(regex_1.PW_REGEX).withMessage("8~20자의 영문 대/소문자, 숫자, 특수문자 중 2가지 조합으로 입력해주세요");
const checkNewPassword = (0, express_validator_1.check)("newPassword", "비밀번호를 입력해주세요")
    .isLength({ min: 8, max: 20 }).withMessage("비밀번호는 8자 이상 20자 이하로 입력해주세요")
    .matches(regex_1.PW_REGEX).withMessage("8~20자의 영문 대/소문자, 숫자, 특수문자 중 2가지 조합으로 입력해주세요");
const checkYear = (0, express_validator_1.check)("year", "학년을 입력해주세요")
    .not().isEmpty().isIn(["1", "2", "3", "4", "5"]).withMessage("유효한 학년을 입력해주세요");
const checkTel = (0, express_validator_1.check)("tel", "전화번호를 입력해주세요")
    .not().isEmpty()
    .matches(regex_1.TEL_REGEX).withMessage("전화번호는 10 또는 11자리 숫자여야 합니다");
const checkStudio = (0, express_validator_1.check)("studio", "스튜디오 교수님을 입력해주세요").not().isEmpty();
const checkStudentId = (0, express_validator_1.check)("studentId", "학번을 입력해주세요")
    .not().isEmpty()
    .matches(regex_1.STUDENTID_REGEX).withMessage("학번은 10자리의 숫자여야 합니다");
const signupValidator = [
    checkUsername,
    checkEmail,
    checkPassword,
    checkYear,
    checkStudentId,
    checkStudio,
    checkTel,
];
exports.signupValidator = signupValidator;
const loginValidator = [
    checkEmail,
    checkPassword,
];
exports.loginValidator = loginValidator;
const updateAccountValidator = [
    checkUsername,
    checkStudentId,
    checkTel,
];
exports.updateAccountValidator = updateAccountValidator;
const updatePasswordValidator = [
    checkPassword,
    checkNewPassword,
];
exports.updatePasswordValidator = updatePasswordValidator;
const findPasswordValidator = [
    checkUsername,
    checkEmail,
];
exports.findPasswordValidator = findPasswordValidator;
const addWarningValidator = [
    (0, express_validator_1.check)("message", "경고 사유를 입력해주세요")
        .not().isEmpty(),
    (0, express_validator_1.check)("countOfWarning", "경고 부과 시, 경고 횟수는 0 이상 1 이하이어야 합니다")
        .isInt({ min: 0, max: 1 }),
];
exports.addWarningValidator = addWarningValidator;
const minusWarningValidator = [
    (0, express_validator_1.check)("countOfWarning", "경고 차감 시, 경고 횟수는 1 이상 2 이하이어야 합니다")
        .isInt({ min: 1, max: 2 }),
];
exports.minusWarningValidator = minusWarningValidator;
const checkPassEducationValidator = [
    (0, express_validator_1.check)("passEducation", "교육 이수 여부 처리 시, 교육 이수 여부는 참 또는 거짓이여야 합니다")
        .isBoolean(),
];
exports.checkPassEducationValidator = checkPassEducationValidator;
