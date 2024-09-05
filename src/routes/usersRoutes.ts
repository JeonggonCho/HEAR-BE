import express from "express";
import {getUser, login, signup, updateUser} from "../controllers/usersControllers";
import {loginValidator, signupValidator, updateAccountValidator} from "../validators/usersValidators";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

router.get("/", checkAuth, getUser);

router.patch("/", checkAuth, updateAccountValidator, updateUser);

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

export default router;