import {CustomRequest} from "../middlewares/checkAuth";
import {NextFunction, Response} from "express";
import {validationResult} from "express-validator";
import HttpError from "../models/errorModel";

// 레이저 커팅기 예약하기
const newLaserReservation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    console.log(req.body);
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