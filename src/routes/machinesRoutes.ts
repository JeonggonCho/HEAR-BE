import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {
    getCncs,
    getHeats,
    getLasers,
    getPrinters,
    getSaws,
    getVacuums,
    newLaser,
    newPrinter,
    updateCnc,
    updateHeat,
    updateLaser,
    updatePrinter,
    updateSaw,
    updateVacuum,
} from "../controllers/machinesControllers";
import {
    newLaserValidator,
    newPrinterValidator,
    statusValidator,
    updateHeatValidator,
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

router.post("/lasers", checkAuth, newLaserValidator, newLaser);
router.post("/printers", checkAuth, newPrinterValidator, newPrinter);

router.patch("/lasers/:laserId", checkAuth, updateLaserValidator, updateLaser);
router.patch("/printer/:printerId", checkAuth, updatePrinterValidator, updatePrinter);
router.patch("/heats/:heatId", checkAuth, updateHeatValidator, updateHeat);
router.patch("/saws/:sawId", checkAuth, statusValidator, updateSaw);
router.patch("/vacuums/:vacuumId", checkAuth, statusValidator, updateVacuum);
router.patch("/cncs/:cncId", checkAuth, statusValidator, updateCnc);

export default router;