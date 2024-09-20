import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {
    deleteLaser,
    deleteLaserTime,
    deletePrinter,
    getCncs,
    getHeats,
    getLasers,
    getLaserTimes,
    getPrinters,
    getSaws,
    getVacuums,
    newLaser,
    newLaserTime,
    newPrinter,
    updateCnc,
    updateHeat,
    updateLaser,
    updateLaserTimes,
    updatePrinter,
    updateSaw,
    updateVacuum,
} from "../controllers/machinesControllers";
import {
    newLaserTimeValidator,
    newLaserValidator,
    newPrinterValidator,
    statusValidator,
    updateHeatValidator,
    updateLaserTimeValidator,
    updateLaserValidator,
    updatePrinterValidator
} from "../validators/machinesValidators";

const router = express.Router();

router.get("/lasers", checkAuth, getLasers);
router.get("/printers", checkAuth, getPrinters);
router.get("/heats", checkAuth, getHeats);
router.get("/saws", checkAuth, getSaws);
router.get("/vacuums", checkAuth, getVacuums);
router.get("/cncs", checkAuth, getCncs);
router.get("/lasers/times", checkAuth, getLaserTimes);

router.post("/lasers", checkAuth, newLaserValidator, newLaser);
router.post("/printers", checkAuth, newPrinterValidator, newPrinter);
router.post("/lasers/times", checkAuth, newLaserTimeValidator, newLaserTime);

router.patch("/lasers/times", checkAuth, updateLaserTimeValidator, updateLaserTimes);
router.patch("/lasers/:laserId", checkAuth, updateLaserValidator, updateLaser);
router.patch("/printers/:printerId", checkAuth, updatePrinterValidator, updatePrinter);
router.patch("/heats/:heatId", checkAuth, updateHeatValidator, updateHeat);
router.patch("/saws/:sawId", checkAuth, statusValidator, updateSaw);
router.patch("/vacuums/:vacuumId", checkAuth, statusValidator, updateVacuum);
router.patch("/cncs/:cncId", checkAuth, statusValidator, updateCnc);

router.delete("/lasers/:laserId", checkAuth, deleteLaser);
router.delete("/printers/:printerId", checkAuth, deletePrinter);
router.delete("/lasers/times/:laserTimeId", checkAuth, deleteLaserTime);

export default router;