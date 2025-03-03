"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePrinter = exports.deleteLaserTime = exports.deleteLaser = exports.updateCnc = exports.updateVacuum = exports.updateSaw = exports.updateHeat = exports.updatePrinter = exports.updateLaserTimes = exports.updateLaser = exports.getCncs = exports.getVacuums = exports.getSaws = exports.getHeats = exports.getPrinters = exports.getLaserTimes = exports.getLasers = exports.getStatus = exports.newPrinter = exports.newLaserTime = exports.newLaser = void 0;
const express_validator_1 = require("express-validator");
const errorModel_1 = __importDefault(require("../models/errorModel"));
const machineModel_1 = require("../models/machineModel");
const mongoose_1 = __importDefault(require("mongoose"));
// 레이저 커팅기 생성
const newLaser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { name } = req.body;
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    const createdLaser = new machineModel_1.LaserModel({ name });
    try {
        createdLaser.save();
        return res.status(201).json({ data: { laser: createdLaser } });
    }
    catch (err) {
        return next(new errorModel_1.default("레이저 커팅기 생성 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.newLaser = newLaser;
// 레이저 커팅기 시간 추가
const newLaserTime = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { id, startTime, endTime } = req.body;
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    const createdLaserTime = new machineModel_1.LaserTimeModel({ id, startTime, endTime });
    try {
        createdLaserTime.save();
        return res.status(201).json({
            data: {
                laserTime: {
                    id: createdLaserTime.id,
                    startTime: createdLaserTime.startTime,
                    endTime: createdLaserTime.endTime
                }
            }
        });
    }
    catch (err) {
        return next(new errorModel_1.default("레이저 커팅기 시간 추가 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.newLaserTime = newLaserTime;
// 3d 프린터 생성
const newPrinter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { name } = req.body;
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    const createdPrinter = new machineModel_1.PrinterModel({ name });
    try {
        createdPrinter.save();
        return res.status(201).json({ data: { printer: createdPrinter } });
    }
    catch (err) {
        return next(new errorModel_1.default("3d 프린터 생성 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.newPrinter = newPrinter;
// 기기 활성화 상태 조회
const getStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin" && role !== "student") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let laserStatus = false;
    let printerStatus = false;
    let heatStatus = false;
    let sawStatus = false;
    let vacuumStatus = false;
    let cncStatus = false;
    try {
        const lasers = yield machineModel_1.LaserModel.find();
        laserStatus = lasers.some(el => el.status);
        const printers = yield machineModel_1.PrinterModel.find();
        printerStatus = printers.some(el => el.status);
        const heats = yield machineModel_1.HeatModel.find();
        heatStatus = heats.some(el => el.status);
        if (heats[0].count === 0) {
            heatStatus = false;
        }
        const saws = yield machineModel_1.SawModel.find();
        sawStatus = saws.some(el => el.status);
        const vacuums = yield machineModel_1.VacuumModel.find();
        vacuumStatus = vacuums.some(el => el.status);
        const cncs = yield machineModel_1.CncModel.find();
        cncStatus = cncs.some(el => el.status);
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({
        data: {
            laser: laserStatus,
            printer: printerStatus,
            heat: heatStatus,
            saw: sawStatus,
            vacuum: vacuumStatus,
            cnc: cncStatus
        }
    });
});
exports.getStatus = getStatus;
// 레이저 커팅기 정보 조회
const getLasers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let lasers;
    try {
        lasers = yield machineModel_1.LaserModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({ data: { lasers } });
});
exports.getLasers = getLasers;
// 레이저 커팅기 시간 목록 조회
const getLaserTimes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let laserTimes;
    try {
        laserTimes = yield machineModel_1.LaserTimeModel
            .find()
            .sort({ _id: 1 });
    }
    catch (err) {
        return next(new errorModel_1.default("레이저 커팅기 시간 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({
        data: {
            laserTimes: laserTimes.map(({ id, startTime, endTime }) => ({
                id,
                startTime,
                endTime,
            }))
        }
    });
});
exports.getLaserTimes = getLaserTimes;
// 3d 프린터 정보 조회
const getPrinters = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let printers;
    try {
        printers = yield machineModel_1.PrinterModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({ data: { printers } });
});
exports.getPrinters = getPrinters;
// 열선 정보 조회
const getHeats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let heats;
    try {
        heats = yield machineModel_1.HeatModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({ data: { heats } });
});
exports.getHeats = getHeats;
// 톱 정보 조회
const getSaws = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let saws;
    try {
        saws = yield machineModel_1.SawModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({ data: { saws } });
});
exports.getSaws = getSaws;
// 사출 성형기 정보 조회
const getVacuums = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let vacuums;
    try {
        vacuums = yield machineModel_1.VacuumModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({ data: { vacuums } });
});
exports.getVacuums = getVacuums;
// cnc 정보 조회
const getCncs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let cncs;
    try {
        cncs = yield machineModel_1.CncModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({ data: { cncs } });
});
exports.getCncs = getCncs;
// 레이저 커팅기 정보 수정
const updateLaser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { name, status, times } = req.body;
    const { laserId } = req.params;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let laser;
    try {
        laser = yield machineModel_1.LaserModel.findByIdAndUpdate(laserId, { name, status, times }, { new: true });
    }
    catch (err) {
        return next(new errorModel_1.default("레이저 커팅기 정보 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!laser) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 레이저 커팅기 정보를 수정 할 수 없습니다.", 403));
    }
    return res.status(200).json({ message: "레이저 커팅기 수정완료" });
});
exports.updateLaser = updateLaser;
// 레이저 커팅기 시간 목록 수정
const updateLaserTimes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const laserTimeList = req.body;
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        // 1. 기존 데이터 모두 삭제
        yield machineModel_1.LaserTimeModel.deleteMany({}, { session: sess });
        // 2. 새로운 데이터 삽입
        for (const laserTime of laserTimeList) {
            const newLaserTime = new machineModel_1.LaserTimeModel(laserTime);
            yield newLaserTime.save({ session: sess });
        }
        // 3. 트랜잭션 커밋 (모든 작업이 성공하면 확정)
        yield sess.commitTransaction();
    }
    catch (error) {
        // 4. 오류 발생 시 롤백
        yield sess.abortTransaction();
        return next(new errorModel_1.default("레이저 커팅기 시간 목록 수정 중 오류가 발생했습니다.", 500));
    }
    finally {
        yield sess.endSession();
    }
    return res.status(200).json({ message: "레이저 커팅기 시간 목록을 성공적으로 업데이트했습니다." });
});
exports.updateLaserTimes = updateLaserTimes;
// 3d 프린터 정보 수정
const updatePrinter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { name, status } = req.body;
    const { printerId } = req.params;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let printer;
    try {
        printer = yield machineModel_1.PrinterModel.findByIdAndUpdate(printerId, { name, status }, { new: true });
    }
    catch (err) {
        return next(new errorModel_1.default("3d 프린터 정보 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!printer) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 3d 프린터 정보를 수정 할 수 없습니다.", 403));
    }
    return res.status(200).json({ message: "3d 프린터 수정완료" });
});
exports.updatePrinter = updatePrinter;
// 열선 정보 수정
const updateHeat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { status, count } = req.body;
    const { heatId } = req.params;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let heat;
    try {
        heat = yield machineModel_1.HeatModel.findByIdAndUpdate(heatId, { status, count }, { new: true });
    }
    catch (err) {
        return next(new errorModel_1.default("열선 정보 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!heat) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 열선 정보를 수정 할 수 없습니다.", 403));
    }
    return res.status(200).json({ message: "열선 수정완료" });
});
exports.updateHeat = updateHeat;
// 톱 정보 수정
const updateSaw = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { status } = req.body;
    const { sawId } = req.params;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let saw;
    try {
        saw = yield machineModel_1.SawModel.findByIdAndUpdate(sawId, { status }, { new: true });
    }
    catch (err) {
        return next(new errorModel_1.default("톱 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!saw) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 톱 정보를 수정 할 수 없습니다.", 403));
    }
    return res.status(200).json({ message: "톱 수정완료" });
});
exports.updateSaw = updateSaw;
// 사출 성형기 정보 수정
const updateVacuum = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { status } = req.body;
    const { vacuumId } = req.params;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let vacuum;
    try {
        vacuum = yield machineModel_1.VacuumModel.findByIdAndUpdate(vacuumId, { status }, { new: true });
    }
    catch (err) {
        return next(new errorModel_1.default("사출 성형기 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!vacuum) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 사출 성형기 정보를 수정 할 수 없습니다.", 403));
    }
    return res.status(200).json({ message: "사출 성형기 수정완료" });
});
exports.updateVacuum = updateVacuum;
// cnc 정보 수정
const updateCnc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { cncId } = req.params;
    const { status } = req.body;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let cnc;
    try {
        cnc = yield machineModel_1.CncModel.findByIdAndUpdate(cncId, { status }, { new: true });
    }
    catch (err) {
        return next(new errorModel_1.default("cnc 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!cnc) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 cnc 정보를 수정 할 수 없습니다.", 403));
    }
    return res.status(200).json({ message: "cnc 수정완료" });
});
exports.updateCnc = updateCnc;
// 레이저 커팅기 기기 삭제
const deleteLaser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { laserId } = req.params;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    try {
        yield machineModel_1.LaserModel.findByIdAndDelete(laserId);
    }
    catch (err) {
        return next(new errorModel_1.default("레이저 커팅기 기기 삭제 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    return res.status(204).json({ message: "레이저 커팅기가 삭제되었습니다." });
});
exports.deleteLaser = deleteLaser;
// 레이저 커팅기 시간 삭제
const deleteLaserTime = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { laserTimeId } = req.params;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let laserTime;
    try {
        laserTime = yield machineModel_1.LaserTimeModel.findOne({ id: laserTimeId });
    }
    catch (err) {
        return next(new errorModel_1.default("레이저 커팅기 기기 삭제 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    if (!laserTime) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 시간을 삭제 할 수 없습니다.", 403));
    }
    else {
        yield laserTime.deleteOne();
        return res.status(204).json({ message: "레이저 커팅기가 삭제되었습니다." });
    }
});
exports.deleteLaserTime = deleteLaserTime;
// 3d 프린터 기기 삭제
const deletePrinter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { printerId } = req.params;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    try {
        yield machineModel_1.PrinterModel.findByIdAndDelete(printerId);
    }
    catch (err) {
        return next(new errorModel_1.default("3d 프린터 기기 삭제 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    return res.status(204).json({ data: { message: "3d 프린터가 삭제되었습니다." } });
});
exports.deletePrinter = deletePrinter;
