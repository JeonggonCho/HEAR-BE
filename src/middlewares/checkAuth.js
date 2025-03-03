"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwtUtil_1 = __importDefault(require("../utils/jwtUtil"));
const errorModel_1 = __importDefault(require("../models/errorModel"));
const checkAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return next(new errorModel_1.default("인증에 실패하였습니다.", 403));
    }
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return next(new errorModel_1.default("인증에 실패하였습니다.", 403));
        }
        const decodedToken = jwtUtil_1.default.verify(token);
        req.userData = decodedToken.decoded;
        return next();
    }
    catch (err) {
        return next(new errorModel_1.default("접근 권한이 없습니다.", 403));
    }
};
exports.default = checkAuth;
