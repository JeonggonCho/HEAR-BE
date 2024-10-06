import {NextFunction, Response} from "express";
import mongoose from "mongoose";
import {validationResult} from "express-validator";

import {CustomRequest} from "../middlewares/checkAuth";

import HttpError from "../models/errorModel";
import {
    CncReservationModel,
    LaserReservationModel,
    SawReservationModel,
    VacuumReservationModel
} from "../models/reservationModel";
import UserModel from "../models/userModel";
import {CncModel, LaserModel, LaserTimeModel, SawModel, VacuumModel} from "../models/machineModel";

import {getTomorrowDate} from "../utils/calculateDate";

// 레이저 커팅기 예약하기
const newLaserReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
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

    const laserReservationInfo = req.body;
    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 레이저 커팅기를 예약 할 수 없습니다.", 403));
    }

    // 예약 요청 유저 찾기
    let user;
    try {
        user = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!user) {
        return next(new HttpError("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }

    // 교육 이수 확인
    if (!user.passQuiz) {
        return next(new HttpError("교육 미이수로 인하여 예약이 불가능합니다.", 403));
    }

    // 경고가 2회 미만인지 확인
    if (user.countOfWarning as number >= 2) {
        return next(new HttpError("누적된 경고로 인하여 예약이 불가능합니다.", 403));
    }

    // 학생의 예약 가능 횟수가 남아있는지 확인
    if (Math.min(user.countOfLaserPerDay, user.countOfLaserPerWeek) < laserReservationInfo.length) {
        return next(new HttpError("예약 가능 횟수를 초과하여 예약이 불가능합니다.", 403));
    }

    // 유효한 시간(아직 예약되지 않은 시간), 날짜(내일) 확인해야 함
    const validDate = getTomorrowDate();

    for (const reservationInfo of laserReservationInfo) {
        // 올바른 기기 id를 전달하였는지, 기기의 현재 상태가 true인지 확인
        let laserMachine;
        try {
            laserMachine = await LaserModel.findById(reservationInfo.machineId);
        } catch (err) {
            return next(new HttpError("레이저 커팅기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }

        if (!laserMachine || !laserMachine.status) {
            return next(new HttpError("유효하지 않은 데이터이므로 레이저 커팅기를 예약 할 수 없습니다.", 403));
        }

        // 내일 날짜 및 유효한 날짜인지 확인
        if (reservationInfo.date !== validDate) {
            return next(new HttpError("유효하지 않은 데이터이므로 레이저 커팅기를 예약 할 수 없습니다.", 403));
        }

        // 올바른 시간 id를 전달하였는지, 아직 예약되지 않은 유효한 시간인지 확인
        let laserTime;
        let laserReservationInfo;
        try {
            console.log(reservationInfo.timeId, reservationInfo.date)
            laserTime = await LaserTimeModel.findById(reservationInfo.timeId);
            laserReservationInfo = await LaserReservationModel.find({
                timeId: reservationInfo.timeId,
                date: new Date(reservationInfo.date),
            });
        } catch (err) {
            return next(new HttpError("레이저 커팅기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }

        if (!laserTime || laserReservationInfo.length > 0) {
            console.log(laserTime, laserReservationInfo)
            return next(new HttpError("유효하지 않은 데이터이므로 레이저 커팅기를 예약 할 수 없습니다.", 403));
        }
    }

    const createdLaserReservations = laserReservationInfo.map((value: any) => {
        return (new LaserReservationModel({
            machine: "laser",
            date: value.date,
            userId,
            machineId: value.machineId,
            timeId: value.timeId,
        }));
    });

    // 트랜잭션을 통해 예약과 동시에 유저의 예약 가능 횟수 차감시키기
    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        for (const reservation of createdLaserReservations) {
            await reservation.save({session: sess});
            user.countOfLaserPerWeek -= 1;
            user.countOfLaserPerDay -= 1;
        }
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("레이저 커팅기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }

    res.status(201).json({data: {message: "레이저 커팅기 예약 성공"}});
};

// 3d 프린터 예약하기
const newPrinterReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    console.log(req.body);
};

// 열선 예약하기
const newHeatReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    // TODO 현재 가용 가능한 열선이 있는지 개수 확인

    // TODO 날짜가 주말인지, 공휴일인지 유효성 검사 확인 필요

    console.log(req.body);
};

// 톱 예약하기
const newSawReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
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

    const {date, startTime, endTime} = req.body;
    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 톱을 예약 할 수 없습니다.", 403));
    }

    // 톱 조회하기
    let sawMachine;
    try {
        sawMachine = await SawModel.find();
    } catch (err) {
        return next(new HttpError("톱 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 톱이 있는지, 혹은 현재 활성화 상태인지 확인
    if (sawMachine.length === 0 || !sawMachine[0].status) {
        return next(new HttpError("유효하지 않은 데이터이므로 톱을 예약 할 수 없습니다.", 403));
    }

    // TODO 날짜가 주말인지, 공휴일인지 유효성 검사 확인 필요

    // 톱 예약 모델 객체 생성
    const createdSawReservation = new SawReservationModel({
        machine: "saw",
        userId: userId,
        date: date,
        startTime: startTime,
        endTime: endTime,
    });

    // 톱 예약 저장하기
    try {
        await createdSawReservation.save();
    } catch (err) {
        return next(new HttpError("톱 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(201).json({data: {message: "톱 예약 성공"}});
};

// 사출 성형기 예약하기
const newVacuumReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
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

    const {date, startTime, endTime} = req.body;
    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 사출 성형기를 예약 할 수 없습니다.", 403));
    }

    // 사출 성형기 조회하기
    let vacuumMachine;
    try {
        vacuumMachine = await VacuumModel.find();
    } catch (err) {
        return next(new HttpError("사출 성형기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 사출 성형기가 있는지, 혹은 현재 활성화 상태인지 확인
    if (vacuumMachine.length === 0 || !vacuumMachine[0].status) {
        return next(new HttpError("유효하지 않은 데이터이므로 사출 성형기를 예약 할 수 없습니다.", 403));
    }

    // TODO 날짜가 주말인지, 공휴일인지 유효성 검사 확인 필요

    // 사출 성형기 예약 모델 객체 생성
    const createdVacuumReservation = new VacuumReservationModel({
        machine: "vacuum",
        userId: userId,
        date: date,
        startTime: startTime,
        endTime: endTime,
    });

    // 사출 성형기 예약 저장하기
    try {
        await createdVacuumReservation.save();
    } catch (err) {
        return next(new HttpError("사출 성형기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(201).json({data: {message: "사출 성형기 예약 성공"}});
};

// cnc 예약하기
const newCncReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
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

    const {date} = req.body;
    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 CNC를 예약 할 수 없습니다.", 403));
    }

    // CNC 조회하기
    let cncMachine;
    try {
        cncMachine = await CncModel.find();
    } catch (err) {
        return next(new HttpError("CNC 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // CNC가 있는지, 혹은 현재 활성화 상태인지 확인
    if (cncMachine.length === 0 || !cncMachine[0].status) {
        return next(new HttpError("유효하지 않은 데이터이므로 CNC를 예약 할 수 없습니다.", 403));
    }

    // TODO 날짜가 주말인지, 공휴일인지 2일 뒤가 맞는지 유효성 검사 확인 필요

    // TODO 같은 날짜에 이미 예약이 되어있는지 확인

    // TODO 유저가 4학년 이상인지,

    // CNC 예약 모델 객체 생성
    const createdCncReservation = new CncReservationModel({
        machine: "cnc",
        date: date,
        userId: userId,
    });

    // CNC 예약 저장하기
    try {
        await createdCncReservation.save();
    } catch (err) {
        return next(new HttpError("CNC 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(201).json({data: {message: "CNC 예약 성공"}});
};

export {
    newLaserReservation,
    newPrinterReservation,
    newHeatReservation,
    newSawReservation,
    newVacuumReservation,
    newCncReservation
};