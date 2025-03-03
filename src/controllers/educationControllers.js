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
exports.settingCutOffPoint = exports.settingDate = exports.implementationEducation = exports.saveQuestions = exports.checkEducation = exports.getUserEducationResult = exports.getUserEducationStatus = exports.getQuestions = exports.getSettings = exports.getQuestionsAndSettings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dayjs_1 = __importDefault(require("dayjs"));
const express_validator_1 = require("express-validator");
const errorModel_1 = __importDefault(require("../models/errorModel"));
const educationModel_1 = require("../models/educationModel");
const userModel_1 = __importDefault(require("../models/userModel"));
// 교육 문제 및 설정 조회
const getQuestionsAndSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("조교만 문제 조회가 가능합니다.", 403));
    }
    let questions;
    let settings;
    try {
        questions = yield educationModel_1.QuestionModel.find();
        settings = yield educationModel_1.EducationSettingsModel.find();
        return res.status(200).json({ data: { message: "교육 문제 조회 성공", questions: questions, settings: settings[0] } });
    }
    catch (err) {
        return next(new errorModel_1.default("교육 문제 및 설정 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.getQuestionsAndSettings = getQuestionsAndSettings;
// 교육 설정 조회
const getSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    let settings;
    try {
        settings = yield educationModel_1.EducationSettingsModel.find();
        return res.status(200).json({
            data: {
                startDate: settings[0].startDate,
                endDate: settings[0].endDate,
                status: settings[0].status,
                cutOffPoint: settings[0].cutOffPoint,
            }
        });
    }
    catch (err) {
        return next(new errorModel_1.default("교육 설정 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.getSettings = getSettings;
// 문제 조회
const getQuestions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    let settings;
    try {
        settings = yield educationModel_1.EducationSettingsModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("문제 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    const { startDate, endDate, status } = settings[0];
    const currentDate = new Date();
    // 현재 교육 게시 중인지 확인
    if (!status) {
        return next(new errorModel_1.default("현재 문제를 조회 할 수 없습니다.", 500));
    }
    const start = (0, dayjs_1.default)(startDate, "YYYY-MM-DD");
    const end = (0, dayjs_1.default)(endDate, "YYYY-MM-DD");
    const now = (0, dayjs_1.default)(currentDate, "YYYY-MM-DD");
    // 시작일과 종료일이 있는지 확인하고, 현재 날짜가 범위 내에 있는지 확인
    if (!startDate || !endDate || now.isBefore(start) || now.isAfter(end)) {
        return next(new errorModel_1.default("현재 문제를 조회 할 수 없습니다.", 500));
    }
    // 이미 테스트를 완료한 학생이 요청했는지 확인
    let educationResult;
    try {
        educationResult = yield educationModel_1.EducationResultModel.find({ userId: userId });
    }
    catch (err) {
        return next(new errorModel_1.default("문제 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (educationResult.length !== 0) {
        return next(new errorModel_1.default("이미 테스트를 제출하였습니다.", 500));
    }
    let questions;
    try {
        questions = yield educationModel_1.QuestionModel.find();
        const processedQuestions = questions.map((q) => {
            if (q.questionType === "shortAnswer") {
                return {
                    _id: q._id,
                    questionType: q.questionType,
                    question: q.question,
                    explanation: q.explanation,
                };
            }
            else if (q.questionType === "singleChoice" || q.questionType === "multipleChoice") {
                return {
                    _id: q._id,
                    questionType: q.questionType,
                    question: q.question,
                    explanation: q.explanation,
                    options: q.options.map((opt) => {
                        return {
                            optionId: opt.optionId,
                            content: opt.content,
                        };
                    }),
                };
            }
        });
        return res.status(200).json({ data: { questions: processedQuestions } });
    }
    catch (err) {
        return next(new errorModel_1.default("교육 설정 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.getQuestions = getQuestions;
// 유저의 테스트 응시 가능 여부 확인 조회
const getUserEducationStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId, role } = req.userData;
    if (role === "assistant") {
        return next(new errorModel_1.default("학생만 문제 응시가 가능합니다.", 403));
    }
    let settings;
    try {
        settings = yield educationModel_1.EducationSettingsModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("테스트 응시 가능 여부 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    const { startDate, endDate, status } = settings[0];
    const currentDate = new Date();
    // 현재 교육 게시 중인지 확인
    if (!status) {
        return next(new errorModel_1.default("현재 문제를 조회 할 수 없습니다.", 500));
    }
    const start = (0, dayjs_1.default)(startDate, "YYYY-MM-DD");
    const end = (0, dayjs_1.default)(endDate, "YYYY-MM-DD").add(1, 'day');
    const now = (0, dayjs_1.default)(currentDate, "YYYY-MM-DD");
    // 시작일과 종료일이 있는지 확인하고, 현재 날짜가 범위 내에 있는지 확인
    if (!startDate || !endDate || now.isBefore(start) || now.isAfter(end)) {
        return next(new errorModel_1.default("현재 문제를 조회 할 수 없습니다.", 500));
    }
    // 이미 테스트를 완료한 학생이 요청했는지 확인
    let educationResult;
    try {
        educationResult = yield educationModel_1.EducationResultModel.find({ userId: userId });
    }
    catch (err) {
        return next(new errorModel_1.default("테스트 응시 가능 여부 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (educationResult.length !== 0) {
        return next(new errorModel_1.default("이미 테스트를 제출하였습니다.", 500));
    }
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("테스트 응시 가능 여부 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    // 유저가 존재하지 않으면 에러 전달
    if (!existingUser) {
        return next(new errorModel_1.default("유효하지 않은 데이터입니다.", 500));
    }
    // 유저가 테스트를 이수했으면 에러 전달
    if (existingUser.passEducation) {
        return next(new errorModel_1.default("이미 테스트를 이수하였습니다.", 500));
    }
    return res.status(200).json({ data: { message: "테스트 응시가 가능합니다." } });
});
exports.getUserEducationStatus = getUserEducationStatus;
// 유저의 테스트 결과 확인
const getUserEducationResult = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("테스트 결과 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!existingUser) {
        return next(new errorModel_1.default("유효하지 않은 유저 데이터입니다.", 500));
    }
    let educationResult;
    try {
        educationResult = yield educationModel_1.EducationResultModel.find({ userId: userId });
    }
    catch (err) {
        return next(new errorModel_1.default("테스트 결과 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (educationResult.length === 0) {
        return next(new errorModel_1.default("유저의 테스트 결과가 존재하지 않습니다.", 500));
    }
    const questions = yield Promise.all(educationResult[0].questions.map((q) => __awaiter(void 0, void 0, void 0, function* () {
        const targetQuestion = yield educationModel_1.QuestionModel.findById(q.questionId);
        if (targetQuestion) {
            const question = targetQuestion.question;
            const explanation = targetQuestion.explanation;
            const questionType = targetQuestion.questionType;
            switch (questionType) {
                case "shortAnswer":
                    return {
                        question: question,
                        explanation: explanation,
                        questionType: questionType,
                        answer: targetQuestion.answer.trim(),
                        myAnswer: q.myAnswer.trim(),
                        isCorrect: q.isCorrect,
                    };
                case "singleChoice":
                    return {
                        question: question,
                        explanation: explanation,
                        questionType: questionType,
                        options: targetQuestion.options.map((opt) => {
                            return {
                                content: opt.content,
                                isAnswer: opt.isAnswer,
                                isChecked: opt.optionId.toString() === q.myAnswer.toString(),
                            };
                        }),
                        isCorrect: q.isCorrect,
                    };
                case "multipleChoice":
                    return {
                        question: question,
                        explanation: explanation,
                        questionType: questionType,
                        options: targetQuestion.options.map((opt) => {
                            return {
                                content: opt.content,
                                isAnswer: opt.isAnswer,
                                isChecked: q.myAnswer.includes(opt.optionId.toString()),
                            };
                        }),
                        isCorrect: q.isCorrect,
                    };
                default:
                    return null;
            }
        }
        return null;
    })));
    const responseData = {
        isPassed: educationResult[0].isPassed,
        questions: questions,
    };
    return res.status(200).json({ data: responseData });
});
exports.getUserEducationResult = getUserEducationResult;
// 문제 제출
const checkEducation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId, role } = req.userData;
    const { year, studio } = req.body;
    const educationAnswers = req.body.educationAnswers;
    if (role === "assistant") {
        return next(new errorModel_1.default("조교는 문제를 제출 할 수 없습니다.", 500));
    }
    if (!year || !studio) {
        return next(new errorModel_1.default("학년 및 스튜디오 정보가 필요합니다.", 500));
    }
    let settings;
    try {
        settings = yield educationModel_1.EducationSettingsModel.find();
    }
    catch (err) {
        return next(new errorModel_1.default("테스트 응시 가능 여부 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    const { startDate, endDate, status, cutOffPoint } = settings[0];
    const currentDate = new Date();
    // 현재 교육 게시 중인지 확인
    if (!status) {
        return next(new errorModel_1.default("현재 문제를 제출 할 수 없습니다.", 500));
    }
    const start = (0, dayjs_1.default)(startDate, "YYYY-MM-DD");
    const end = (0, dayjs_1.default)(endDate, "YYYY-MM-DD");
    const now = (0, dayjs_1.default)(currentDate, "YYYY-MM-DD");
    // 시작일과 종료일이 있는지 확인하고, 현재 날짜가 범위 내에 있는지 확인
    if (!startDate || !endDate || now.isBefore(start) || now.isAfter(end)) {
        return next(new errorModel_1.default("현재 문제를 조회 할 수 없습니다.", 500));
    }
    // 이미 테스트를 완료한 학생이 요청했는지 확인
    let educationResult;
    try {
        educationResult = yield educationModel_1.EducationResultModel.find({ userId: userId });
    }
    catch (err) {
        return next(new errorModel_1.default("문제 제출 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (educationResult.length !== 0) {
        return next(new errorModel_1.default("이미 테스트를 제출하였습니다.", 500));
    }
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        // 틀린 문제 개수 카운팅
        let countOfWrong = 0;
        // 테스트 결과 모델 객체 생성
        let educationResult = new educationModel_1.EducationResultModel({
            userId: userId,
            questions: [],
            isPassed: false,
        });
        const questions = yield educationModel_1.QuestionModel.find();
        // 제출한 답을 순회하면서 답안 검사하기
        for (let [questionId, myAnswer] of Object.entries(educationAnswers)) {
            const targetIndex = questions.findIndex(q => q._id.toString() === questionId.toString());
            if (targetIndex === -1) {
                return next(new errorModel_1.default("유효하지 않은 데이터이므로 문제를 제출 할 수 없습니다.", 400));
            }
            const questionType = questions[targetIndex].questionType;
            let questionResult = {
                questionId: new mongoose_1.default.Types.ObjectId(questionId),
                myAnswer,
                isCorrect: false,
            };
            switch (questionType) {
                case "shortAnswer":
                    if (typeof myAnswer === "string" && questions[targetIndex].answer.trim() === myAnswer.trim()) {
                        questionResult["isCorrect"] = true;
                    }
                    else {
                        countOfWrong++;
                    }
                    educationResult.questions.push(questionResult);
                    break;
                case "singleChoice":
                    const singleChoiceAnswer = (_a = questions[targetIndex].options
                        .filter((opt) => opt.isAnswer)[0]) === null || _a === void 0 ? void 0 : _a.optionId;
                    if (singleChoiceAnswer === myAnswer) {
                        questionResult["isCorrect"] = true;
                    }
                    else {
                        countOfWrong++;
                    }
                    educationResult.questions.push(questionResult);
                    break;
                case "multipleChoice":
                    const multipleChoiceAnswer = questions[targetIndex].options
                        .filter((opt) => opt.isAnswer)
                        .map(a => a.optionId);
                    if ((Array.isArray(myAnswer) && myAnswer.length === multipleChoiceAnswer.length)) {
                        const setA = new Set(myAnswer);
                        const setB = new Set(multipleChoiceAnswer);
                        if ([...setA].every(value => setB.has(value))) {
                            questionResult["isCorrect"] = true;
                        }
                        else {
                            countOfWrong++;
                        }
                    }
                    else {
                        countOfWrong++;
                    }
                    educationResult.questions.push(questionResult);
                    break;
                default:
                    break;
            }
        }
        const existingUser = yield userModel_1.default.findById(userId).session(sess);
        // 유저가 없을 경우, 에러 발생
        if (!existingUser) {
            yield sess.abortTransaction();
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 문제를 제출 할 수 없습니다.", 403));
        }
        // 유저의 학년 및 스튜디오 수정
        existingUser.year = year;
        existingUser.studio = studio;
        // 커트라인 개수 이하로 틀린 경우, 유저의 교육 이수 여부를 통과로 처리하기
        existingUser.passEducation = countOfWrong <= cutOffPoint;
        educationResult.isPassed = countOfWrong <= cutOffPoint;
        yield educationResult.save({ session: sess });
        yield existingUser.save({ session: sess });
        yield sess.commitTransaction();
        return res.status(200).json({ data: { message: "문제 제출 및 검사가 완료되었습니다." } });
    }
    catch (err) {
        console.log("문제 제출 에러: ", err);
        yield sess.abortTransaction();
        return next(new errorModel_1.default("문제 제출 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
});
exports.checkEducation = checkEducation;
// 교육 문제 저장
const saveQuestions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { questions } = req.body;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("조교만 문제 저장이 가능합니다.", 403));
    }
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        // 기존 문제 내역 삭제하기
        yield educationModel_1.QuestionModel.deleteMany({}, { session: sess });
        // 새 문제 내역 저장하기
        const createdQuestions = questions.map((q) => {
            const questionData = {
                questionType: q.questionType,
                question: q.question,
                explanation: q.explanation,
            };
            if (q.questionType === "shortAnswer") {
                return Object.assign(Object.assign({}, questionData), { answer: q.answer });
            }
            if (q.questionType === "singleChoice" || q.questionType === "multipleChoice") {
                return Object.assign(Object.assign({}, questionData), { options: q.options });
            }
            return next(new errorModel_1.default("지원하지 않는 문제 유형입니다.", 400));
        });
        const savedQuestions = yield educationModel_1.QuestionModel.insertMany(createdQuestions, { session: sess });
        yield sess.commitTransaction();
        return res.status(200).json({ data: savedQuestions });
    }
    catch (err) {
        yield sess.abortTransaction();
        return next(new errorModel_1.default("교육 문제 저장 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
});
exports.saveQuestions = saveQuestions;
// 교육 게시 또는 비게시
const implementationEducation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("조교만 교육 게시가 가능합니다.", 403));
    }
    try {
        const settings = yield educationModel_1.EducationSettingsModel.find();
        settings[0].status = !settings[0].status;
        settings[0].save();
        return res.status(200).json({ data: settings[0].status });
    }
    catch (err) {
        return next(new errorModel_1.default("교육 문제 저장 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.implementationEducation = implementationEducation;
// 교육 날짜 설정
const settingDate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { startDate, endDate } = req.body;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("조교만 교육 날짜 설정이 가능합니다.", 403));
    }
    try {
        const settings = yield educationModel_1.EducationSettingsModel.find();
        settings[0].startDate = startDate;
        settings[0].endDate = endDate;
        settings[0].save();
        return res.status(200).json({ data: { startDate: settings[0].startDate, endDate: settings[0].endDate } });
    }
    catch (err) {
        return next(new errorModel_1.default("교육 날짜 설정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.settingDate = settingDate;
// 교육 커트라인 문제 개수 설정
const settingCutOffPoint = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { cutOffPoint } = req.body;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("조교만 커트라인 문제 개수 설정이 가능합니다.", 403));
    }
    if (typeof cutOffPoint !== "number" || cutOffPoint === 0 || cutOffPoint > 9) {
        return next(new errorModel_1.default("유효한 데이터 형식이 아닙니다.", 403));
    }
    try {
        const settings = yield educationModel_1.EducationSettingsModel.find();
        settings[0].cutOffPoint = cutOffPoint;
        settings[0].save();
        return res.status(200).json({ data: settings[0].cutOffPoint });
    }
    catch (err) {
        return next(new errorModel_1.default("커트라인 문제 개수 설정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.settingCutOffPoint = settingCutOffPoint;
