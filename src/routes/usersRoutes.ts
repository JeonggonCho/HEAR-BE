import express from "express";
import {getUser, login, signup} from "../controllers/usersControllers";
import {loginValidator, signupValidator} from "../validators/usersValidators";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

router.get("/", checkAuth, getUser);

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

export default router;