import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import bcrypt from "bcryptjs";
import mongoose, {Types} from "mongoose";
import dayjs from "dayjs";

import UserModel from "../models/userModel";
import WarningModel from "../models/warningModel";
import VerificationCodeModel from "../models/verificationCodeModel";
import HttpError from "../models/errorModel";

import {CustomRequest} from "../middlewares/checkAuth";
import jwt from "../utils/jwtUtil";
import jwtUtil from "../utils/jwtUtil";
import isEmailValid from "../utils/isEmailValid";
import generateRandomCode from "../utils/generateRandomCode";
import sendEmail from "../utils/sendEmail";
import generatePassword from "../utils/generatePassword";


// 유저 정보 가져오기
const getUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
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

    return res.status(200).json({
        data: {
            userId: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            year: existingUser.year,
            studentId: existingUser.studentId,
            studio: existingUser.studio,
            passQuiz: existingUser.passQuiz,
            countOfLaserPerWeek: existingUser.countOfLaserPerWeek,
            countOfLaserPerDay: existingUser.countOfLaserPerDay,
            countOfWarning: existingUser.countOfWarning,
            tel: existingUser.tel,
            role: existingUser.role,
            lab: existingUser.lab,
        }
    });
};


// 특정 유저 정보 조회하기
const getUserInfo = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {userId} = req.params;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let existingUser;
    try {
        existingUser = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!existingUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }

    return res.status(200).json({
        data: {
            username: existingUser.username,
            email: existingUser.email,
            year: existingUser.year,
            studentId: existingUser.studentId,
            studio: existingUser.studio,
            passQuiz: existingUser.passQuiz,
            countOfWarning: existingUser.countOfWarning,
            tel: existingUser.tel,
        }
    });
};


