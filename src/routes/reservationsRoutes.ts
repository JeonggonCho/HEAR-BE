import express from "express";
import checkAuth from "../middlewares/checkAuth";
import {
    deleteReservations,
    getAllCncReservations,
    getAllHeatReservations,
    getAllPrinterReservations,
    getAllReservations,
    getAllSawReservations,
    getAllVacuumReservations,
    getMyReservations,
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
router.get("/all", checkAuth, getAllReservations);
router.get("/printers", checkAuth, getAllPrinterReservations);
router.get("/heats", checkAuth, getAllHeatReservations);
router.get("/saws", checkAuth, getAllSawReservations);
router.get("/vacuums", checkAuth, getAllVacuumReservations);
router.get("/cncs", checkAuth, getAllCncReservations);

// 나의 예약 내역 조회하기
router.get("/me", checkAuth, getMyReservations);

// 나의 과거 이용 내역 조회하기


// 예약하기
router.post("/lasers", checkAuth, laserValidator, newLaserReservation);
router.post("/printers", checkAuth, newPrinterReservation);
router.post("/heats", checkAuth, heatValidator, newHeatReservation);
router.post("/saws", checkAuth, sawVacuumValidator, newSawReservation);
router.post("/vacuums", checkAuth, sawVacuumValidator, newVacuumReservation);
router.post("/cncs", checkAuth, cncValidator, newCncReservation);

// 예약 취소하기
router.delete("/", checkAuth, deleteReservations);

export default router;