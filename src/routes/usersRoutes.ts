import express from "express";
import {
    addWarning,
    checkEmail,
    deleteUser,
    getManager,
    getUser,
    getUserInfo,
    getUsers,
    getWarnings,
    login,
    minusWarning,
    passQuiz,
    resetQuiz,
    sendVerificationCode,
    signup,
    updateUser,
    verifyEmailCode
} from "../controllers/usersControllers";
import {
    addWarningValidator,
    checkPassQuizValidator,
    loginValidator,
    minusWarningValidator,
    signupValidator,
    updateAccountValidator
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
router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

router.patch("/", checkAuth, updateAccountValidator, updateUser);
router.patch("/warning/add/:userId", checkAuth, addWarningValidator, addWarning);
router.patch("/warning/minus/:userId", checkAuth, minusWarningValidator, minusWarning);
router.patch("/quiz/pass/:userId", checkAuth, checkPassQuizValidator, passQuiz);
router.patch("/quiz/reset/:userId", checkAuth, checkPassQuizValidator, resetQuiz);

router.delete("/", checkAuth, deleteUser);

export default router;