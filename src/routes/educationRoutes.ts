import express from "express";

import {
    checkEducation,
    getQuestions,
    getQuestionsAndSettings,
    getSettings,
    getUserEducationResult,
    getUserEducationStatus,
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
router.get("/status", checkAuth, getUserEducationStatus);
router.get("/result", checkAuth, getUserEducationResult);

router.post("/check", checkAuth, checkEducation);

router.patch("/", checkAuth, saveQuestions);
router.patch("/implementation", checkAuth, implementationEducation);
router.patch("/cut-off-point", checkAuth, settingCutOffPoint);
router.patch("/date", checkAuth, eductionDateValidator, settingDate);

export default router;