import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

import RefreshTokenModel from "../models/refreshTokenModel";
import UserModel from "../models/userModel";
import HttpError from "../models/errorModel";

dotenv.config();

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY as string;

interface ITokenSignProps {
    _id: mongoose.Types.ObjectId;
    email: string;
    username: string;
    role: "admin" | "student" | "manager";
    studentId: string;
}

const jwtUtil = {
    // 액세스 토큰 발급
    sign: (props: ITokenSignProps) => {
        const payload = {
            userId: props._id,
            email: props.email,
            username: props.username,
            role: props.role,
            studentId: props.studentId,
        };

        return jwt.sign(payload, JWT_PRIVATE_KEY, {expiresIn: '1h'});
    },

    // 액세스 토큰 검증
    verify: (token: string) => {
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_PRIVATE_KEY);
            return {
                ok: true,
                decoded
            };
        } catch (err: any) {
            return {
                ok: false,
                message: err.message,
            };
        }
    },

    // 리프레쉬 토큰 발급
    refresh: async (userId: mongoose.Types.ObjectId) => {
        const sess = await mongoose.startSession();
        sess.startTransaction();

        try {
            // 기존 리프레쉬 토큰 제거
            await RefreshTokenModel.findOneAndDelete({userId}).session(sess);

            // 새로운 리프레쉬 토큰 생성
            const token = jwt.sign({}, JWT_PRIVATE_KEY, {expiresIn: "14d"});

            // 리프레쉬 토큰 저장
            const createdRefreshToken = await RefreshTokenModel.create([{userId, token}], {session: sess});

            // 유저의 refreshTokenId를 업데이트
            await UserModel.updateOne(
                {_id: userId},
                {$set: {refreshTokenId: createdRefreshToken[0]._id}}
            ).session(sess);

            // 트랜잭션 커밋
            await sess.commitTransaction();

            // 토큰과 저장된 리프레쉬 토큰의 _id 반환
            return [token, createdRefreshToken[0]._id as mongoose.Types.ObjectId];
        } catch (err) {
            await sess.abortTransaction();
            throw new HttpError("토큰 갱신 중 오류가 발생했습니다.", 500);
        } finally {
            await sess.endSession();
        }
    },

    // 리프레쉬 토큰 검증
    refreshVerify: async (refreshToken: string, userId: string) => {
        try {
            const existingRefreshToken = await RefreshTokenModel.findOne({userId, token: refreshToken});
            if (!existingRefreshToken) {
                return false;
            }

            jwt.verify(refreshToken, JWT_PRIVATE_KEY);
            return true;
        } catch (err) {
            return false;
        }
    }
};

export default jwtUtil;