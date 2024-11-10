import express from "express";

import {getQuestions, saveQuestions} from "../controllers/educationControllers";

import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

router.get("/", checkAuth, getQuestions);

router.patch("/", checkAuth, saveQuestions);

export default router;