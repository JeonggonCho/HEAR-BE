import {CustomRequest} from "../middlewares/checkAuth";
import {NextFunction, Response} from "express";
import {validationResult} from "express-validator";
import HttpError from "../models/errorModel";
import {
    CncModel,
    HeatModel,
    LaserModel,
    LaserTimeModel,
    PrinterModel,
    SawModel,
    VacuumModel
} from "../models/machineModel";
import mongoose from "mongoose";


// 레이저 커팅기 생성
const newLaser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {name} = req.body;
    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    const createdLaser = new LaserModel({name});

    try {
        createdLaser.save();
        return res.status(201).json({data: {laser: createdLaser}});
    } catch (err) {
        return next(new HttpError("레이저 커팅기 생성 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 레이저 커팅기 시간 추가
const newLaserTime = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {id, startTime, endTime} = req.body;
    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    const createdLaserTime = new LaserTimeModel({id, startTime, endTime});
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
    } catch (err) {
        return next(new HttpError("레이저 커팅기 시간 추가 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 3d 프린터 생성
const newPrinter = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {name} = req.body;
    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    const createdPrinter = new PrinterModel({name});

    try {
        createdPrinter.save();
        return res.status(201).json({data: {printer: createdPrinter}});
    } catch (err) {
        return next(new HttpError("3d 프린터 생성 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 기기 활성화 상태 조회
const getStatus = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "manager" && role !== "admin" && role !== "student") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let laserStatus = false;
    let printerStatus = false;
    let heatStatus = false;
    let sawStatus = false;
    let vacuumStatus = false;
    let cncStatus = false;

    try {
        const lasers = await LaserModel.find();
        laserStatus = lasers.some(el => el.status);

        const printers = await PrinterModel.find();
        printerStatus = printers.some(el => el.status);

        const heats = await HeatModel.find();
        heatStatus = heats.some(el => el.status);

        if (heats[0].count === 0) {
            heatStatus = false;
        }

        const saws = await SawModel.find();
        sawStatus = saws.some(el => el.status);

        const vacuums = await VacuumModel.find();
        vacuumStatus = vacuums.some(el => el.status);

        const cncs = await CncModel.find();
        cncStatus = cncs.some(el => el.status);
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
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
};


// 레이저 커팅기 정보 조회
const getLasers = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let lasers;
    try {
        lasers = await LaserModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    return res.status(200).json({data: {lasers}});
};


// 레이저 커팅기 시간 목록 조회
const getLaserTimes = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let laserTimes;
    try {
        laserTimes = await LaserTimeModel
            .find()
            .sort({_id: 1});
    } catch (err) {
        return next(new HttpError("레이저 커팅기 시간 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    return res.status(200).json({
        data: {
            laserTimes: laserTimes.map(({id, startTime, endTime}) => ({
                id,
                startTime,
                endTime,
            }))
        }
    });
};


// 3d 프린터 정보 조회
const getPrinters = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let printers;
    try {
        printers = await PrinterModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    return res.status(200).json({data: {printers}});
};


// 열선 정보 조회
const getHeats = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let heats;
    try {
        heats = await HeatModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    return res.status(200).json({data: {heats}});
};


// 톱 정보 조회
const getSaws = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let saws;
    try {
        saws = await SawModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    return res.status(200).json({data: {saws}});
};


// 사출 성형기 정보 조회
const getVacuums = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let vacuums;
    try {
        vacuums = await VacuumModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    return res.status(200).json({data: {vacuums}});
};


// cnc 정보 조회
const getCncs = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let cncs;
    try {
        cncs = await CncModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    return res.status(200).json({data: {cncs}});
};


// 레이저 커팅기 정보 수정
const updateLaser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {name, status, times} = req.body;
    const {laserId} = req.params;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let laser;
    try {
        laser = await LaserModel.findByIdAndUpdate(laserId, {name, status, times}, {new: true});
    } catch (err) {
        return next(new HttpError("레이저 커팅기 정보 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!laser) {
        return next(new HttpError("유효하지 않은 데이터이므로 레이저 커팅기 정보를 수정 할 수 없습니다.", 403));
    }

    return res.status(200).json({message: "레이저 커팅기 수정완료"});
};


// 레이저 커팅기 시간 목록 수정
const updateLaserTimes = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const laserTimeList = req.body;
    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        // 1. 기존 데이터 모두 삭제
        await LaserTimeModel.deleteMany({}, {session: sess});

        // 2. 새로운 데이터 삽입
        for (const laserTime of laserTimeList) {
            const newLaserTime = new LaserTimeModel(laserTime);
            await newLaserTime.save({session: sess});
        }

        // 3. 트랜잭션 커밋 (모든 작업이 성공하면 확정)
        await sess.commitTransaction();
    } catch (error) {
        // 4. 오류 발생 시 롤백
        await sess.abortTransaction();
        return next(new HttpError("레이저 커팅기 시간 목록 수정 중 오류가 발생했습니다.", 500));
    } finally {
        await sess.endSession();
    }

    return res.status(200).json({message: "레이저 커팅기 시간 목록을 성공적으로 업데이트했습니다."});
};


// 3d 프린터 정보 수정
const updatePrinter = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {name, status} = req.body;
    const {printerId} = req.params;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let printer;
    try {
        printer = await PrinterModel.findByIdAndUpdate(printerId, {name, status}, {new: true});
    } catch (err) {
        return next(new HttpError("3d 프린터 정보 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!printer) {
        return next(new HttpError("유효하지 않은 데이터이므로 3d 프린터 정보를 수정 할 수 없습니다.", 403));
    }

    return res.status(200).json({message: "3d 프린터 수정완료"});
};


// 열선 정보 수정
const updateHeat = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {status, count} = req.body;
    const {heatId} = req.params;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let heat;
    try {
        heat = await HeatModel.findByIdAndUpdate(heatId, {status, count}, {new: true});
    } catch (err) {
        return next(new HttpError("열선 정보 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!heat) {
        return next(new HttpError("유효하지 않은 데이터이므로 열선 정보를 수정 할 수 없습니다.", 403));
    }

    return res.status(200).json({message: "열선 수정완료"});
};


// 톱 정보 수정
const updateSaw = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {status} = req.body;
    const {sawId} = req.params;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let saw;
    try {
        saw = await SawModel.findByIdAndUpdate(sawId, {status}, {new: true});
    } catch (err) {
        return next(new HttpError("톱 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!saw) {
        return next(new HttpError("유효하지 않은 데이터이므로 톱 정보를 수정 할 수 없습니다.", 403));
    }

    return res.status(200).json({message: "톱 수정완료"});
};


// 사출 성형기 정보 수정
const updateVacuum = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {status} = req.body;
    const {vacuumId} = req.params;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let vacuum;
    try {
        vacuum = await VacuumModel.findByIdAndUpdate(vacuumId, {status}, {new: true});
    } catch (err) {
        return next(new HttpError("사출 성형기 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!vacuum) {
        return next(new HttpError("유효하지 않은 데이터이므로 사출 성형기 정보를 수정 할 수 없습니다.", 403));
    }

    return res.status(200).json({message: "사출 성형기 수정완료"});
};


// cnc 정보 수정
const updateCnc = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {cncId} = req.params;
    const {status} = req.body;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let cnc;
    try {
        cnc = await CncModel.findByIdAndUpdate(cncId, {status}, {new: true});
    } catch (err) {
        return next(new HttpError("cnc 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!cnc) {
        return next(new HttpError("유효하지 않은 데이터이므로 cnc 정보를 수정 할 수 없습니다.", 403));
    }

    return res.status(200).json({message: "cnc 수정완료"});
};


// 레이저 커팅기 기기 삭제
const deleteLaser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {laserId} = req.params;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    try {
        await LaserModel.findByIdAndDelete(laserId);
    } catch (err) {
        return next(new HttpError("레이저 커팅기 기기 삭제 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    return res.status(204).json({message: "레이저 커팅기가 삭제되었습니다."});
};


// 레이저 커팅기 시간 삭제
const deleteLaserTime = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {laserTimeId} = req.params;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let laserTime;
    try {
        laserTime = await LaserTimeModel.findOne({id: laserTimeId});
    } catch (err) {
        return next(new HttpError("레이저 커팅기 기기 삭제 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    if (!laserTime) {
        return next(new HttpError("유효하지 않은 데이터이므로 시간을 삭제 할 수 없습니다.", 403));
    } else {
        await laserTime.deleteOne();
        return res.status(204).json({message: "레이저 커팅기가 삭제되었습니다."});
    }
};


// 3d 프린터 기기 삭제
const deletePrinter = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {printerId} = req.params;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    try {
        await PrinterModel.findByIdAndDelete(printerId);
    } catch (err) {
        return next(new HttpError("3d 프린터 기기 삭제 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    return res.status(204).json({data: {message: "3d 프린터가 삭제되었습니다."}});
};

export {
    newLaser,
    newLaserTime,
    newPrinter,
    getStatus,
    getLasers,
    getLaserTimes,
    getPrinters,
    getHeats,
    getSaws,
    getVacuums,
    getCncs,
    updateLaser,
    updateLaserTimes,
    updatePrinter,
    updateHeat,
    updateSaw,
    updateVacuum,
    updateCnc,
    deleteLaser,
    deleteLaserTime,
    deletePrinter,
};