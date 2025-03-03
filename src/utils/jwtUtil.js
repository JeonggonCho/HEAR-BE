"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const refreshTokenModel_1 = __importDefault(require("../models/refreshTokenModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const errorModel_1 = __importDefault(require("../models/errorModel"));
dotenv_1.default.config();
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const jwtUtil = {
    // 액세스 토큰 발급
    sign: (props) => {
        const payload = {
            userId: props._id,
            email: props.email,
            username: props.username,
            role: props.role,
            studentId: props.studentId,
        };
        return jsonwebtoken_1.default.sign(payload, JWT_PRIVATE_KEY, { expiresIn: '1h' });
    },
    // 액세스 토큰 검증
    verify: (token) => {
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_PRIVATE_KEY);
            return {
                ok: true,
                decoded
            };
        }
        catch (err) {
            return {
                ok: false,
                message: err.message,
            };
        }
    },
    // 리프레쉬 토큰 발급
    refresh: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const sess = yield mongoose_1.default.startSession();
        sess.startTransaction();
        try {
            // 기존 리프레쉬 토큰 제거
            yield refreshTokenModel_1.default
                .findOneAndDelete({ userId })
                .session(sess);
            // 새로운 리프레쉬 토큰 생성
            const token = jsonwebtoken_1.default.sign({}, JWT_PRIVATE_KEY, { expiresIn: "14d" });
            // 리프레쉬 토큰 저장
            const createdRefreshToken = yield refreshTokenModel_1.default.create([{ userId, token }], { session: sess });
            // 유저의 refreshTokenId를 업데이트
            yield userModel_1.default.updateOne({ _id: userId }, { $set: { refreshTokenId: createdRefreshToken[0]._id } }).session(sess);
            // 트랜잭션 커밋
            yield sess.commitTransaction();
            // 토큰과 저장된 리프레쉬 토큰의 _id 반환
            return [token, createdRefreshToken[0]._id];
        }
        catch (err) {
            yield sess.abortTransaction();
            throw new errorModel_1.default("토큰 갱신 중 오류가 발생했습니다.", 500);
        }
        finally {
            yield sess.endSession();
        }
    }),
    // 리프레쉬 토큰 검증
    refreshVerify: (refreshToken, userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const existingRefreshToken = yield refreshTokenModel_1.default.findOne({ userId, token: refreshToken });
            if (!existingRefreshToken) {
                return false;
            }
            jsonwebtoken_1.default.verify(refreshToken, JWT_PRIVATE_KEY);
            return true;
        }
        catch (err) {
            return false;
        }
    })
};
exports.default = jwtUtil;
