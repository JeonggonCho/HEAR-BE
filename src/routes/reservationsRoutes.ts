import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {
    getAllCncReservation,
    getAllHeatReservation,
    getAllPrinterReservation,
    getAllSawReservation,
    getAllVacuumReservation,
    getValidLaserInfo,
    newCncReservation,
    newHeatReservation,
    newLaserReservation,
    newPrinterReservation,
    newSawReservation,
    newVacuumReservation
} from "../controllers/reservationControllers";
import {cncValidator, heatValidator, laserValidator, sawVacuumValidator} from "../validators/reservationsValidators";

const router = express.Router();

// 레이저 커팅기 기기 당 예약 가능 시간 조회
router.get("/lasers", checkAuth, getValidLaserInfo);

// 예약 현황 조회
router.get("/printers", checkAuth, getAllPrinterReservation);
router.get("/heats", checkAuth, getAllHeatReservation);
router.get("/saws", checkAuth, getAllSawReservation);
router.get("/vacuums", checkAuth, getAllVacuumReservation);
router.get("/cncs", checkAuth, getAllCncReservation);

// 예약하기
router.post("/lasers", checkAuth, laserValidator, newLaserReservation);
router.post("/printers", checkAuth, newPrinterReservation);
router.post("/heats", checkAuth, heatValidator, newHeatReservation);
router.post("/saws", checkAuth, sawVacuumValidator, newSawReservation);
router.post("/vacuums", checkAuth, sawVacuumValidator, newVacuumReservation);
router.post("/cncs", checkAuth, cncValidator, newCncReservation);

// 예약 취소하기

export default router;