import {CustomRequest} from "../middlewares/checkAuth";
import {NextFunction, Response} from "express";
import {validationResult} from "express-validator";
import HttpError from "../models/errorModel";
import {CncModel, HeatModel, LaserModel, PrinterModel, SawModel, VacuumModel} from "../models/machineModel";

// 레이저 커팅기 생성
const newLaser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
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

    if (!req.body) {
        return next(new HttpError("데이터가 없어 요청을 처리할 수 없습니다. 다시 시도 해주세요.", 401));
    }

    const {name} = req.body;
    const {userId, role} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 3d 프린터를 생성 할 수 없습니다.", 403));
    }

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    const createdPrinter = new PrinterModel({name});

    try {
        createdPrinter.save();
        res.status(201).json({data: {printer: createdPrinter}});
    } catch (err) {
        return next(new HttpError("3d 프린터 생성 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};

// 레이저 커팅기 정보 조회
const getLasers = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role, userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 조회 할 수 없습니다.", 403));
    }

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let lasers;
    try {
        lasers = await LaserModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(200).json({data: {lasers}});
};

// 3d 프린터 정보 조회
const getPrinters = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role, userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 조회 할 수 없습니다.", 403));
    }

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let printers;
    try {
        printers = await PrinterModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(200).json({data: {printers}});

};

// 열선 정보 조회
const getHeats = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role, userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 조회 할 수 없습니다.", 403));
    }

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let heats;
    try {
        heats = await HeatModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(200).json({data: {heats}});
};

// 톱 정보 조회
const getSaws = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role, userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 조회 할 수 없습니다.", 403));
    }

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let saws;
    try {
        saws = await SawModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(200).json({data: {saws}});
};

// 사출 성형기 정보 조회
const getVacuums = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role, userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 조회 할 수 없습니다.", 403));
    }

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let vacuums;
    try {
        vacuums = await VacuumModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(200).json({data: {vacuums}});
};

// cnc 정보 조회
const getCncs = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role, userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 조회 할 수 없습니다.", 403));
    }

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let cncs;
    try {
        cncs = await CncModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(200).json({data: {cncs}});
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

    const {role, userId} = req.userData;
    const {name, status, times} = req.body;
    const {laserId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 수정 할 수 없습니다.", 403));
    }

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

    res.status(200).json({message: "레이저 커팅기 수정완료"});
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

    const {role, userId} = req.userData;
    const {name, status} = req.body;
    const {printerId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 수정 할 수 없습니다.", 403));
    }

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

    res.status(200).json({message: "3d 프린터 수정완료"});
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

    const {role, userId} = req.userData;
    const {status, count} = req.body;
    const {heatId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 수정 할 수 없습니다.", 403));
    }

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

    res.status(200).json({message: "열선 수정완료"});
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

    const {role, userId} = req.userData;
    const {status} = req.body;
    const {sawId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 수정 할 수 없습니다.", 403));
    }

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

    res.status(200).json({message: "톱 수정완료"});
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

    const {role, userId} = req.userData;
    const {status} = req.body;
    const {vacuumId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 수정 할 수 없습니다.", 403));
    }

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

    res.status(200).json({message: "사출 성형기 수정완료"});
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

    const {role, userId} = req.userData;
    const {cncId} = req.params;
    const {status} = req.body;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 수정 할 수 없습니다.", 403));
    }

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

    res.status(200).json({message: "cnc 수정완료"});
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

    const {role, userId} = req.userData;
    const {laserId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 삭제 할 수 없습니다.", 403));
    }

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    try {
        await LaserModel.findByIdAndDelete(laserId);
    } catch (err) {
        return next(new HttpError("레이저 커팅기 기기 삭제 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    res.status(204).json({message: "레이저 커팅기가 삭제되었습니다."});
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

    const {role, userId} = req.userData;
    const {printerId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기를 삭제 할 수 없습니다.", 403));
    }

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    try {
        await PrinterModel.findByIdAndDelete(printerId);
    } catch (err) {
        return next(new HttpError("3d 프린터 기기 삭제 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    res.status(204).json({message: "3d 프린터가 삭제되었습니다."});
};

export {
    newLaser,
    newPrinter,
    getLasers,
    getPrinters,
    getHeats,
    getSaws,
    getVacuums,
    getCncs,
    updateLaser,
    updatePrinter,
    updateHeat,
    updateSaw,
    updateVacuum,
    updateCnc,
    deleteLaser,
    deletePrinter,
};