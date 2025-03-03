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
exports.deleteReservations = exports.newCncReservation = exports.newVacuumReservation = exports.newSawReservation = exports.newHeatReservation = exports.newPrinterReservation = exports.newLaserReservation = exports.getAllCncReservations = exports.getAllVacuumReservations = exports.getAllSawReservations = exports.getAllHeatReservations = exports.getAllPrinterReservations = exports.getValidLaserInfo = exports.getMyHistory = exports.getMyReservations = exports.getAllReservations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const express_validator_1 = require("express-validator");
const errorModel_1 = __importDefault(require("../models/errorModel"));
const reservationModel_1 = require("../models/reservationModel");
const userModel_1 = __importDefault(require("../models/userModel"));
const machineModel_1 = require("../models/machineModel");
const calculateDate_1 = require("../utils/calculateDate");
// 모든 예약 현황 요청
const getAllReservations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    // 레이저 커팅기 예약 현황
    const tomorrowDate = (0, calculateDate_1.getTomorrowDate)();
    let lasers;
    try {
        lasers = yield machineModel_1.LaserModel.find({ status: true });
    }
    catch (err) {
        return next(new errorModel_1.default("레이저 커팅기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    let laserReservations;
    try {
        laserReservations = yield reservationModel_1.LaserReservationModel.find({ date: new Date(tomorrowDate) });
    }
    catch (err) {
        return next(new errorModel_1.default("레이저 커팅기 예약 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    let laserTimes;
    try {
        laserTimes = yield machineModel_1.LaserTimeModel
            .find()
            .sort({ _id: 1 });
    }
    catch (err) {
        return next(new errorModel_1.default("레이저 커팅기 시간 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    let laserStatus = [];
    lasers.forEach((laser) => {
        if (!laser.status) {
            return;
        }
        const name = laser.name;
        const times = laserTimes.map((time) => {
            const timeContent = `${time.startTime} - ${time.endTime}`;
            const isReserved = laserReservations.some((reservation) => String(reservation.machineId) === String(laser._id) &&
                reservation.startTime === time.startTime &&
                reservation.endTime === time.endTime);
            return { timeContent, status: !isReserved };
        });
        laserStatus.push({ name, times });
    });
    // 3d 프린터 예약 현황
    let printerStatus = [];
    // 열선 예약 현황
    let heatStatus = [];
    // 톱 예약 현황
    let sawStatus = [];
    // 사출 성형기 예약 현황
    let vacuumStatus = [];
    // cnc 예약 현황
    let cncStatus = [];
    return res.status(200).json({ data: { laserStatus, printerStatus, heatStatus, sawStatus, vacuumStatus, cncStatus } });
});
exports.getAllReservations = getAllReservations;
// 내 예약 내역 조회
const getMyReservations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { filter } = req.query;
    let filteredReservations = [];
    // 레이저 커팅기 예약 내역
    let laserReservations;
    if (filter === "all" || filter === "laser") {
        try {
            laserReservations = yield reservationModel_1.LaserReservationModel
                .find({
                userId: userId,
                date: { $gte: new Date().toLocaleDateString() }
            })
                .populate("machineId");
            laserReservations.forEach(l => {
                l.machineId.status && filteredReservations.push({
                    machine: l.machine,
                    _id: (l._id).toString(),
                    date: l.date,
                    machineName: l.machineId.name,
                    startTime: l.startTime,
                    endTime: l.endTime,
                });
            });
        }
        catch (err) {
            return next(new errorModel_1.default("내 레이저 커팅기 예약 내역 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }
    }
    // 3d 프린터 예약 내역
    let printerReservations;
    if (filter === "all" || filter === "printer") {
        try {
        }
        catch (err) {
            return next(new errorModel_1.default("내 3d 프린터 예약 내역 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }
    }
    // 열선 예약 내역
    let heatReservations;
    if (filter === "all" || filter === "heat") {
        try {
            heatReservations = yield reservationModel_1.HeatReservationModel
                .find({
                userId: userId,
                date: { $gte: new Date().toLocaleDateString() }
            })
                .populate("machineId");
            heatReservations.forEach(h => {
                h.machineId.status && filteredReservations.push({
                    machine: h.machine,
                    _id: (h._id).toString(),
                    date: h.date,
                });
            });
        }
        catch (err) {
            return next(new errorModel_1.default("내 열선 예약 내역 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }
    }
    // 톱 예약 내역
    let sawReservations;
    if (filter === "all" || filter === "saw") {
        try {
            sawReservations = yield reservationModel_1.SawReservationModel
                .find({
                userId: userId,
                date: { $gte: new Date().toLocaleDateString() }
            })
                .populate("machineId");
            sawReservations.forEach(s => {
                s.machineId.status && filteredReservations.push({
                    machine: s.machine,
                    _id: (s._id).toString(),
                    date: s.date,
                    startTime: s.startTime,
                    endTime: s.endTime,
                });
            });
        }
        catch (err) {
            return next(new errorModel_1.default("내 톱 예약 내역 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }
    }
    // 사출 성형기 예약 내역
    let vacuumReservations;
    if (filter === "all" || filter === "vacuum") {
        try {
            vacuumReservations = yield reservationModel_1.VacuumReservationModel
                .find({
                userId: userId,
                date: { $gte: new Date().toLocaleDateString() }
            })
                .populate("machineId");
            vacuumReservations.forEach(v => {
                v.machineId.status && filteredReservations.push({
                    machine: v.machine,
                    _id: (v._id).toString(),
                    date: v.date,
                    startTime: v.startTime,
                    endTime: v.endTime,
                });
            });
        }
        catch (err) {
            return next(new errorModel_1.default("내 사출 성형기 예약 내역 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }
    }
    // cnc 예약 내역
    let cncReservations;
    if (filter === "all" || filter === "cnc") {
        try {
            cncReservations = yield reservationModel_1.CncReservationModel
                .find({
                userId: userId,
                date: { $gte: new Date().toLocaleDateString() }
            })
                .populate("machineId");
            cncReservations.forEach(c => {
                c.machineId.status && filteredReservations.push({
                    machine: c.machine,
                    _id: (c._id).toString(),
                    date: c.date,
                });
            });
        }
        catch (err) {
            return next(new errorModel_1.default("내 cnc 예약 내역 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }
    }
    // 날짜 순으로 정렬하기
    filteredReservations.sort((a, b) => a.date.getTime() - b.date.getTime());
    return res.status(200).json({ data: filteredReservations });
});
exports.getMyReservations = getMyReservations;
// 내 이용 내역 조회
const getMyHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { filter } = req.query;
    let filteredReservations = [];
    let laserReservations;
    if (filter === "all" || filter === "laser") {
        try {
            laserReservations = yield reservationModel_1.LaserReservationModel
                .find({
                userId: userId,
                date: { $lt: new Date().toLocaleDateString() }
            })
                .populate("machineId");
            laserReservations.forEach(l => {
                filteredReservations.push({
                    machine: l.machine,
                    _id: (l._id).toString(),
                    date: l.date,
                    machineName: l.machineId.name,
                    startTime: l.startTime,
                    endTime: l.endTime,
                });
            });
        }
        catch (err) {
            return next(new errorModel_1.default("내 레이저 커팅기 예약 내역 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }
    }
    let printerReservations;
    if (filter === "all" || filter === "printer") {
    }
    let heatReservations;
    if (filter === "all" || filter === "heat") {
    }
    let sawReservations;
    if (filter === "all" || filter === "saw") {
    }
    let vacuumReservations;
    if (filter === "all" || filter === "vacuum") {
    }
    let cncReservations;
    if (filter === "all" || filter === "cnc") {
    }
    filteredReservations.sort((a, b) => b.date.getTime() - a.date.getTime());
    return res.status(200).json({ data: filteredReservations });
});
exports.getMyHistory = getMyHistory;
// 레이저 커팅기 기기 당 예약 가능 시간 조회
const getValidLaserInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    let lasers;
    try {
        lasers = yield machineModel_1.LaserModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    let laserTimes;
    try {
        laserTimes = yield machineModel_1.LaserTimeModel.find().sort({ _id: 1 });
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!lasers || !laserTimes) {
        return res.status(404).json({ data: [] });
    }
    let laserReservations;
    try {
        const tomorrowDate = (0, calculateDate_1.getTomorrowDate)();
        laserReservations = yield reservationModel_1.LaserReservationModel.find({ date: new Date(tomorrowDate) });
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    let laserInfo = lasers.map((laser) => ({
        laserId: laser._id,
        laserName: laser.name,
        laserStatus: laser.status,
    }));
    let laserTimesInfo = lasers.map((laser) => laserTimes.map((laserTime) => {
        // 내일 사용 시간에 해당 레이저 기기의 해당 시간대에 예약이 있는지 확인
        const isReserved = laserReservations.some((laserReservation) => {
            // 예약 내역의 시간 데이터 포맷 변환
            const formattedDate = `${laserReservation.date.getFullYear()}-${(laserReservation.date.getMonth() + 1).toString().padStart(2, '0')}-${laserReservation.date.getDate().toString().padStart(2, '0')}`;
            return laserReservation.machineId.equals(laser._id) && laserReservation.startTime === laserTime.startTime && laserReservation.endTime === laserTime.endTime && (formattedDate === (0, calculateDate_1.getTomorrowDate)());
        });
        return {
            laserId: laser._id,
            startTime: laserTime.startTime,
            endTime: laserTime.endTime,
            timeStatus: !isReserved, // 예약이 있으면 false, 없으면 true
        };
    })).flat();
    return res.status(200).json({ data: { laserInfo, laserTimesInfo } });
});
exports.getValidLaserInfo = getValidLaserInfo;
// 3D 프린터 예약 현황 조회
const getAllPrinterReservations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    let printerReservations;
    try {
        printerReservations = yield reservationModel_1.PrinterReservationModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({ data: "시간" });
});
exports.getAllPrinterReservations = getAllPrinterReservations;
// 열선 예약 현황 조회
const getAllHeatReservations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    return res.status(200).json({ data: "시간" });
});
exports.getAllHeatReservations = getAllHeatReservations;
// 톱 예약 현황 조회
const getAllSawReservations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    let sawReservations;
    try {
        const today = new Date();
        sawReservations = yield reservationModel_1.SawReservationModel
            .find({ date: { $gt: today } })
            .populate("userId");
    }
    catch (err) {
        return next(new errorModel_1.default("톱 예약 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (sawReservations.length === 0) {
        return res.status(200).json({ data: [] });
    }
    let sawReservationCondition = [];
    sawReservations.forEach((s) => {
        const populatedUser = s.userId;
        sawReservationCondition.push({
            date: s.date,
            username: populatedUser.username,
            id: populatedUser._id,
            year: populatedUser.year,
            time: `${s.startTime} - ${s.endTime}`,
        });
    });
    return res.status(200).json({ data: sawReservationCondition });
});
exports.getAllSawReservations = getAllSawReservations;
// 사출 성형기 예약 현황 조회
const getAllVacuumReservations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    let vacuumReservations;
    try {
        const today = new Date();
        vacuumReservations = yield reservationModel_1.VacuumReservationModel
            .find({ date: { $gt: today } })
            .populate("userId");
    }
    catch (err) {
        return next(new errorModel_1.default("사출 성형기 예약 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (vacuumReservations.length === 0) {
        return res.status(200).json({ data: [] });
    }
    let vacuumReservationCondition = [];
    vacuumReservations.forEach((v) => {
        const populatedUser = v.userId;
        vacuumReservationCondition.push({
            date: v.date,
            username: populatedUser.username,
            id: populatedUser._id,
            year: populatedUser.year,
            time: `${v.startTime} - ${v.endTime}`,
        });
    });
    return res.status(200).json({ data: vacuumReservationCondition });
});
exports.getAllVacuumReservations = getAllVacuumReservations;
// cnc 예약 현황 조회
const getAllCncReservations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    let cncReservations;
    try {
        const today = new Date();
        cncReservations = yield reservationModel_1.CncReservationModel
            .find({ date: { $gt: today } })
            .populate("userId");
    }
    catch (err) {
        return next(new errorModel_1.default("CNC 예약 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (cncReservations.length === 0) {
        return res.status(200).json({ data: [] });
    }
    let cncReservationCondition = [];
    cncReservations.forEach((c) => {
        const populatedUser = c.userId;
        cncReservationCondition.push({
            date: c.date,
            username: populatedUser.username,
            id: populatedUser._id,
            year: populatedUser.year,
        });
    });
    return res.status(200).json({ data: cncReservationCondition });
});
exports.getAllCncReservations = getAllCncReservations;
// 레이저 커팅기 예약하기
const newLaserReservation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const laserReservationInfo = req.body;
    const { userId } = req.userData;
    // 예약 요청 유저 찾기
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    // 교육 이수 확인
    if (!user.passEducation) {
        return next(new errorModel_1.default("교육 미이수로 인하여 예약이 불가능합니다.", 403));
    }
    // 경고가 2회 미만인지 확인
    if (user.countOfWarning >= 2) {
        return next(new errorModel_1.default("누적된 경고로 인하여 예약이 불가능합니다.", 403));
    }
    // 학생의 예약 가능 횟수가 남아있는지 확인
    if (Math.min(user.countOfLaserPerDay, user.countOfLaserPerWeek) < laserReservationInfo.length) {
        return next(new errorModel_1.default("예약 가능 횟수를 초과하여 예약이 불가능합니다.", 403));
    }
    const validDate = (0, calculateDate_1.getTomorrowDate)();
    for (const reservationInfo of laserReservationInfo) {
        // 올바른 기기 id를 전달하였는지, 기기의 현재 상태가 true인지 확인
        let laserMachine;
        try {
            laserMachine = yield machineModel_1.LaserModel.findById(reservationInfo.machineId);
        }
        catch (err) {
            return next(new errorModel_1.default("레이저 커팅기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }
        if (!laserMachine || !laserMachine.status) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 레이저 커팅기를 예약 할 수 없습니다.", 403));
        }
        // 내일 날짜 및 유효한 날짜인지 확인
        if (reservationInfo.date !== validDate) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 레이저 커팅기를 예약 할 수 없습니다.", 403));
        }
        // 날짜가 주말인지 확인
        if ([0, 6].includes((new Date(reservationInfo.date)).getDay())) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 레이저 커팅기를 예약할 수 없습니다.", 403));
        }
        // 시작시간이 종료시간 전인지 확인
        const [startHour, startMinute] = reservationInfo.startTime.split(":").map(Number);
        const [endHour, endMinute] = reservationInfo.endTime.split(":").map(Number);
        if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 레이저 커팅기를 예약할 수 없습니다.", 403));
        }
        // 공휴일인지 확인
        if ((0, calculateDate_1.isHoliday)(new Date(reservationInfo.date))) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 레이저 커팅기를 예약할 수 없습니다.", 403));
        }
        // 올바른 시간 id를 전달하였는지, 아직 예약되지 않은 유효한 시간인지 확인
        let laserTime;
        let laserReservationInfo;
        try {
            laserTime = yield machineModel_1.LaserTimeModel
                .find({
                startTime: reservationInfo.startTime,
                endTime: reservationInfo.endTime
            });
            laserReservationInfo = yield reservationModel_1.LaserReservationModel
                .find({
                machineId: reservationInfo.machineId,
                startTime: reservationInfo.startTime,
                endTime: reservationInfo.endTime,
                date: new Date(reservationInfo.date),
            });
        }
        catch (err) {
            return next(new errorModel_1.default("레이저 커팅기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }
        if (!laserTime || laserReservationInfo.length > 0) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 레이저 커팅기를 예약 할 수 없습니다.", 403));
        }
    }
    const createdLaserReservations = laserReservationInfo.map((value) => {
        return (new reservationModel_1.LaserReservationModel({
            machine: "laser",
            date: value.date,
            userId,
            machineId: value.machineId,
            startTime: value.startTime,
            endTime: value.endTime,
        }));
    });
    // 트랜잭션을 통해 예약과 동시에 유저의 예약 가능 횟수 차감시키기
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        for (const reservation of createdLaserReservations) {
            yield reservation.save({ session: sess });
            user.countOfLaserPerWeek -= 1;
            user.countOfLaserPerDay -= 1;
        }
        yield user.save({ session: sess });
        yield sess.commitTransaction();
    }
    catch (err) {
        yield sess.abortTransaction();
        return next(new errorModel_1.default("레이저 커팅기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
    return res.status(201).json({ data: { message: "레이저 커팅기 예약 성공" } });
});
exports.newLaserReservation = newLaserReservation;
// 3d 프린터 예약하기
const newPrinterReservation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const printerReservationInfo = req.body;
    const { userId } = req.userData;
    // 예약 요청 유저 찾기
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    // 교육 이수 확인
    if (!user.passEducation) {
        return next(new errorModel_1.default("교육 미이수로 인하여 예약이 불가능합니다.", 403));
    }
    // 경고가 2회 미만인지 확인
    if (user.countOfWarning >= 2) {
        return next(new errorModel_1.default("누적된 경고로 인하여 예약이 불가능합니다.", 403));
    }
    // TODO 날짜가 다음달 이내인지 확인하기
});
exports.newPrinterReservation = newPrinterReservation;
// 열선 예약하기
const newHeatReservation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { date } = req.body;
    const { userId } = req.userData;
    // 예약 요청 유저 찾기
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    // 교육 이수 확인
    if (!user.passEducation) {
        return next(new errorModel_1.default("교육 미이수로 인하여 예약이 불가능합니다.", 403));
    }
    // 경고가 2회 미만인지 확인
    if (user.countOfWarning >= 2) {
        return next(new errorModel_1.default("누적된 경고로 인하여 예약이 불가능합니다.", 403));
    }
    // TODO 현재 가용 가능한 열선이 있는지 개수 확인
    const reservationDate = new Date(date);
    // 날짜가 주말인지 확인
    if ([0, 6].includes(reservationDate.getDay())) {
        return next(new errorModel_1.default("주말로 인해 열선을 예약할 수 없습니다.", 403));
    }
    // 공휴일인지 확인
    if ((0, calculateDate_1.isHoliday)(reservationDate)) {
        return next(new errorModel_1.default("공휴일로 인해 열선을 예약할 수 없습니다.", 403));
    }
    // TODO 예약 저장 및 소속 스튜디오 학생들도 예약 중으로 만들기
    console.log(req.body);
});
exports.newHeatReservation = newHeatReservation;
// 톱 예약하기
const newSawReservation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { date, startTime, endTime } = req.body;
    const { userId } = req.userData;
    // 톱 조회하기
    let sawMachine;
    try {
        sawMachine = yield machineModel_1.SawModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("톱 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 톱이 있는지, 혹은 현재 활성화 상태인지 확인
    if (sawMachine.length === 0 || !sawMachine[0].status) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 톱을 예약 할 수 없습니다.", 403));
    }
    // 예약 요청 유저 찾기
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    // 교육 이수 확인
    if (!user.passEducation) {
        return next(new errorModel_1.default("교육 미이수로 인하여 예약이 불가능합니다.", 403));
    }
    // 경고가 2회 미만인지 확인
    if (user.countOfWarning >= 2) {
        return next(new errorModel_1.default("누적된 경고로 인하여 예약이 불가능합니다.", 403));
    }
    const reservationDate = new Date(date);
    // 날짜가 주말인지 확인
    if ([0, 6].includes(reservationDate.getDay())) {
        return next(new errorModel_1.default("주말로 인해 톱을 예약할 수 없습니다.", 403));
    }
    // 공휴일인지 확인
    if ((0, calculateDate_1.isHoliday)(reservationDate)) {
        return next(new errorModel_1.default("공휴일로 인해 톱을 예약할 수 없습니다.", 403));
    }
    // TODO 날짜가 다음달 이내인지 확인하기
    // 톱 예약 모델 객체 생성
    const createdSawReservation = new reservationModel_1.SawReservationModel({
        machine: "saw",
        userId: userId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        machineId: sawMachine[0]._id,
    });
    // 톱 예약 저장하기
    try {
        yield createdSawReservation.save();
    }
    catch (err) {
        return next(new errorModel_1.default("톱 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(201).json({ data: { message: "톱 예약 성공" } });
});
exports.newSawReservation = newSawReservation;
// 사출 성형기 예약하기
const newVacuumReservation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { date, startTime, endTime } = req.body;
    const { userId } = req.userData;
    // 사출 성형기 조회하기
    let vacuumMachine;
    try {
        vacuumMachine = yield machineModel_1.VacuumModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("사출 성형기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 사출 성형기가 있는지, 혹은 현재 활성화 상태인지 확인
    if (vacuumMachine.length === 0 || !vacuumMachine[0].status) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 사출 성형기를 예약 할 수 없습니다.", 403));
    }
    // 예약 요청 유저 찾기
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    // 교육 이수 확인
    if (!user.passEducation) {
        return next(new errorModel_1.default("교육 미이수로 인하여 예약이 불가능합니다.", 403));
    }
    // 경고가 2회 미만인지 확인
    if (user.countOfWarning >= 2) {
        return next(new errorModel_1.default("누적된 경고로 인하여 예약이 불가능합니다.", 403));
    }
    const reservationDate = new Date(date);
    // 날짜가 주말인지 확인
    if ([0, 6].includes(reservationDate.getDay())) {
        return next(new errorModel_1.default("주말로 인해 사출 성형기를 예약할 수 없습니다.", 403));
    }
    // 공휴일인지 확인
    if ((0, calculateDate_1.isHoliday)(reservationDate)) {
        return next(new errorModel_1.default("공휴일로 인해 사출 성형기를 예약할 수 없습니다.", 403));
    }
    // TODO 날짜가 다음달 이내인지 확인하기
    // 사출 성형기 예약 모델 객체 생성
    const createdVacuumReservation = new reservationModel_1.VacuumReservationModel({
        machine: "vacuum",
        userId: userId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        machineId: vacuumMachine[0]._id,
    });
    // 사출 성형기 예약 저장하기
    try {
        yield createdVacuumReservation.save();
    }
    catch (err) {
        return next(new errorModel_1.default("사출 성형기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(201).json({ data: { message: "사출 성형기 예약 성공" } });
});
exports.newVacuumReservation = newVacuumReservation;
// cnc 예약하기
const newCncReservation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { date } = req.body;
    const { userId } = req.userData;
    // CNC 조회하기
    let cncMachine;
    try {
        cncMachine = yield machineModel_1.CncModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("CNC 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // CNC가 있는지, 혹은 현재 활성화 상태인지 확인
    if (cncMachine.length === 0 || !cncMachine[0].status) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 CNC를 예약 할 수 없습니다.", 403));
    }
    // 예약 요청 유저 찾기
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    // 교육 이수 확인
    if (!user.passEducation) {
        return next(new errorModel_1.default("교육 미이수로 인하여 예약이 불가능합니다.", 403));
    }
    // 경고가 2회 미만인지 확인
    if (user.countOfWarning >= 2) {
        return next(new errorModel_1.default("누적된 경고로 인하여 예약이 불가능합니다.", 403));
    }
    // 유저가 4학년 이상인지 확인
    if (!user.year || !["4", "5"].includes(user.year)) {
        return next(new errorModel_1.default("4학년 이상이 아니기 때문에 예약이 불가능합니다.", 403));
    }
    // 날짜 유효성 검사하기
    const today = new Date();
    const reservationDate = new Date(date);
    // 요청 날짜가 오늘로부터 2일 이후인지 확인
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    // 요청 날짜가 과거인지 확인
    if (reservationDate <= today) {
        return next(new errorModel_1.default("과거 날짜는 예약할 수 없습니다.", 403));
    }
    if (reservationDate < twoDaysFromNow) {
        return next(new errorModel_1.default("CNC 예약은 최소 2일 후부터 가능합니다.", 403));
    }
    // 날짜가 주말인지 확인
    if ([0, 6].includes(reservationDate.getDay())) {
        return next(new errorModel_1.default("주말로 인해 CNC를 예약할 수 없습니다.", 403));
    }
    // 공휴일인지 확인
    if ((0, calculateDate_1.isHoliday)(reservationDate)) {
        return next(new errorModel_1.default("공휴일로 인해 CNC를 예약할 수 없습니다.", 403));
    }
    // TODO 날짜가 다음달 이내인지 확인하기
    let cncReservationInfo;
    try {
        cncReservationInfo = yield reservationModel_1.CncReservationModel.find({ date: new Date(reservationDate) });
    }
    catch (err) {
        return next(new errorModel_1.default("CNC 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 같은 날짜에 이미 예약이 되어있는지 확인
    if (cncReservationInfo.length > 0) {
        return next(new errorModel_1.default("이미 예약된 날짜이므로 CNC 예약을 할 수 없습니다.", 403));
    }
    // CNC 예약 모델 객체 생성
    const createdCncReservation = new reservationModel_1.CncReservationModel({
        machine: "cnc",
        date: date,
        userId: userId,
        machineId: cncMachine[0]._id,
    });
    // CNC 예약 저장하기
    try {
        yield createdCncReservation.save();
    }
    catch (err) {
        return next(new errorModel_1.default("CNC 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(201).json({ data: { message: "CNC 예약 성공" } });
});
exports.newCncReservation = newCncReservation;
// 예약 삭제하기
const deleteReservations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        if (!req.userData) {
            return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
        }
        const { userId } = req.userData;
        const ids = req.query.ids;
        const machines = req.query.machines;
        const date = req.query.date;
        if (!ids || !machines || !date || !Array.isArray(ids) || !Array.isArray(machines) || !Array.isArray(date)) {
            return next(new errorModel_1.default("잘못된 요청입니다.", 400));
        }
        let deletedReservations = [];
        for (let i = 0; i < ids.length; i++) {
            const _id = ids[i];
            const machine = machines[i];
            const d = date[i];
            switch (machine) {
                case "laser":
                    const laserReservation = yield reservationModel_1.LaserReservationModel
                        .findById(_id)
                        .session(session);
                    if (!laserReservation) {
                        return next(new errorModel_1.default("레이저 커팅기 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    if (laserReservation.userId.toString() !== userId.toString() || laserReservation.date.toISOString() !== new Date(d).toISOString()) {
                        return next(new errorModel_1.default("레이저 커팅기 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    const user = yield userModel_1.default
                        .findById(userId)
                        .session(session);
                    if (!user) {
                        return next(new errorModel_1.default("레이저 커팅기 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    user.countOfLaserPerWeek += 1;
                    user.countOfLaserPerDay += 1;
                    yield laserReservation.deleteOne({ session });
                    yield user.save({ session });
                    deletedReservations.push({ machine: machine, _id: _id, date: d });
                    break;
                case "printer":
                    const printerReservation = yield reservationModel_1.PrinterReservationModel
                        .findById(_id)
                        .session(session);
                    if (!printerReservation) {
                        return next(new errorModel_1.default("3D 프린터 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    if (printerReservation.userId.toString() !== userId.toString() || printerReservation.date.toISOString() !== new Date(d).toISOString()) {
                        return next(new errorModel_1.default("3D 프린터 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    yield printerReservation.deleteOne({ session });
                    deletedReservations.push({ machine: machine, _id: _id, date: d });
                    break;
                case "heat":
                    const heatReservation = yield reservationModel_1.HeatReservationModel
                        .findById(_id)
                        .session(session);
                    if (!heatReservation) {
                        return next(new errorModel_1.default("열선 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    if (heatReservation.userId.toString() !== userId.toString() || heatReservation.date.toISOString() !== new Date(d).toISOString()) {
                        return next(new errorModel_1.default("열선 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    yield heatReservation.deleteOne({ session });
                    deletedReservations.push({ machine: machine, _id: _id, date: d });
                    break;
                case "saw":
                    const sawReservation = yield reservationModel_1.SawReservationModel
                        .findById(_id)
                        .session(session);
                    if (!sawReservation) {
                        return next(new errorModel_1.default("톱 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    if (sawReservation.userId.toString() !== userId.toString() || sawReservation.date.toISOString() !== new Date(d).toISOString()) {
                        return next(new errorModel_1.default("톱 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    yield sawReservation.deleteOne();
                    deletedReservations.push({ machine: machine, _id: _id, date: d });
                    break;
                case "vacuum":
                    const vacuumReservation = yield reservationModel_1.VacuumReservationModel
                        .findById(_id)
                        .session(session);
                    if (!vacuumReservation) {
                        return next(new errorModel_1.default("사출 성형기 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    if (vacuumReservation.userId.toString() !== userId.toString() || vacuumReservation.date.toISOString() !== new Date(d).toISOString()) {
                        return next(new errorModel_1.default("사출 성형기 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    yield vacuumReservation.deleteOne({ session });
                    deletedReservations.push({ machine: machine, _id: _id, date: d });
                    break;
                case "cnc":
                    const cncReservation = yield reservationModel_1.CncReservationModel
                        .findById(_id)
                        .session(session);
                    if (!cncReservation) {
                        return next(new errorModel_1.default("CNC 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    if (cncReservation.userId.toString() !== userId.toString() || cncReservation.date.toISOString() !== new Date(d).toISOString()) {
                        return next(new errorModel_1.default("CNC 예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
                    }
                    yield cncReservation.deleteOne({ session });
                    deletedReservations.push({ machine: machine, _id: _id, date: d });
                    break;
                default:
                    break;
            }
        }
        yield session.commitTransaction();
        return res.status(200).json({ data: deletedReservations });
    }
    catch (err) {
        yield session.abortTransaction();
        return next(new errorModel_1.default("예약 취소 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield session.endSession();
    }
});
exports.deleteReservations = deleteReservations;
