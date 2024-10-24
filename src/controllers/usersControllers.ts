import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import bcrypt from "bcryptjs";
import mongoose, {Types} from "mongoose";

import {UserModel, WarningModel} from "../models/userModel";
import HttpError from "../models/errorModel";

import jwt from "../utils/jwtUtil";
import {CustomRequest} from "../middlewares/checkAuth";


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

// 유저 정보 수정
const updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {username, year, studentId, studio, tel} = req.body;
    const {userId} = req.userData;

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
    return res.status(200).json({message: "유저 정보가 수정되었습니다.", user: updatedUser});
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
// 유저 탈퇴하기
const deleteUser = async (req: CustomRequest, res: Response, next: NextFunction) => {

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
    updateUser,
    addWarning,
    minusWarning,
    passQuiz,
    resetQuiz,
    deleteUser
}