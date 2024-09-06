import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import UserModel from "../models/userModel";
import HttpError from "../models/errorModel";

import jwt from "../utils/jwtUtil";
import {CustomRequest} from "../middlewares/checkAuth";


// 유저 정보 가져오기
const getUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다.", 401));
    }

    const {userId} = req.userData;

    // id로 유저 찾기
    let existingUser;
    try {
        existingUser = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 유저가 없을 경우, 오류 발생시키기
    if (!existingUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }

    res.status(200).json({
        data: {
            year: existingUser.year,
            studio: existingUser.studio,
            passQuiz: existingUser.passQuiz,
            countOfLaser: existingUser.countOfLaser,
            countOfWarning: existingUser.countOfWarning,
            tel: existingUser.tel,
        }
    });
};

// 회원가입
const signup = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    const {username, email, password, year, studentId, studio, tel} = req.body;

    // 동일 email 유저 확인
    let existingUser;
    try {
        existingUser = await UserModel.findOne({email});
    } catch (err) {
        return next(new HttpError("회원가입 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 동일한 email 유저 존재 시, 오류 발생
    if (existingUser) {
        return next(new HttpError("이미 가입한 유저입니다.", 422));
    }

    // 비밀번호 암호화
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError("회원가입 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 유저 생성
    const createdUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        role: "student",
        passQuiz: false,
        studio,
        year,
        tel,
        studentId,
        countOfWarning: 0,
        countOfLaser: 4,
        refreshTokenId: new mongoose.Types.ObjectId(), // 임시 토큰 아이디
    });

    // 트랜잭션을 사용해 유저 및 리프레시 토큰 생성
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();

        // 유저 저장
        await createdUser.save({session: sess});

        // 리프레시 토큰 생성 및 저장
        const [refreshToken, refreshTokenId] = await jwt.refresh(createdUser._id);

        // 생성된 리프레시 토큰의 _id를 유저의 refreshTokenId에 적용
        createdUser.refreshTokenId = refreshTokenId as mongoose.Types.ObjectId;
        await createdUser.save({session: sess});

        await sess.commitTransaction();
        await sess.endSession();

        // JWT 액세스 토큰 생성
        const accessToken = jwt.sign(createdUser);

        // 결과 반환
        res.status(201).json({
            data: {
                userId: createdUser._id,
                email: createdUser.email,
                username: createdUser.username,
                studentId: createdUser.studentId,
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        return next(new HttpError("회원가입 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};

// 로그인
const login = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    const {email, password} = req.body;

    // email로 유저 찾기
    let existingUser;
    try {
        existingUser = await UserModel.findOne({email});
    } catch (err) {
        return next(new HttpError("로그인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 유저 없을 경우, 오류 발생
    if (!existingUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 로그인 할 수 없습니다.", 403));
    }

    // 요청 비밀번호와 암호화된 비밀번호 비교
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(new HttpError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    // 비밀번호가 안 맞을 경우, 오류 발생
    if (!isValidPassword) {
        return next(new HttpError("유효하지 않은 데이터이므로 로그인 할 수 없습니다.", 401));
    }

    // JWT 토큰 생성
    try {
        const accessToken = jwt.sign(existingUser);
        const [refreshToken] = await jwt.refresh(existingUser._id);

        // 결과 반환
        res.status(200).json({
            data: {
                userId: existingUser._id,
                email: existingUser.email,
                username: existingUser.username,
                studentId: existingUser.studentId,
                accessToken,
                refreshToken,
            }
        });
    } catch (err) {
        return next(new HttpError("로그인 중 토큰 생성 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};

// 유저 정보 수정
const updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    const {year, studio, tel} = req.body;
    const {userId} = req.userData;

    // 유저 정보 업데이트
    let updatedUser;
    try {
        updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {year, studio, tel},
            {new: true}
        );
    } catch (err) {
        return next(new HttpError("유저 정보 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    // 해당 아이디의 유저가 없을 경우
    if (!updatedUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }

    // 성공 응답
    res.status(200).json({message: "유저 정보가 성공적으로 수정되었습니다.", user: updatedUser});
};

const deleteUser = async (req: CustomRequest, res: Response, next: NextFunction) => {

};

export {getUser, signup, login, updateUser, deleteUser}