// 유저 목록 조회하기
const getUsers = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {year, passQuiz, countOfWarning, username} = req.query;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let filter: any = {role: "student"};

    if (year && typeof year === "string" && year !== "all") {
        const yearsFilter = year.split(",");
        filter.year = {$in: yearsFilter};
    }

    if (passQuiz && typeof passQuiz === "string" && passQuiz !== "all") {
        const passQuizFilter = passQuiz.split(",");
        filter.passQuiz = {$in: passQuizFilter};
    }

    if (countOfWarning && typeof countOfWarning === "string" && countOfWarning !== "all") {
        const countOfWarningFilter = countOfWarning.split(",").map(warning => Number(warning));
        filter.countOfWarning = {$in: countOfWarningFilter};
    }

    if (username && typeof username === "string" && username.trim() !== "") {
        filter.username = {$regex: username, $options: "i"};
    }

    let users;
    try {
        users = await UserModel.find(filter).sort({_id: -1});
    } catch (err) {
        return next(new HttpError("유저 목록 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (users.length === 0) {
        return res.status(200).json({data: []});
    } else {
        return res.status(200).json({
            data:
                users.map((user) => ({
                    userId: user._id,
                    username: user.username,
                    year: user.year,
                    studentId: user.studentId,
                    passQuiz: user.passQuiz,
                    countOfWarning: user.countOfWarning,
                }))
        });
    }
};


// 유효한 이메일인지 확인하기
const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
    const {email} = req.query;

    let user;
    try {
        user = await UserModel.findOne({email});
    } catch (err) {
        return next(new HttpError("이메일 유효성 검사 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!user) {
        return res.status(200).json({data: 200});
    }
    return res.status(200).json({data: 404});
};


// 경고 목록 조회하기
const getWarnings = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;

    let warnings;
    try {
        warnings = await WarningModel.find({userId: userId}).sort({createdAt: -1});
    } catch (err) {
        return next(new HttpError("경고 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (warnings.length === 0) {
        return res.status(200).json({data: []});
    }

    const responseData = warnings.map((warning) => {
        return ({
            _id: warning._id,
            message: warning.message,
            date: warning.createdAt,
        })
    });

    return res.status(200).json({data: responseData});
};


// 조교 정보 조회하기
const getManager = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    let manager;
    try {
        manager = await UserModel.find({role: "manager"});
    } catch (err) {
        return next(new HttpError("조교 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (manager.length === 0) {
        return next(new HttpError("조교 정보를 조회 할 수 없습니다.", 403));
    }

    return res.status(200).json({data: {username: manager[0].username, lab: manager[0].lab}});
};


// 회원가입
const signup = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    const {username, email, password, year, studentId, studio, tel, code} = req.body;

    // 유효한 이메일인지 확인
    let verificationCode;
    try {
        verificationCode = await VerificationCodeModel.findOne({email: email, code: code, verified: true});
    } catch (err) {
        return next(new HttpError("회원가입 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 인증되지 않은 이메일일 경우, 오류 발생
    if (!verificationCode) {
        return next(new HttpError("유효하지 않은 이메일입니다.", 422));
    }

    // 인증된 이메일인 경우, 해당 이메일의 인증 번호 내역 삭제하기
    let existingVerificationCode;
    try {
        existingVerificationCode = await VerificationCodeModel.find({email: email});
    } catch (err) {
        return next(new HttpError("이메일 인증 번호를 전송 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (existingVerificationCode.length !== 0) {
        await Promise.all(existingVerificationCode.map(code => code.deleteOne()));
    }

    // 동일 email 유저 확인
    let existingUser;
    try {
        existingUser = await UserModel.findOne({email});
    } catch (err) {
        return next(new HttpError("회원가입 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 동일한 email 유저 존재 시, 오류 발생
    if (existingUser) {
        return next(new HttpError("이미 가입이 되어있는 유저입니다.", 422));
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
        countOfLaserPerWeek: 4,
        countOfLaserPerDay: 2,
        refreshTokenId: new mongoose.Types.ObjectId(), // 임시 토큰 아이디
    });

    // 트랜잭션을 사용해 유저 및 리프레시 토큰 생성
    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        // 유저 저장
        await createdUser.save({session: sess});

        const userId = createdUser._id as Types.ObjectId;

        // 리프레시 토큰 생성 및 저장
        const [refreshToken, refreshTokenId] = await jwt.refresh(userId);

        // 생성된 리프레시 토큰의 _id를 유저의 refreshTokenId에 적용
        createdUser.refreshTokenId = refreshTokenId as mongoose.Types.ObjectId;
        await createdUser.save({session: sess});

        await sess.commitTransaction();

        // JWT 액세스 토큰 생성
        const accessToken = jwt.sign({
            _id: createdUser._id as Types.ObjectId,
            email: createdUser.email,
            username: createdUser.username,
            role: createdUser.role,
            studentId: createdUser.studentId,
        });

        return res.status(201).json({
            data: {
                userId: createdUser._id,
                email: createdUser.email,
                username: createdUser.username,
                studentId: createdUser.studentId,
                year: createdUser.year,
                studio: createdUser.studio,
                passQuiz: createdUser.passQuiz,
                countOfLaserPerWeek: createdUser.countOfLaserPerWeek,
                countOfLaserPerDay: createdUser.countOfLaserPerDay,
                countOfWarning: createdUser.countOfWarning,
                tel: createdUser.tel,
                role: createdUser.role,
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("회원가입 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
};


// 로그인
const login = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    const {email, password} = req.body;

    // email 로 유저 찾기
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
        const accessToken = jwt.sign({
            _id: existingUser._id as Types.ObjectId,
            email: existingUser.email,
            username: existingUser.username,
            role: existingUser.role,
            studentId: existingUser.studentId,
        });
        const [refreshToken] = await jwt.refresh(existingUser._id as mongoose.Types.ObjectId);

        // 결과 반환
        return res.status(200).json({
            data: {
                userId: existingUser._id,
                email: existingUser.email,
                username: existingUser.username,
                studentId: existingUser.studentId,
                year: existingUser.year,
                studio: existingUser.studio,
                passQuiz: existingUser.passQuiz,
                countOfLaserPerWeek: existingUser.countOfLaserPerWeek,
                countOfLaserPerDay: existingUser.countOfLaserPerDay,
                countOfWarning: existingUser.countOfWarning,
                tel: existingUser.tel,
                role: existingUser.role,
                lab: existingUser.lab,
                accessToken,
                refreshToken,
            }
        });
    } catch (err) {
        return next(new HttpError("로그인 중 토큰 생성 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 이메일 인증 번호 전송
const sendVerificationCode = async (req: Request, res: Response, next: NextFunction) => {
    const {email} = req.body;

    if (!isEmailValid(email)) {
        return next(new HttpError("유효하지 않은 데이터이므로 이메일 인증 번호를 전송 할 수 없습니다.", 403));
    }

    // 이미 가입된 이메일인지 확인
    let existingUser;
    try {
        existingUser = await UserModel.findOne({email});
    } catch (err) {
        return next(new HttpError("이메일 인증 번호를 전송 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (existingUser) {
        return next(new HttpError("이미 가입된 유저이므로 이메일 인증 번호를 전송 할 수 없습니다.", 403));
    }

    // 요청 이메일로 전송된 인증 번호 내역이 있는지 확인
    let existingVerificationCode;
    try {
        existingVerificationCode = await VerificationCodeModel.find({email: email});
    } catch (err) {
        return next(new HttpError("이메일 인증 번호를 전송 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 동일한 이메일로 요청한 인증 번호가 있을 경우, 삭제하기
    if (existingVerificationCode.length !== 0) {
        // await Promise.all 을 통해 모든 삭제 작업 완료 후, 다음 코드로 진행
        await Promise.all(existingVerificationCode.map(code => code.deleteOne()));
    }

    // 인증 번호 생성
    const code = generateRandomCode();
    console.log("인증 번호: ", code);

    // 인증 번호 객체 모델 생성
    const verificationCode = new VerificationCodeModel({
        email: email,
        code: code,
    });

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        // 인증 번호 서버 저장
        await verificationCode.save({session: sess});

        // 이메일로 인증 번호 전송하기
        await sendEmail(email, "[HEAR] 인증 번호 발송", `<h1>안녕하세요 HEAR 입니다</h1><br/><p>인증 번호: <b>${code}</b></p>`);

        await sess.commitTransaction();
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("이메일 인증 번호를 전송 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
    return res.status(200).json({data: {message: "인증 번호가 이메일로 전송되었습니다"}})
};


// 이메일 인증 번호 확인
const verifyEmailCode = async (req: Request, res: Response, next: NextFunction) => {
    const {email, code} = req.body;

    if (!isEmailValid(email)) {
        return next(new HttpError("유효하지 않은 데이터이므로 이메일 인증 번호를 확인 할 수 없습니다.", 403));
    }

    // 이미 가입된 이메일인지 확인
    let existingUser;
    try {
        existingUser = await UserModel.findOne({email});
    } catch (err) {
        return next(new HttpError("이메일 인증 번호 확인 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (existingUser) {
        return next(new HttpError("이미 가입된 유저이므로 이메일 인증 번호를 확인 할 수 없습니다.", 403));
    }

    // 해당 인증 번호 찾기
    let existingVerificationCode;
    try {
        existingVerificationCode = await VerificationCodeModel.findOne({email: email, code: code, verified: false});
    } catch (err) {
        return next(new HttpError("이메일 인증 번호 확인 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!existingVerificationCode) {
        return next(new HttpError("유효하지 않은 데이터이므로 이메일 인증 번호를 확인 할 수 없습니다.", 403));
    }

    // 해당 인증 번호의 createdAt과 지금 요청 시간 차이가 3분이 넘으면 에러 발생
    const now = dayjs();
    const codeCreatedAt = dayjs(existingVerificationCode.createdAt);

    if (now.diff(codeCreatedAt, 'minutes') > 3) {
        existingVerificationCode.deleteOne();
        return next(new HttpError("인증 번호가 만료되었습니다. 다시 시도해주세요.", 403));
    }

    existingVerificationCode.verified = true;
    await existingVerificationCode.save();

    return res.status(200).json({data: {message: "이메일 인증 번호 확인이 완료되었습니다"}});
};


// 리프레시 토큰을 이용한 액세스 토큰 재발급
const checkRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const {refreshToken, userId} = req.body;

    const isRefreshTokenValid = await jwtUtil.refreshVerify(refreshToken, userId);

    // 리프레시 토큰이 만료되거나 유효하지 않은 경우 에러 발생
    if (!isRefreshTokenValid) {
        console.log("리프레시 토큰이 만료되었거나 유효하지 않음")
        return res.status(404).json({data: {isRefreshTokenValid}});
    }

    let existingUser;
    try {
        existingUser = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("유저 정보 확인 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    if (!existingUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }

    const newAccessToken = jwtUtil.sign({
        _id: existingUser._id as Types.ObjectId,
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
        studentId: existingUser.studentId,
    });
    return res.status(200).json({data: {isRefreshTokenValid, accessToken: newAccessToken, refreshToken}});
};


// 유저 정보 수정
const updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {username, year, studentId, studio, tel} = req.body;

    // 유저 정보 업데이트
    let updatedUser;
    try {
        updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {username, year, studentId, studio, tel},
            {new: true},
        );
    } catch (err) {
        return next(new HttpError("유저 정보 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    // 해당 아이디의 유저가 없을 경우
    if (!updatedUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }

    // 성공 응답
    return res.status(200).json({message: "유저 정보가 변경되었습니다.", user: updatedUser});
};


// 비밀번호 변경
const updatePassword = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {password, newPassword} = req.body;

    // 유저 찾기
    let existingUser;
    try {
        existingUser = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("유저 비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    // 해당 유저가 없을 경우, 에러 발생
    if (!existingUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }

    // 요청 비밀번호와 암호화된 비밀번호 비교
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(new HttpError("비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    // 비밀번호가 안 맞을 경우, 오류 발생
    if (!isValidPassword) {
        return next(new HttpError("유효하지 않은 데이터이므로 비밀번호를 변경 할 수 없습니다.", 401));
    }

    // 새 비밀번호 암호화 및 저장
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(newPassword, 12);
        existingUser.password = hashedPassword;
        await existingUser.save();
    } catch (err) {
        return next(new HttpError("비밀번호 변경 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 새 비밀번호로 다시 로그인하기
    // JWT 토큰 생성
    try {
        const accessToken = jwt.sign({
            _id: existingUser._id as Types.ObjectId,
            email: existingUser.email,
            username: existingUser.username,
            role: existingUser.role,
            studentId: existingUser.studentId,
        });
        const [refreshToken] = await jwt.refresh(existingUser._id as mongoose.Types.ObjectId);

        // 결과 반환
        return res.status(200).json({
            data: {
                userId: existingUser._id,
                email: existingUser.email,
                username: existingUser.username,
                studentId: existingUser.studentId,
                year: existingUser.year,
                studio: existingUser.studio,
                passQuiz: existingUser.passQuiz,
                countOfLaserPerWeek: existingUser.countOfLaserPerWeek,
                countOfLaserPerDay: existingUser.countOfLaserPerDay,
                countOfWarning: existingUser.countOfWarning,
                tel: existingUser.tel,
                role: existingUser.role,
                lab: existingUser.lab,
                accessToken,
                refreshToken,
            }
        });
    } catch (err) {
        return next(new HttpError("비밀번호 변경 중 토큰 생성 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 비밀번호 찾기
const findPassword = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    const {username, email} = req.body;

    // 해당 이름과 이메일의 유저 찾기
    let existingUser;
    try {
        existingUser = await UserModel.findOne({username, email});
    } catch (err) {
        return next(new HttpError("비밀번호 찾기 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    // 유저 없을 경우, 에러 발생
    if (!existingUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();

    // 새 비밀번호 생성 및 암호화
    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    try {
        // 암호화 된 새 비밀번호 저장
        existingUser.password = hashedPassword;
        await existingUser.save({session: sess});

        // 이메일로 새 비밀번호 전송하기
        await sendEmail(email, "[HEAR] 새 비밀번호 발송", `<h1>안녕하세요 HEAR 입니다</h1><br/><p>새 비밀번호: <b>${newPassword}</b></p>`);
        await sess.commitTransaction();
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("비밀번호 찾기 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
    return res.status(200).json({data: {message: "새 비밀번호를 이메일로 전송하였습니다"}});
};


// 조교 역할 인수인계 하기
const handoverAssistant = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {targetUserId} = req.params;
    const {userId} = req.userData;

    // 요청한 대상(조교 또는 운영자) 조회
    let requestUser;
    try {
        requestUser = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("조교 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!requestUser || (requestUser.role !== "admin" && requestUser.role !== "manager")) {
        return next(new HttpError("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }

    // 인수인계 대상 조회
    let targetUser;
    try {
        targetUser = await UserModel.findById(targetUserId);
    } catch (err) {
        return next(new HttpError("인수인계 대상 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!targetUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }

    // 조교 역할 유저 모두 찾기
    let managers;
    try {
        managers = await UserModel.find({role: "manager"});
    } catch (err) {
        return next(new HttpError("조교 인수인계 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 세션을 이용한 트랜잭션 처리
    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        // 기존 조교 계정들 삭제
        if (managers.length > 0) {
            for (const manager of managers) {
                await manager.deleteOne({session: sess});
            }
        }
        if (targetUser.role !== "manager") {
            // 대상 유저의 역할 변경
            targetUser.role = "manager";
            await targetUser.save({session: sess});
        }
        await sess.commitTransaction();
        return res.status(200).json({data: {message: "조교 역할 인수인계가 완료되었습니다."}});
    } catch (err) {
        console.error("조교 인수인계 중 발생한 에러: ", err);
        await sess.abortTransaction();
        return next(new HttpError("조교 인수인계 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
};


// 조교와 운영자만 가능
// TODO 모든 경고 차감하기
const resetAllWarning = async (req: CustomRequest, res: Response, next: NextFunction) => {

};


// 조교와 운영자만 가능
// TODO 모든 유저 교육 미이수로 초기화하기
const resetAllQuiz = async (req: CustomRequest, res: Response, next: NextFunction) => {

};


// 경고 부과하기
const addWarning = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {userId} = req.params;
    const {countOfWarning, message} = req.body;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        const user = await UserModel.findById(userId).session(sess);
        if (!user) {
            return next(new HttpError("유효하지 않은 데이터이므로 경고 부과를 할 수 없습니다.", 403));
        }
        if (user.countOfWarning !== countOfWarning) {
            return next(new HttpError("유효하지 않은 데이터이므로 경고 부과를 할 수 없습니다.", 403));
        }
        if (typeof user.countOfWarning === "number") {
            user.countOfWarning++;
        }

        const warning = new WarningModel({
            userId: userId,
            message: message,
        });

        await warning.save({session: sess});
        await user.save({session: sess});
        await sess.commitTransaction();

        return res.status(200).json({data: {countOfWarning: user.countOfWarning}});
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("경고 부과 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
};


// 경고 차감하기
const minusWarning = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {userId} = req.params;
    const {countOfWarning} = req.body;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let user;
    try {
        user = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("경고 차감 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    if (!user) {
        return next(new HttpError("유효하지 않은 데이터이므로 경고 차감을 할 수 없습니다.", 403));
    }

    if (user.countOfWarning !== countOfWarning) {
        return next(new HttpError("유효하지 않은 데이터이므로 경고 차감을 할 수 없습니다.", 403));
    }

    if (typeof user.countOfWarning === "number") {
        user.countOfWarning--;
        await user.save();
        return res.status(200).json({data: {countOfWarning: user.countOfWarning}});
    }
};


// 교육 이수 처리하기
const passQuiz = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {userId} = req.params;
    const {passQuiz} = req.body;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let user;
    try {
        user = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("교육 이수 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    if (!user) {
        return next(new HttpError("유효하지 않은 데이터이므로 교육 이수 처리를 할 수 없습니다.", 403));
    }

    if (user.passQuiz !== passQuiz) {
        return next(new HttpError("유효하지 않은 데이터이므로 교육 이수 처리를 할 수 없습니다.", 403));
    }

    user.passQuiz = true;
    await user.save();

    return res.status(200).json({data: {passQuiz: user.passQuiz}});
};


// 교육 미이수 처리하기
const resetQuiz = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {userId} = req.params;
    const {passQuiz} = req.body;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }

    let user;
    try {
        user = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("교육 미이수 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    if (!user) {
        return next(new HttpError("유효하지 않은 데이터이므로 교육 미이수 처리를 할 수 없습니다.", 403));
    }

    if (user.passQuiz !== passQuiz) {
        return next(new HttpError("유효하지 않은 데이터이므로 교육 미이수 처리를 할 수 없습니다.", 403));
    }

    user.passQuiz = false;
    await user.save();

    return res.status(200).json({data: {passQuiz: user.passQuiz}});
};


// TODO 유저 탈퇴 - 작성한 문의, 피드백, 이용 내역, 예약 내역, 경고 내역
// 회원 탈퇴, 삭제하기
const deleteUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {targetUserId} = req.body;
    const {role, userId} = req.userData;

    let existingUser;
    try {
        existingUser = await UserModel.findById(targetUserId).populate(["RefreshToken", "Inquiry", "Feedback"]);
    } catch (err) {
        return next(new HttpError("회원 탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }

    if (!existingUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 회원 탈퇴 처리를 할 수 없습니다.", 403));
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();

    if (role === "manager" || role === "admin") {
        try {
            await existingUser.deleteOne({session: sess});
        } catch (err) {

        }
    } else if (role === "student") {

    }
};

export {
    getUser,
    getUserInfo,
    getUsers,
    getWarnings,
    getManager,
    checkEmail,
    signup,
    login,
    sendVerificationCode,
    verifyEmailCode,
    checkRefreshToken,
    updateUser,
    updatePassword,
    findPassword,
    handoverAssistant,
    addWarning,
    minusWarning,
    passQuiz,
    resetQuiz,
    resetAllWarning,
    resetAllQuiz,
    deleteUser,
};