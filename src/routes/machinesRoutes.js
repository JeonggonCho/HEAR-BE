"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = __importDefault(require("../middlewares/checkAuth"));
const machinesControllers_1 = require("../controllers/machinesControllers");
const machinesValidators_1 = require("../validators/machinesValidators");
const router = express_1.default.Router();
// 예약 메인 페이지에서 기기 활성화 상태 조회
router.get("/status", checkAuth_1.default, machinesControllers_1.getStatus);
// 조교 및 관리자 기기 관리 페이지에서 기기 정보 조회
router.get("/lasers", checkAuth_1.default, machinesControllers_1.getLasers);
router.get("/printers", checkAuth_1.default, machinesControllers_1.getPrinters);
router.get("/heats", checkAuth_1.default, machinesControllers_1.getHeats);
router.get("/saws", checkAuth_1.default, machinesControllers_1.getSaws);
router.get("/vacuums", checkAuth_1.default, machinesControllers_1.getVacuums);
router.get("/cncs", checkAuth_1.default, machinesControllers_1.getCncs);
router.get("/lasers/times", checkAuth_1.default, machinesControllers_1.getLaserTimes);
// 조교 및 관리자 기기 생성
router.post("/lasers", checkAuth_1.default, machinesValidators_1.newLaserValidator, machinesControllers_1.newLaser);
router.post("/printers", checkAuth_1.default, machinesValidators_1.newPrinterValidator, machinesControllers_1.newPrinter);
router.post("/lasers/times", checkAuth_1.default, machinesValidators_1.newLaserTimeValidator, machinesControllers_1.newLaserTime);
// 조교 및 관리자 기기 정보 수정
router.patch("/lasers/times", checkAuth_1.default, machinesValidators_1.updateLaserTimeValidator, machinesControllers_1.updateLaserTimes);
router.patch("/lasers/:laserId", checkAuth_1.default, machinesValidators_1.updateLaserValidator, machinesControllers_1.updateLaser);
router.patch("/printers/:printerId", checkAuth_1.default, machinesValidators_1.updatePrinterValidator, machinesControllers_1.updatePrinter);
router.patch("/heats/:heatId", checkAuth_1.default, machinesValidators_1.updateHeatValidator, machinesControllers_1.updateHeat);
router.patch("/saws/:sawId", checkAuth_1.default, machinesValidators_1.statusValidator, machinesControllers_1.updateSaw);
router.patch("/vacuums/:vacuumId", checkAuth_1.default, machinesValidators_1.statusValidator, machinesControllers_1.updateVacuum);
router.patch("/cncs/:cncId", checkAuth_1.default, machinesValidators_1.statusValidator, machinesControllers_1.updateCnc);
// 조교 및 관리자 기기 삭제
router.delete("/lasers/:laserId", checkAuth_1.default, machinesControllers_1.deleteLaser);
router.delete("/printers/:printerId", checkAuth_1.default, machinesControllers_1.deletePrinter);
router.delete("/lasers/times/:laserTimeId", checkAuth_1.default, machinesControllers_1.deleteLaserTime);
exports.default = router;
