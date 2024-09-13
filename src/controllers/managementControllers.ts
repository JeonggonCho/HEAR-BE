import {CustomRequest} from "../middlewares/checkAuth";
import {NextFunction, Response} from "express";
import {validationResult} from "express-validator";
import HttpError from "../models/errorModel";
import {CncModel, HeatModel, LaserModel, PrinterModel, SawModel, VacuumModel} from "../models/machineModel";

const getUsers = async (req: CustomRequest, res: Response, next: NextFunction) => {

};

const getMachines = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

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

    let printers;
    try {
        printers = await PrinterModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    let heats;
    try {
        heats = await HeatModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    let saws;
    try {
        saws = await SawModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    let vacuums;
    try {
        vacuums = await VacuumModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    let cncs;
    try {
        cncs = await CncModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(200).json({data: {lasers, printers, heats, saws, vacuums, cncs}});
};

export {getUsers, getMachines};