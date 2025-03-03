"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersControllers_1 = require("../controllers/usersControllers");
const usersValidators_1 = require("../validators/usersValidators");
const checkAuth_1 = __importDefault(require("../middlewares/checkAuth"));
const router = express_1.default.Router();
router.get("/", checkAuth_1.default, usersControllers_1.getUser);
router.get("/all", checkAuth_1.default, usersControllers_1.getUsers);
router.get("/assistant", checkAuth_1.default, usersControllers_1.getAssistant);
router.get("/warnings", checkAuth_1.default, usersControllers_1.getWarnings);
router.get("/check-email", usersControllers_1.checkEmail); // 이메일 중복 확인
router.get("/:userId", checkAuth_1.default, usersControllers_1.getUserInfo);
router.post("/send-verification-code", usersControllers_1.sendVerificationCode); // 이메일 인증 번호 보내기
router.post("/verify-email-code", usersControllers_1.verifyEmailCode); // 이메일 인증 번호 확인
router.post("/refresh-token", usersControllers_1.checkRefreshToken); // 리프레시 토큰 확인 후, 액세스 토큰 재발급
router.post("/signup", usersValidators_1.signupValidator, usersControllers_1.signup);
router.post("/login", usersValidators_1.loginValidator, usersControllers_1.login);
router.patch("/", checkAuth_1.default, usersValidators_1.updateAccountValidator, usersControllers_1.updateUser); // updateUser는 유효성 검사 후 호출됨
router.patch("/password", checkAuth_1.default, usersValidators_1.updatePasswordValidator, usersControllers_1.updatePassword);
router.patch("/warning", checkAuth_1.default, usersControllers_1.resetAllWarning); // 모든 유저 경고 초기화
router.patch("/education", checkAuth_1.default, usersControllers_1.resetAllEducation); // 모든 유저 교육 미이수 처리
router.patch("/find-password", usersValidators_1.findPasswordValidator, usersControllers_1.findPassword); // 비밀번호 찾기
router.patch("/handover-assistant/:targetUserId", checkAuth_1.default, usersControllers_1.handoverAssistant); // 조교 역할 인수인계 하기
router.patch("/warning/add/:userId", checkAuth_1.default, usersValidators_1.addWarningValidator, usersControllers_1.addWarning);
router.patch("/warning/minus/:userId", checkAuth_1.default, usersValidators_1.minusWarningValidator, usersControllers_1.minusWarning);
router.patch("/education/pass/:userId", checkAuth_1.default, usersValidators_1.checkPassEducationValidator, usersControllers_1.passEducation);
router.patch("/education/reset/:userId", checkAuth_1.default, usersValidators_1.checkPassEducationValidator, usersControllers_1.resetEducation);
router.delete("/:targetUserId", checkAuth_1.default, usersControllers_1.deleteUser);
exports.default = router;
