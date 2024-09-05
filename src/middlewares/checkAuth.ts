import {NextFunction, Request, Response} from "express";

import jwt from "../utils/jwtUtil";
import HttpError from "../models/errorModel";

export interface CustomRequest extends Request {
    userData?: any;
}

const checkAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        return next(new HttpError("인증에 실패하였습니다.", 403));
    }

    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return next(new HttpError("인증에 실패하였습니다.", 403));
        }

        const decodedToken = jwt.verify(token);
        req.userData = decodedToken.decoded;
        return next();
    } catch (err) {
        return next(new HttpError("접근 권한이 없습니다.", 403));
    }
};

export default checkAuth;