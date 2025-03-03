"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.deleteUser = exports.resetAllEducation = exports.resetAllWarning = exports.resetEducation = exports.passEducation = exports.minusWarning = exports.addWarning = exports.handoverAssistant = exports.findPassword = exports.updatePassword = exports.updateUser = exports.checkRefreshToken = exports.verifyEmailCode = exports.sendVerificationCode = exports.login = exports.signup = exports.checkEmail = exports.getAssistant = exports.getWarnings = exports.getUsers = exports.getUserInfo = exports.getUser = void 0;
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importStar(require("mongoose"));
const dayjs_1 = __importDefault(require("dayjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
const warningModel_1 = __importDefault(require("../models/warningModel"));
const verificationCodeModel_1 = __importDefault(require("../models/verificationCodeModel"));
const errorModel_1 = __importDefault(require("../models/errorModel"));
const jwtUtil_1 = __importDefault(require("../utils/jwtUtil"));
const jwtUtil_2 = __importDefault(require("../utils/jwtUtil"));
const isEmailValid_1 = __importDefault(require("../utils/isEmailValid"));
const generateRandomCode_1 = __importDefault(require("../utils/generateRandomCode"));
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const generatePassword_1 = __importDefault(require("../utils/generatePassword"));
// 유저의 내 정보 가져오기
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    // id로 유저 찾기
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 유저가 없을 경우, 오류 발생시키기
    if (!existingUser) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    return res.status(200).json({
        data: {
            userId: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            year: existingUser.year,
            studentId: existingUser.studentId,
            studio: existingUser.studio,
            passEducation: existingUser.passEducation,
            countOfLaserPerWeek: existingUser.countOfLaserPerWeek,
            countOfLaserPerDay: existingUser.countOfLaserPerDay,
            countOfWarning: existingUser.countOfWarning,
            tel: existingUser.tel,
            role: existingUser.role,
            lab: existingUser.lab,
        }
    });
});
exports.getUser = getUser;
// 특정 유저 정보 조회하기
const getUserInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { userId } = req.params;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("유저 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!existingUser) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    return res.status(200).json({
        data: {
            username: existingUser.username,
            email: existingUser.email,
            year: existingUser.year,
            studentId: existingUser.studentId,
            studio: existingUser.studio,
            passEducation: existingUser.passEducation,
            countOfWarning: existingUser.countOfWarning,
            tel: existingUser.tel,
        }
    });
});
exports.getUserInfo = getUserInfo;
// 유저 목록 조회하기
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { year, passEducation, countOfWarning, username } = req.query;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let filter = { role: "student" };
    if (year && typeof year === "string" && year !== "all") {
        const yearsFilter = year.split(",");
        filter.year = { $in: yearsFilter };
    }
    if (passEducation && typeof passEducation === "string" && passEducation !== "all") {
        const passEducationFilter = passEducation.split(",");
        filter.passEducation = { $in: passEducationFilter };
    }
    if (countOfWarning && typeof countOfWarning === "string" && countOfWarning !== "all") {
        const countOfWarningFilter = countOfWarning.split(",").map(warning => Number(warning));
        filter.countOfWarning = { $in: countOfWarningFilter };
    }
    if (username && typeof username === "string" && username.trim() !== "") {
        filter.username = { $regex: username, $options: "i" }; // $options: "i"는 insensitive 약자로 정규표현식에서 대소문자 구분하지 않도록 설정
    }
    let users;
    try {
        users = yield userModel_1.default
            .find(filter)
            .sort({ _id: -1 });
    }
    catch (err) {
        return next(new errorModel_1.default("유저 목록 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (users.length === 0) {
        return res.status(200).json({ data: [] });
    }
    else {
        return res.status(200).json({
            data: users.map((user) => ({
                userId: user._id,
                username: user.username,
                year: user.year,
                studentId: user.studentId,
                passEducation: user.passEducation,
                countOfWarning: user.countOfWarning,
            }))
        });
    }
});
exports.getUsers = getUsers;
// 유효한 이메일인지 확인하기
const checkEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    let user;
    try {
        user = yield userModel_1.default.findOne({ email });
    }
    catch (err) {
        return next(new errorModel_1.default("이메일 유효성 검사 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return res.status(200).json({ data: 200 });
    }
    return res.status(200).json({ data: 404 });
});
exports.checkEmail = checkEmail;
// 경고 목록 조회하기
const getWarnings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    let warnings;
    try {
        warnings = yield warningModel_1.default
            .find({ userId: userId })
            .sort({ createdAt: -1 });
    }
    catch (err) {
        return next(new errorModel_1.default("경고 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (warnings.length === 0) {
        return res.status(200).json({ data: [] });
    }
    const responseData = warnings.map((warning) => {
        return ({
            _id: warning._id,
            message: warning.message,
            date: warning.createdAt,
        });
    });
    return res.status(200).json({ data: responseData });
});
exports.getWarnings = getWarnings;
// 조교 정보 조회하기
const getAssistant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    let assistant;
    try {
        assistant = yield userModel_1.default.find({ role: "assistant" });
    }
    catch (err) {
        return next(new errorModel_1.default("조교 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (assistant.length === 0) {
        return next(new errorModel_1.default("조교 정보를 조회 할 수 없습니다.", 403));
    }
    return res.status(200).json({ data: { username: assistant[0].username, lab: assistant[0].lab } });
});
exports.getAssistant = getAssistant;
// 회원가입
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    const { username, email, password, year, studentId, studio, tel, code } = req.body;
    // 유효한 이메일인지 확인
    let verificationCode;
    try {
        verificationCode = yield verificationCodeModel_1.default.findOne({ email: email, code: code, verified: true });
    }
    catch (err) {
        return next(new errorModel_1.default("회원가입 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 인증되지 않은 이메일일 경우, 오류 발생
    if (!verificationCode) {
        return next(new errorModel_1.default("유효하지 않은 이메일입니다.", 422));
    }
    // 인증된 이메일인 경우, 해당 이메일의 인증 번호 내역 삭제하기
    let existingVerificationCode;
    try {
        existingVerificationCode = yield verificationCodeModel_1.default.find({ email: email });
    }
    catch (err) {
        return next(new errorModel_1.default("이메일 인증 번호를 전송 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (existingVerificationCode.length !== 0) {
        yield Promise.all(existingVerificationCode.map(code => code.deleteOne()));
    }
    // 동일 email 유저 확인
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findOne({ email });
    }
    catch (err) {
        return next(new errorModel_1.default("회원가입 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 동일한 email 유저 존재 시, 오류 발생
    if (existingUser) {
        return next(new errorModel_1.default("이미 가입이 되어있는 유저입니다.", 422));
    }
    // 비밀번호 암호화
    let hashedPassword;
    try {
        hashedPassword = yield bcryptjs_1.default.hash(password, 12);
    }
    catch (err) {
        return next(new errorModel_1.default("회원가입 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 유저 생성
    const createdUser = new userModel_1.default({
        username,
        email,
        password: hashedPassword,
        role: "student",
        passEducation: false,
        studio,
        year,
        tel,
        studentId,
        countOfWarning: 0,
        countOfLaserPerWeek: 4,
        countOfLaserPerDay: 2,
        refreshTokenId: new mongoose_1.default.Types.ObjectId(), // 임시 토큰 아이디
    });
    // 트랜잭션을 사용해 유저 및 리프레시 토큰 생성
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        // 유저 저장
        yield createdUser.save({ session: sess });
        const userId = createdUser._id;
        // 리프레시 토큰 생성 및 저장
        const [refreshToken, refreshTokenId] = yield jwtUtil_1.default.refresh(userId);
        // 생성된 리프레시 토큰의 _id를 유저의 refreshTokenId에 적용
        createdUser.refreshTokenId = refreshTokenId;
        yield createdUser.save({ session: sess });
        yield sess.commitTransaction();
        // JWT 액세스 토큰 생성
        const accessToken = jwtUtil_1.default.sign({
            _id: createdUser._id,
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
                passEducation: createdUser.passEducation,
                countOfLaserPerWeek: createdUser.countOfLaserPerWeek,
                countOfLaserPerDay: createdUser.countOfLaserPerDay,
                countOfWarning: createdUser.countOfWarning,
                tel: createdUser.tel,
                role: createdUser.role,
                accessToken,
                refreshToken,
            },
        });
    }
    catch (err) {
        yield sess.abortTransaction();
        return next(new errorModel_1.default("회원가입 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
});
exports.signup = signup;
// 로그인
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    const { email, password } = req.body;
    // email 로 유저 찾기
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findOne({ email });
    }
    catch (err) {
        return next(new errorModel_1.default("로그인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 유저 없을 경우, 오류 발생
    if (!existingUser) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 로그인 할 수 없습니다.", 403));
    }
    // 요청 비밀번호와 암호화된 비밀번호 비교
    let isValidPassword = false;
    try {
        isValidPassword = yield bcryptjs_1.default.compare(password, existingUser.password);
    }
    catch (err) {
        return next(new errorModel_1.default("로그인 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    // 비밀번호가 안 맞을 경우, 오류 발생
    if (!isValidPassword) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 로그인 할 수 없습니다.", 401));
    }
    // JWT 토큰 생성
    try {
        const accessToken = jwtUtil_1.default.sign({
            _id: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            role: existingUser.role,
            studentId: existingUser.studentId,
        });
        const [refreshToken] = yield jwtUtil_1.default.refresh(existingUser._id);
        // 결과 반환
        return res.status(200).json({
            data: {
                userId: existingUser._id,
                email: existingUser.email,
                username: existingUser.username,
                studentId: existingUser.studentId,
                year: existingUser.year,
                studio: existingUser.studio,
                passEducation: existingUser.passEducation,
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
    }
    catch (err) {
        return next(new errorModel_1.default("로그인 중 토큰 생성 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.login = login;
// 이메일 인증 번호 전송
const sendVerificationCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!(0, isEmailValid_1.default)(email)) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 이메일 인증 번호를 전송 할 수 없습니다.", 403));
    }
    // 이미 가입된 이메일인지 확인
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findOne({ email });
    }
    catch (err) {
        return next(new errorModel_1.default("이메일 인증 번호를 전송 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (existingUser) {
        return next(new errorModel_1.default("이미 가입된 유저이므로 이메일 인증 번호를 전송 할 수 없습니다.", 403));
    }
    // 요청 이메일로 전송된 인증 번호 내역이 있는지 확인
    let existingVerificationCode;
    try {
        existingVerificationCode = yield verificationCodeModel_1.default.find({ email: email });
    }
    catch (err) {
        return next(new errorModel_1.default("이메일 인증 번호를 전송 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 동일한 이메일로 요청한 인증 번호가 있을 경우, 삭제하기
    if (existingVerificationCode.length !== 0) {
        // await Promise.all 을 통해 모든 삭제 작업 완료 후, 다음 코드로 진행
        yield Promise.all(existingVerificationCode.map(code => code.deleteOne()));
    }
    // 인증 번호 생성
    const code = (0, generateRandomCode_1.default)();
    console.log("인증 번호: ", code);
    // 인증 번호 객체 모델 생성
    const verificationCode = new verificationCodeModel_1.default({
        email: email,
        code: code,
    });
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        // 인증 번호 서버 저장
        yield verificationCode.save({ session: sess });
        // 이메일로 인증 번호 전송하기
        yield (0, sendEmail_1.default)(email, "[HEAR] 인증 번호 발송", `<h1>안녕하세요 HEAR 입니다</h1><br/><p>인증 번호: <b>${code}</b></p>`);
        yield sess.commitTransaction();
    }
    catch (err) {
        yield sess.abortTransaction();
        return next(new errorModel_1.default("이메일 인증 번호를 전송 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
    return res.status(200).json({ data: { message: "인증 번호가 이메일로 전송되었습니다" } });
});
exports.sendVerificationCode = sendVerificationCode;
// 이메일 인증 번호 확인
const verifyEmailCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code } = req.body;
    if (!(0, isEmailValid_1.default)(email)) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 이메일 인증 번호를 확인 할 수 없습니다.", 403));
    }
    // 이미 가입된 이메일인지 확인
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findOne({ email });
    }
    catch (err) {
        return next(new errorModel_1.default("이메일 인증 번호 확인 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (existingUser) {
        return next(new errorModel_1.default("이미 가입된 유저이므로 이메일 인증 번호를 확인 할 수 없습니다.", 403));
    }
    // 해당 인증 번호 찾기
    let existingVerificationCode;
    try {
        existingVerificationCode = yield verificationCodeModel_1.default.findOne({ email: email, code: code, verified: false });
    }
    catch (err) {
        return next(new errorModel_1.default("이메일 인증 번호 확인 중 에러가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!existingVerificationCode) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 이메일 인증 번호를 확인 할 수 없습니다.", 403));
    }
    // 해당 인증 번호의 createdAt과 지금 요청 시간 차이가 3분이 넘으면 에러 발생
    const now = (0, dayjs_1.default)();
    const codeCreatedAt = (0, dayjs_1.default)(existingVerificationCode.createdAt);
    if (now.diff(codeCreatedAt, 'minutes') > 3) {
        existingVerificationCode.deleteOne();
        return next(new errorModel_1.default("인증 번호가 만료되었습니다. 다시 시도해주세요.", 403));
    }
    existingVerificationCode.verified = true;
    yield existingVerificationCode.save();
    return res.status(200).json({ data: { message: "이메일 인증 번호 확인이 완료되었습니다" } });
});
exports.verifyEmailCode = verifyEmailCode;
// 리프레시 토큰을 이용한 액세스 토큰 재발급
const checkRefreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken, userId } = req.body;
    const isRefreshTokenValid = yield jwtUtil_2.default.refreshVerify(refreshToken, userId);
    // 리프레시 토큰이 만료되거나 유효하지 않은 경우 에러 발생
    if (!isRefreshTokenValid) {
        console.log("리프레시 토큰이 만료되었거나 유효하지 않음");
        return res.status(404).json({ data: { isRefreshTokenValid } });
    }
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("유저 정보 확인 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    if (!existingUser) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    const newAccessToken = jwtUtil_2.default.sign({
        _id: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
        studentId: existingUser.studentId,
    });
    return res.status(200).json({ data: { isRefreshTokenValid, accessToken: newAccessToken, refreshToken } });
});
exports.checkRefreshToken = checkRefreshToken;
// 유저 정보 수정
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId, role } = req.userData;
    const { username, studentId, tel, lab } = req.body;
    if (role === "assistant" && !lab) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 정보를 변경 할 수 없습니다.", 403));
    }
    let updatedData;
    if (role === "student") {
        updatedData = { username, studentId, tel };
    }
    else if (role === "assistant") {
        updatedData = { username, studentId, tel, lab };
    }
    // 유저 정보 업데이트
    let updatedUser;
    try {
        updatedUser = yield userModel_1.default.findByIdAndUpdate(userId, updatedData, { new: true });
    }
    catch (err) {
        return next(new errorModel_1.default("유저 정보 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    // 해당 아이디의 유저가 없을 경우
    if (!updatedUser) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    // 성공 응답
    return res.status(200).json({ message: "유저 정보가 변경되었습니다.", user: updatedUser });
});
exports.updateUser = updateUser;
// 비밀번호 변경
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { password, newPassword } = req.body;
    // 유저 찾기
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("유저 비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    // 해당 유저가 없을 경우, 에러 발생
    if (!existingUser) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    // 요청 비밀번호와 암호화된 비밀번호 비교
    let isValidPassword = false;
    try {
        isValidPassword = yield bcryptjs_1.default.compare(password, existingUser.password);
    }
    catch (err) {
        return next(new errorModel_1.default("비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    // 비밀번호가 안 맞을 경우, 오류 발생
    if (!isValidPassword) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 비밀번호를 변경 할 수 없습니다.", 401));
    }
    // 새 비밀번호 암호화 및 저장
    let hashedPassword;
    try {
        hashedPassword = yield bcryptjs_1.default.hash(newPassword, 12);
        existingUser.password = hashedPassword;
        yield existingUser.save();
    }
    catch (err) {
        return next(new errorModel_1.default("비밀번호 변경 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 새 비밀번호로 다시 로그인하기
    // JWT 토큰 생성
    try {
        const accessToken = jwtUtil_1.default.sign({
            _id: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            role: existingUser.role,
            studentId: existingUser.studentId,
        });
        const [refreshToken] = yield jwtUtil_1.default.refresh(existingUser._id);
        // 결과 반환
        return res.status(200).json({
            data: {
                userId: existingUser._id,
                email: existingUser.email,
                username: existingUser.username,
                studentId: existingUser.studentId,
                year: existingUser.year,
                studio: existingUser.studio,
                passEducation: existingUser.passEducation,
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
    }
    catch (err) {
        return next(new errorModel_1.default("비밀번호 변경 중 토큰 생성 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.updatePassword = updatePassword;
// 비밀번호 찾기
const findPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    const { username, email } = req.body;
    // 해당 이름과 이메일의 유저 찾기
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findOne({ username, email });
    }
    catch (err) {
        return next(new errorModel_1.default("비밀번호 찾기 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    // 유저 없을 경우, 에러 발생
    if (!existingUser) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    // 새 비밀번호 생성 및 암호화
    const newPassword = (0, generatePassword_1.default)();
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 12);
    try {
        // 암호화 된 새 비밀번호 저장
        existingUser.password = hashedPassword;
        yield existingUser.save({ session: sess });
        // 이메일로 새 비밀번호 전송하기
        yield (0, sendEmail_1.default)(email, "[HEAR] 새 비밀번호 발송", `<h1>안녕하세요 HEAR 입니다</h1><br/><p>새 비밀번호: <b>${newPassword}</b></p>`);
        yield sess.commitTransaction();
    }
    catch (err) {
        yield sess.abortTransaction();
        return next(new errorModel_1.default("비밀번호 찾기 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
    return res.status(200).json({ data: { message: "새 비밀번호를 이메일로 전송하였습니다" } });
});
exports.findPassword = findPassword;
// 조교 역할 인수인계 하기
const handoverAssistant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { targetUserId } = req.params;
    const { userId } = req.userData;
    // 요청한 대상(조교 또는 운영자) 조회
    let requestUser;
    try {
        requestUser = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("조교 정보 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!requestUser || (requestUser.role !== "admin" && requestUser.role !== "assistant")) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    // 인수인계 대상 조회
    let targetUser;
    try {
        targetUser = yield userModel_1.default.findById(targetUserId);
    }
    catch (err) {
        return next(new errorModel_1.default("인수인계 대상 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!targetUser) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저 조회를 할 수 없습니다.", 403));
    }
    // 조교 역할 유저 모두 찾기
    let assistants;
    try {
        assistants = yield userModel_1.default.find({ role: "assistant" });
    }
    catch (err) {
        return next(new errorModel_1.default("조교 인수인계 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 세션을 이용한 트랜잭션 처리
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        // 기존 조교 계정들 삭제
        if (assistants.length > 0) {
            for (const assistant of assistants) {
                yield assistant.deleteOne({ session: sess });
            }
        }
        if (targetUser.role !== "assistant") {
            // 대상 유저의 역할 변경
            targetUser.role = "assistant";
            yield targetUser.save({ session: sess });
        }
        yield sess.commitTransaction();
        return res.status(200).json({ data: { message: "조교 역할 인수인계가 완료되었습니다." } });
    }
    catch (err) {
        console.error("조교 인수인계 중 발생한 에러: ", err);
        yield sess.abortTransaction();
        return next(new errorModel_1.default("조교 인수인계 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
});
exports.handoverAssistant = handoverAssistant;
// 모든 경고 차감하기
const resetAllWarning = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저들의 경고를 초기화 할 수 없습니다.", 403));
    }
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        const users = yield userModel_1.default.find().session(sess);
        // bulkWrite 로 수행할 배치 작업 묶음 생성
        const bulkOperations = users.map((user) => {
            return {
                updateOne: {
                    filter: { _id: user._id },
                    update: { $set: { countOfWarning: 0 } },
                },
            };
        });
        if (bulkOperations.length > 0) {
            yield userModel_1.default.bulkWrite(bulkOperations, { session: sess }); // bulkWrite 사용 시, 여러 작업을 효율적으로 한 번에 작업을 처리할 수 있음
        }
        yield sess.commitTransaction();
        return res.status(200).json({ data: { message: "모든 유저의 경고 수가 초기화 되었습니다." } });
    }
    catch (err) {
        yield sess.abortTransaction();
        return next(new errorModel_1.default("모든 경고 초기화 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
});
exports.resetAllWarning = resetAllWarning;
// 모든 유저 교육 미이수로 초기화하기
const resetAllEducation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 유저들의 교육 이수를 초기화 할 수 없습니다.", 403));
    }
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        const users = yield userModel_1.default.find().session(sess);
        const bulkOperations = users.map((user) => {
            return {
                updateOne: {
                    filter: { _id: user._id },
                    update: { $set: { passEducation: false } },
                },
            };
        });
        if (bulkOperations.length > 0) {
            yield userModel_1.default.bulkWrite(bulkOperations, { session: sess });
        }
        yield sess.commitTransaction();
        return res.status(200).json({ data: { message: "모든 유저의 교육 이수 여부가 초기화 되었습니다." } });
    }
    catch (err) {
        yield sess.abortTransaction();
        return next(new errorModel_1.default("모든 유저의 교육 이수 여부 초기화 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
});
exports.resetAllEducation = resetAllEducation;
// 경고 부과하기
const addWarning = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { userId } = req.params;
    const { countOfWarning, message } = req.body;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        const user = yield userModel_1.default.findById(userId).session(sess);
        if (!user) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 경고 부과를 할 수 없습니다.", 403));
        }
        if (user.countOfWarning !== countOfWarning) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 경고 부과를 할 수 없습니다.", 403));
        }
        if (typeof user.countOfWarning === "number") {
            user.countOfWarning++;
        }
        const warning = new warningModel_1.default({
            userId: userId,
            message: message,
        });
        yield warning.save({ session: sess });
        yield user.save({ session: sess });
        yield sess.commitTransaction();
        return res.status(200).json({ data: { countOfWarning: user.countOfWarning } });
    }
    catch (err) {
        yield sess.abortTransaction();
        return next(new errorModel_1.default("경고 부과 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
});
exports.addWarning = addWarning;
// 경고 차감하기
const minusWarning = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { userId } = req.params;
    const { countOfWarning } = req.body;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("경고 차감 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 경고 차감을 할 수 없습니다.", 403));
    }
    if (user.countOfWarning !== countOfWarning) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 경고 차감을 할 수 없습니다.", 403));
    }
    if (typeof user.countOfWarning === "number") {
        user.countOfWarning--;
        yield user.save();
        return res.status(200).json({ data: { countOfWarning: user.countOfWarning } });
    }
});
exports.minusWarning = minusWarning;
// 교육 이수 처리하기
const passEducation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { userId } = req.params;
    const { passEducation } = req.body;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("교육 이수 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 교육 이수 처리를 할 수 없습니다.", 403));
    }
    if (user.passEducation !== passEducation) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 교육 이수 처리를 할 수 없습니다.", 403));
    }
    user.passEducation = true;
    yield user.save();
    return res.status(200).json({ data: { passEducation: user.passEducation } });
});
exports.passEducation = passEducation;
// 교육 미이수 처리하기
const resetEducation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { userId } = req.params;
    const { passEducation } = req.body;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 요청을 처리 할 수 없습니다.", 403));
    }
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("교육 미이수 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 교육 미이수 처리를 할 수 없습니다.", 403));
    }
    if (user.passEducation !== passEducation) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 교육 미이수 처리를 할 수 없습니다.", 403));
    }
    user.passEducation = false;
    yield user.save();
    return res.status(200).json({ data: { passEducation: user.passEducation } });
});
exports.resetEducation = resetEducation;
// TODO 유저 탈퇴 - 작성한 문의, 피드백, 이용 내역, 예약 내역, 경고 내역 -> 경고 내역...보관할 필요있음...
// 회원 탈퇴, 삭제하기
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { targetUserId } = req.params;
    const { role, userId } = req.userData;
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    // `targetUserId`가 유효한 `ObjectId` 형식인지 확인
    if (!targetUserId || !mongoose_1.Types.ObjectId.isValid(targetUserId)) {
        return next(new errorModel_1.default("유효하지 않은 사용자 ID입니다.", 400));
    }
    try {
        const existingUser = yield userModel_1.default
            .findById(targetUserId)
            .session(sess);
        if (!existingUser) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 회원 탈퇴 처리를 할 수 없습니다.", 403));
        }
        // 조교 또는 운영자일 경우, 바로 삭제
        if (role === "assistant" || role === "admin") {
            yield existingUser.deleteOne({ session: sess });
        }
        else {
            // 학생일 경우, 본인인 경우에 삭제
            if (existingUser._id.toString() !== userId.toString()) {
                return next(new errorModel_1.default("유효하지 않은 데이터이므로 회원 탈퇴 처리를 할 수 없습니다.", 403));
            }
            else {
                yield existingUser.deleteOne({ session: sess });
            }
        }
        yield sess.commitTransaction();
        return res.status(200).json({ data: { deletedUserId: existingUser._id } });
    }
    catch (err) {
        console.log("에러: ", err);
        yield sess.abortTransaction();
        return next(new errorModel_1.default("회원 탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
});
exports.deleteUser = deleteUser;
