import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {getCncs, getHeats, getLasers, getPrinters, getSaws, getVacuums} from "../controllers/machinesControllers";

const router = express.Router();

router.get("/lasers", checkAuth, getLasers);
router.get("/printers", checkAuth, getPrinters);
router.get("/heats", checkAuth, getHeats);
router.get("/saws", checkAuth, getSaws);
router.get("/vacuums", checkAuth, getVacuums);
router.get("/cncs", checkAuth, getCncs);

export default router;