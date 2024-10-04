import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {
    newCncReservation,
    newHeatReservation,
    newLaserReservation,
    newPrinterReservation,
    newSawReservation,
    newVacuumReservation
} from "../controllers/reservationControllers";
import {cncValidator, heatValidator, laserValidator, sawVacuumValidator} from "../validators/reservationsValidators";

const router = express.Router();

router.post("/laser", checkAuth, laserValidator, newLaserReservation);
router.post("/printer", checkAuth, newPrinterReservation);
router.post("/heat", checkAuth, heatValidator, newHeatReservation);
router.post("/saw", checkAuth, sawVacuumValidator, newSawReservation);
router.post("/vacuum", checkAuth, sawVacuumValidator, newVacuumReservation);
router.post("/cnc", checkAuth, cncValidator, newCncReservation);

export default router;