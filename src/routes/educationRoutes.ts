import express from "express";

import {
    checkTest,
    getQuestions,
    getQuestionsAndSettings,
    getSettings,
    getUserTestStatus,
    implementationEducation,
    saveQuestions,
    settingCutOffPoint,
    settingDate
} from "../controllers/educationControllers";

import checkAuth from "../middlewares/checkAuth";
import {eductionDateValidator} from "../validators/educationValidators";

const router = express.Router();

router.get("/", checkAuth, getQuestionsAndSettings);
router.get("/settings", checkAuth, getSettings);
router.get("/questions", checkAuth, getQuestions);
router.get("/status", checkAuth, getUserTestStatus);

router.post("/check", checkAuth, checkTest);

router.patch("/", checkAuth, saveQuestions);
router.patch("/implementation", checkAuth, implementationEducation);
router.patch("/cutOffPoint", checkAuth, settingCutOffPoint);
router.patch("/date", checkAuth, eductionDateValidator, settingDate);

export default router;