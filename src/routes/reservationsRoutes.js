"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = __importDefault(require("../middlewares/checkAuth"));
const reservationControllers_1 = require("../controllers/reservationControllers");
const reservationsValidators_1 = require("../validators/reservationsValidators");
const router = express_1.default.Router();
// 레이저 커팅기 기기 당 예약 가능 시간 조회
router.get("/lasers", checkAuth_1.default, reservationControllers_1.getValidLaserInfo);
// 예약 현황 조회
router.get("/all", checkAuth_1.default, reservationControllers_1.getAllReservations);
router.get("/printers", checkAuth_1.default, reservationControllers_1.getAllPrinterReservations);
router.get("/heats", checkAuth_1.default, reservationControllers_1.getAllHeatReservations);
router.get("/saws", checkAuth_1.default, reservationControllers_1.getAllSawReservations);
router.get("/vacuums", checkAuth_1.default, reservationControllers_1.getAllVacuumReservations);
router.get("/cncs", checkAuth_1.default, reservationControllers_1.getAllCncReservations);
// 나의 예약 내역 조회하기
router.get("/me", checkAuth_1.default, reservationControllers_1.getMyReservations);
// 나의 이용 내역 조회하기
router.get("/history", checkAuth_1.default, reservationControllers_1.getMyHistory);
// 예약하기
router.post("/lasers", checkAuth_1.default, reservationsValidators_1.laserValidator, reservationControllers_1.newLaserReservation);
router.post("/printers", checkAuth_1.default, reservationControllers_1.newPrinterReservation);
router.post("/heats", checkAuth_1.default, reservationsValidators_1.heatValidator, reservationControllers_1.newHeatReservation);
router.post("/saws", checkAuth_1.default, reservationsValidators_1.sawVacuumValidator, reservationControllers_1.newSawReservation);
router.post("/vacuums", checkAuth_1.default, reservationsValidators_1.sawVacuumValidator, reservationControllers_1.newVacuumReservation);
router.post("/cncs", checkAuth_1.default, reservationsValidators_1.cncValidator, reservationControllers_1.newCncReservation);
// 예약 취소하기
router.delete("/", checkAuth_1.default, reservationControllers_1.deleteReservations);
exports.default = router;
