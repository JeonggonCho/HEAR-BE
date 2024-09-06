import express from "express";
import {deleteUser, getUser, login, signup, updateUser} from "../controllers/usersControllers";
import {loginValidator, signupValidator, updateAccountValidator} from "../validators/usersValidators";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

router.get("/", checkAuth, getUser);

router.patch("/", checkAuth, updateAccountValidator, updateUser);

router.delete("/", checkAuth, deleteUser);

export default router;