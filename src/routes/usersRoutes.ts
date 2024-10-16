import express from "express";
import {
    addWarning,
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
    signup,
    updateUser
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

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

router.get("/", checkAuth, getUser);
router.get("/all", checkAuth, getUsers);
router.get("/manager", checkAuth, getManager);
router.get("/warnings", checkAuth, getWarnings);
router.get("/:userId", checkAuth, getUserInfo);

router.patch("/", checkAuth, updateAccountValidator, updateUser);
router.patch("/warning/add/:userId", checkAuth, addWarningValidator, addWarning);
router.patch("/warning/minus/:userId", checkAuth, minusWarningValidator, minusWarning);
router.patch("/quiz/pass/:userId", checkAuth, checkPassQuizValidator, passQuiz);
router.patch("/quiz/reset/:userId", checkAuth, checkPassQuizValidator, resetQuiz);

router.delete("/", checkAuth, deleteUser);

export default router;