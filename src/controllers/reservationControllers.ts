import {NextFunction, Response} from "express";
import mongoose from "mongoose";
import {validationResult} from "express-validator";

import {CustomRequest} from "../middlewares/checkAuth";

import HttpError from "../models/errorModel";
import {LaserReservationModel} from "../models/reservationModel";
import UserModel from "../models/userModel";
import {LaserModel, LaserTimeModel} from "../models/machineModel";
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
            laserTime = await LaserTimeModel.findById(reservationInfo.timeId);
            laserReservationInfo = await LaserReservationModel.find({timeId: reservationInfo.timeId});
        } catch (err) {
            return next(new HttpError("레이저 커팅기 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
        }

        if (!laserTime || laserReservationInfo.length > 0) {
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

    console.log(req.body);
};

// 톱 예약하기
const newSawReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    console.log(req.body);
};

// 사출성형기 예약하기
const newVacuumReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    console.log(req.body);
};

// cnc 예약하기
const newCncReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    console.log(req.body);
};

export {
    newLaserReservation,
    newPrinterReservation,
    newHeatReservation,
    newSawReservation,
    newVacuumReservation,
    newCncReservation
};