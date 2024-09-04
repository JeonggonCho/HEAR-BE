import {NextFunction, Request, Response} from "express";

import jwt from "../utils/jwtUtil";
import HttpError from "../models/errorModel";

interface CustomRequest extends Request {
    userData?: any;
}

const checkAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(" ")[1];

            if (!token) {
                throw new Error("인증에 실패하였습니다.");
            }

            const decodedToken = jwt.verify(token);
            req.userData = {...decodedToken};
            next();
        } catch (err) {
            return next(new HttpError("접근 권한이 없습니다.", 403));
        }
    } else {
        throw new Error("인증에 실패하였습니다.");
    }
};

export default checkAuth;