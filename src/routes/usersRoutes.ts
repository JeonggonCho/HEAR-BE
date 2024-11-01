import express from "express";
import {
    addWarning,
    checkEmail,
    checkRefreshToken,
    deleteUser,
    findPassword,
    getManager,
    getUser,
    getUserInfo,
    getUsers,
    getWarnings,
    handoverAssistant,
    login,
    minusWarning,
    passQuiz,
    resetAllQuiz,
    resetAllWarning,
    resetQuiz,
    sendVerificationCode,
    signup,
    updatePassword,
    updateUser,
    verifyEmailCode
} from "../controllers/usersControllers";
import {
    addWarningValidator,
    checkPassQuizValidator,
    findPasswordValidator,
    loginValidator,
    minusWarningValidator,
    signupValidator,
    updateAccountValidator,
    updatePasswordValidator
} from "../validators/usersValidators";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

router.get("/", checkAuth, getUser);
router.get("/all", checkAuth, getUsers);
router.get("/manager", checkAuth, getManager);
router.get("/warnings", checkAuth, getWarnings);
router.get("/check-email", checkEmail); // 이메일 중복 확인
router.get("/:userId", checkAuth, getUserInfo);

router.post("/send-verification-code", sendVerificationCode); // 이메일 인증 번호 보내기
router.post("/verify-email-code", verifyEmailCode) // 이메일 인증 번호 확인
router.post("/refresh-token", checkRefreshToken); // 리프레시 토큰 확인 후, 액세스 토큰 재발급
router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

router.patch("/", checkAuth, updateAccountValidator, updateUser);
router.patch("/password", checkAuth, updatePasswordValidator, updatePassword);
router.patch("/warning", checkAuth, resetAllWarning); // 모든 유저 경고 초기화
router.patch("/quiz", checkAuth, resetAllQuiz); // 모든 유저 교육 미이수 처리
router.patch("/find-password", findPasswordValidator, findPassword); // 비밀번호 찾기
router.patch("/handover-assistant/:targetUserId", checkAuth, handoverAssistant); // 조교 역할 인수인계 하기
router.patch("/warning/add/:userId", checkAuth, addWarningValidator, addWarning);
router.patch("/warning/minus/:userId", checkAuth, minusWarningValidator, minusWarning);
router.patch("/quiz/pass/:userId", checkAuth, checkPassQuizValidator, passQuiz);
router.patch("/quiz/reset/:userId", checkAuth, checkPassQuizValidator, resetQuiz);

router.delete("/:targetUserId", checkAuth, deleteUser);

export default router;