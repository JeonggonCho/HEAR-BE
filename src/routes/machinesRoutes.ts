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
    getStatus,
    getVacuums,
    getValidLaserTimes,
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

// 예약 메인 페이지에서 기기 활성화 상태 조회
router.get("/status", checkAuth, getStatus);

// 레이저 커팅기 기기 당 예약 가능 시간 조회
router.get("/lasers/valid", checkAuth, getValidLaserTimes);

// 조교 및 관리자 기기 관리 페이지에서 기기 정보 조회
router.get("/lasers", checkAuth, getLasers);
router.get("/printers", checkAuth, getPrinters);
router.get("/heats", checkAuth, getHeats);
router.get("/saws", checkAuth, getSaws);
router.get("/vacuums", checkAuth, getVacuums);
router.get("/cncs", checkAuth, getCncs);
router.get("/lasers/times", checkAuth, getLaserTimes);

// 조교 및 관리자 기기 생성
router.post("/lasers", checkAuth, newLaserValidator, newLaser);
router.post("/printers", checkAuth, newPrinterValidator, newPrinter);
router.post("/lasers/times", checkAuth, newLaserTimeValidator, newLaserTime);

// 조교 및 관리자 기기 정보 수정
router.patch("/lasers/times", checkAuth, updateLaserTimeValidator, updateLaserTimes);
router.patch("/lasers/:laserId", checkAuth, updateLaserValidator, updateLaser);
router.patch("/printers/:printerId", checkAuth, updatePrinterValidator, updatePrinter);
router.patch("/heats/:heatId", checkAuth, updateHeatValidator, updateHeat);
router.patch("/saws/:sawId", checkAuth, statusValidator, updateSaw);
router.patch("/vacuums/:vacuumId", checkAuth, statusValidator, updateVacuum);
router.patch("/cncs/:cncId", checkAuth, statusValidator, updateCnc);

// 조교 및 관리자 기기 삭제
router.delete("/lasers/:laserId", checkAuth, deleteLaser);
router.delete("/printers/:printerId", checkAuth, deletePrinter);
router.delete("/lasers/times/:laserTimeId", checkAuth, deleteLaserTime);

export default router;