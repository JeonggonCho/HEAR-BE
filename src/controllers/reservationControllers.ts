import {NextFunction, Response} from "express";
import mongoose from "mongoose";
import {validationResult} from "express-validator";

import {CustomRequest} from "../middlewares/checkAuth";

import HttpError from "../models/errorModel";
import {
    CncReservationModel,
    LaserReservationModel,
    PrinterReservationModel,
    SawReservationModel,
    VacuumReservationModel
} from "../models/reservationModel";
import UserModel from "../models/userModel";
import {CncModel, LaserModel, LaserTimeModel, SawModel, VacuumModel} from "../models/machineModel";

import {getTomorrowDate, isHoliday} from "../utils/calculateDate";


// 레이저 커팅기 기기 당 예약 가능 시간 조회
const getValidLaserInfo = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기 정보를 조회 할 수 없습니다.", 403));
    }

    let lasers;
    try {
        lasers = await LaserModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    let laserTimes;
    try {
        laserTimes = await LaserTimeModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!lasers || !laserTimes) {
        res.status(404).json({data: []})
    }

    let laserReservations;
    try {
        const tomorrowDate = getTomorrowDate();
        laserReservations = await LaserReservationModel.find({date: new Date(tomorrowDate)});
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    let laserInfo = lasers.map((laser) => ({
        laserId: laser._id,
        laserName: laser.name,
        laserStatus: laser.status,
    }));

    let laserTimesInfo = lasers.map((laser) =>
        laserTimes.map((laserTime) => {
            // 내일 사용 시간에 해당 레이저 기기의 해당 시간대에 예약이 있는지 확인
            const isReserved = laserReservations.some((laserReservation) => {
                // 예약 내역의 시간 데이터 포맷 변환
                const formattedDate = `${laserReservation.date.getFullYear()}-${(laserReservation.date.getMonth() + 1).toString().padStart(2, '0')}-${laserReservation.date.getDate().toString().padStart(2, '0')}`;
                return laserReservation.machineId.equals(laser._id as string) && laserReservation.startTime === laserTime.startTime && laserReservation.endTime === laserTime.endTime && (formattedDate === getTomorrowDate());
            });
            return {
                laserId: laser._id,
                startTime: laserTime.startTime,
                endTime: laserTime.endTime,
                timeStatus: !isReserved, // 예약이 있으면 false, 없으면 true
            };
        }),
    ).flat();

    res.status(200).json({data: {laserInfo, laserTimesInfo}});
};


// 3D 프린터 예약 현황 조회
const getAllPrinterReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기 정보를 조회 할 수 없습니다.", 403));
    }

    let printerReservations;
    try {
        printerReservations = await PrinterReservationModel.find();
    } catch (err) {
        return next(new HttpError("기기 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }


    res.status(200).json({data: "시간"});
};


// 열선 예약 현황 조회
const getAllHeatReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {

};


// 톱 예약 현황 조회
const getAllSawReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {

};


// 사출 성형기 예약 현황 조회
const getAllVacuumReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {

};


// cnc 예약 현황 조회
const getAllCncReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 기기 정보를 조회 할 수 없습니다.", 403));
    }

    let cncReservations;
    try {
        const today = new Date();
        cncReservations = await CncReservationModel.find({date: {$gt: today}});
    } catch (err) {
        return next(new HttpError("CNC 예약 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (cncReservations.length === 0) {
        return res.status(200).json({data: []});
    }

    let cncReservationCondition: { date: Date; }[] = [];

    cncReservations.forEach((c) => {
        cncReservationCondition.push({date: c.date});
    });

    res.status(200).json({data: cncReservationCondition});
};


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

        // 날짜가 주말인지 확인
        if ([0, 6].includes((new Date(reservationInfo.date)).getDay())) {
            return next(new HttpError("유효하지 않은 데이터이므로 레이저 커팅기를 예약할 수 없습니다.", 403));
        }

        // 시작시간이 종료시간 전인지 확인
        const [startHour, startMinute] = reservationInfo.startTime.split(":").map(Number);
        const [endHour, endMinute] = reservationInfo.endTime.split(":").map(Number);
        if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
            return next(new HttpError("유효하지 않은 데이터이므로 레이저 커팅기를 예약할 수 없습니다.", 403));

        }

        // 공휴일인지 확인
        if (isHoliday(new Date(reservationInfo.date))) {
            return next(new HttpError("유효하지 않은 데이터이므로 레이저 커팅기를 예약할 수 없습니다.", 403));
        }

        // 올바른 시간 id를 전달하였는지, 아직 예약되지 않은 유효한 시간인지 확인
        let laserTime;
        let laserReservationInfo;
        try {
            laserTime = await LaserTimeModel.find({
                startTime: reservationInfo.startTime,
                endTime: reservationInfo.endTime
            });
            laserReservationInfo = await LaserReservationModel.find({
                startTime: reservationInfo.startTime,
                endTime: reservationInfo.endTime,
                date: new Date(reservationInfo.date),
            });
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
            startTime: value.startTime,
            endTime: value.endTime,
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

    const printerReservationInfo = req.body;
    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 3D 프린터를 예약 할 수 없습니다.", 403));
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
};


// 열선 예약하기
const newHeatReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
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
        return next(new HttpError("유효하지 않은 데이터이므로 열선을 예약 할 수 없습니다.", 403));
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

    // TODO 현재 가용 가능한 열선이 있는지 개수 확인

    // TODO 날짜가 주말인지, 공휴일인지 유효성 검사 확인 필요

    // TODO 예약 저장 및 소속 스튜디오 학생들도 예약 중으로 만들기

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

    // 유저가 4학년 이상인지 확인
    if (!user.year || !["4", "5"].includes(user.year)) {
        return next(new HttpError("4학년 이상이 아니기 때문에 예약이 불가능합니다.", 403));
    }

    // 날짜 유효성 검사하기
    const today = new Date();
    const reservationDate = new Date(date);

    // 요청 날짜가 오늘로부터 2일 이후인지 확인
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);

    // 요청 날짜가 과거인지 확인
    if (reservationDate <= today) {
        return next(new HttpError("과거 날짜는 예약할 수 없습니다.", 403));
    }

    if (reservationDate < twoDaysFromNow) {
        return next(new HttpError("CNC 예약은 최소 2일 후부터 가능합니다.", 403));
    }

    // 날짜가 주말인지 확인
    if ([0, 6].includes(reservationDate.getDay())) {
        return next(new HttpError("주말로 인해 CNC를 예약할 수 없습니다.", 403));
    }

    // 공휴일인지 확인
    if (isHoliday(reservationDate)) {
        return next(new HttpError("공휴일로 인해 CNC를 예약할 수 없습니다.", 403));
    }

    let cncReservationInfo;
    try {
        cncReservationInfo = await CncReservationModel.find({date: new Date(reservationDate)});
    } catch (err) {
        return next(new HttpError("CNC 예약 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 같은 날짜에 이미 예약이 되어있는지 확인
    if (cncReservationInfo.length > 0) {
        return next(new HttpError("이미 예약된 날짜이므로 CNC 예약을 할 수 없습니다.", 403));
    }

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
    getValidLaserInfo,
    getAllPrinterReservation,
    getAllHeatReservation,
    getAllSawReservation,
    getAllVacuumReservation,
    getAllCncReservation,
    newLaserReservation,
    newPrinterReservation,
    newHeatReservation,
    newSawReservation,
    newVacuumReservation,
    newCncReservation
};