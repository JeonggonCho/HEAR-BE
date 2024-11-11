import express from "express";

import {
    getQuestions,
    implementationEducation,
    saveQuestions,
    settingCutOffPoint,
    settingDate
} from "../controllers/educationControllers";

import checkAuth from "../middlewares/checkAuth";
import {eductionDateValidator} from "../validators/educationValidators";

const router = express.Router();

router.get("/", checkAuth, getQuestions);

router.patch("/", checkAuth, saveQuestions);
router.patch("/implementation", checkAuth, implementationEducation);
router.patch("/cutOffPoint", checkAuth, settingCutOffPoint);
router.patch("/date", checkAuth, eductionDateValidator, settingDate);

export default router;