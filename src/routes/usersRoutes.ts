import express from "express";
import {login, signup} from "../controllers/usersControllers";
import {loginValidator, signupValidator} from "../validators/usersValidators";

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

export default router;