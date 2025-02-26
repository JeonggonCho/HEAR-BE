import {NextFunction, Response} from "express";
import mongoose from "mongoose";
import dayjs from "dayjs";
import {validationResult} from "express-validator";
import {CustomRequest} from "../middlewares/checkAuth";
import HttpError from "../models/errorModel";
import {EducationResultModel, EducationSettingsModel, EducationType, QuestionModel} from "../models/educationModel";
import UserModel from "../models/userModel";


// 교육 문제 및 설정 조회
const getQuestionsAndSettings = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "assistant" && role !== "admin") {
        return next(new HttpError("조교만 문제 조회가 가능합니다.", 403));
    }

    let questions;
    let settings;
    try {
        questions = await QuestionModel.find();
        settings = await EducationSettingsModel.find();
        return res.status(200).json({data: {message: "교육 문제 조회 성공", questions: questions, settings: settings[0]}});
    } catch (err) {
        return next(new HttpError("교육 문제 및 설정 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 교육 설정 조회
const getSettings = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    let settings;
    try {
        settings = await EducationSettingsModel.find();
        return res.status(200).json({
            data: {
                startDate: settings[0].startDate,
                endDate: settings[0].endDate,
                status: settings[0].status,
                cutOffPoint: settings[0].cutOffPoint,
            }
        });
    } catch (err) {
        return next(new HttpError("교육 설정 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 문제 조회
const getQuestions = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;

    let settings;
    try {
        settings = await EducationSettingsModel.find();
    } catch (err) {
        return next(new HttpError("문제 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    const {startDate, endDate, status} = settings[0];
    const currentDate = new Date();

    // 현재 교육 게시 중인지 확인
    if (!status) {
        return next(new HttpError("현재 문제를 조회 할 수 없습니다.", 500));
    }

    const start = dayjs(startDate, "YYYY-MM-DD");
    const end = dayjs(endDate, "YYYY-MM-DD");
    const now = dayjs(currentDate, "YYYY-MM-DD");

    // 시작일과 종료일이 있는지 확인하고, 현재 날짜가 범위 내에 있는지 확인
    if (!startDate || !endDate || now.isBefore(start) || now.isAfter(end)) {
        return next(new HttpError("현재 문제를 조회 할 수 없습니다.", 500));
    }

    // 이미 테스트를 완료한 학생이 요청했는지 확인
    let educationResult;
    try {
        educationResult = await EducationResultModel.find({userId: userId});
    } catch (err) {
        return next(new HttpError("문제 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (educationResult.length !== 0) {
        return next(new HttpError("이미 테스트를 제출하였습니다.", 500));
    }

    let questions;
    try {
        questions = await QuestionModel.find();
        const processedQuestions = questions.map((q) => {
            if (q.questionType === "shortAnswer") {
                return {
                    _id: q._id,
                    questionType: q.questionType,
                    question: q.question,
                    explanation: q.explanation,
                };
            } else if (q.questionType === "singleChoice" || q.questionType === "multipleChoice") {
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
        return res.status(200).json({data: {questions: processedQuestions}});
    } catch (err) {
        return next(new HttpError("교육 설정 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 유저의 테스트 응시 가능 여부 확인 조회
const getUserEducationStatus = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId, role} = req.userData;

    if (role === "assistant") {
        return next(new HttpError("학생만 문제 응시가 가능합니다.", 403));
    }

    let settings;
    try {
        settings = await EducationSettingsModel.find();
    } catch (err) {
        return next(new HttpError("테스트 응시 가능 여부 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    const {startDate, endDate, status} = settings[0];
    const currentDate = new Date();

    // 현재 교육 게시 중인지 확인
    if (!status) {
        return next(new HttpError("현재 문제를 조회 할 수 없습니다.", 500));
    }

    const start = dayjs(startDate, "YYYY-MM-DD");
    const end = dayjs(endDate, "YYYY-MM-DD").add(1, 'day');
    const now = dayjs(currentDate, "YYYY-MM-DD");

    // 시작일과 종료일이 있는지 확인하고, 현재 날짜가 범위 내에 있는지 확인
    if (!startDate || !endDate || now.isBefore(start) || now.isAfter(end)) {
        return next(new HttpError("현재 문제를 조회 할 수 없습니다.", 500));
    }

    // 이미 테스트를 완료한 학생이 요청했는지 확인
    let educationResult;
    try {
        educationResult = await EducationResultModel.find({userId: userId});
    } catch (err) {
        return next(new HttpError("테스트 응시 가능 여부 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (educationResult.length !== 0) {
        return next(new HttpError("이미 테스트를 제출하였습니다.", 500));
    }

    let existingUser;
    try {
        existingUser = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("테스트 응시 가능 여부 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 유저가 존재하지 않으면 에러 전달
    if (!existingUser) {
        return next(new HttpError("유효하지 않은 데이터입니다.", 500));
    }

    // 유저가 테스트를 이수했으면 에러 전달
    if (existingUser.passEducation) {
        return next(new HttpError("이미 테스트를 이수하였습니다.", 500));
    }

    return res.status(200).json({data: {message: "테스트 응시가 가능합니다."}});
};


// 유저의 테스트 결과 확인
const getUserEducationResult = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;

    let existingUser;
    try {
        existingUser = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("테스트 결과 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!existingUser) {
        return next(new HttpError("유효하지 않은 유저 데이터입니다.", 500));
    }

    let educationResult;
    try {
        educationResult = await EducationResultModel.find({userId: userId});
    } catch (err) {
        return next(new HttpError("테스트 결과 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (educationResult.length === 0) {
        return next(new HttpError("유저의 테스트 결과가 존재하지 않습니다.", 500));
    }

    const questions = await Promise.all(
        educationResult[0].questions.map(async (q) => {
            const targetQuestion = await QuestionModel.findById(q.questionId);
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
                            myAnswer: (q.myAnswer as string).trim(),
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
                                    isChecked: opt.optionId.toString() === (q.myAnswer as string).toString(),
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
                                    isChecked: (q.myAnswer as string[]).includes(opt.optionId.toString()),
                                };
                            }),
                            isCorrect: q.isCorrect,
                        };
                    default:
                        return null;
                }
            }
            return null;
        })
    );

    const responseData = {
        isPassed: educationResult[0].isPassed,
        questions: questions,
    };

    return res.status(200).json({data: responseData});
};


// 문제 제출
const checkEducation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId, role} = req.userData;
    const {year, studio} = req.body;
    const educationAnswers: { [key: string]: undefined | string | string[] } = req.body.educationAnswers;


    if (role === "assistant") {
        return next(new HttpError("조교는 문제를 제출 할 수 없습니다.", 500));
    }

    if (!year || !studio) {
        return next(new HttpError("학년 및 스튜디오 정보가 필요합니다.", 500));
    }

    let settings;
    try {
        settings = await EducationSettingsModel.find();
    } catch (err) {
        return next(new HttpError("테스트 응시 가능 여부 확인 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    const {startDate, endDate, status, cutOffPoint} = settings[0];
    const currentDate = new Date();

    // 현재 교육 게시 중인지 확인
    if (!status) {
        return next(new HttpError("현재 문제를 제출 할 수 없습니다.", 500));
    }

    const start = dayjs(startDate, "YYYY-MM-DD");
    const end = dayjs(endDate, "YYYY-MM-DD");
    const now = dayjs(currentDate, "YYYY-MM-DD");

    // 시작일과 종료일이 있는지 확인하고, 현재 날짜가 범위 내에 있는지 확인
    if (!startDate || !endDate || now.isBefore(start) || now.isAfter(end)) {
        return next(new HttpError("현재 문제를 조회 할 수 없습니다.", 500));
    }

    // 이미 테스트를 완료한 학생이 요청했는지 확인
    let educationResult;
    try {
        educationResult = await EducationResultModel.find({userId: userId});
    } catch (err) {
        return next(new HttpError("문제 제출 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (educationResult.length !== 0) {
        return next(new HttpError("이미 테스트를 제출하였습니다.", 500));
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        // 틀린 문제 개수 카운팅
        let countOfWrong = 0;

        // 테스트 결과 모델 객체 생성
        let educationResult = new EducationResultModel({
            userId: userId,
            questions: [],
            isPassed: false,
        });

        const questions = await QuestionModel.find();

        // 제출한 답을 순회하면서 답안 검사하기
        for (let [questionId, myAnswer] of Object.entries(educationAnswers)) {
            const targetIndex = questions.findIndex(q => q._id.toString() === questionId.toString());

            if (targetIndex === -1) {
                return next(new HttpError("유효하지 않은 데이터이므로 문제를 제출 할 수 없습니다.", 400));
            }

            const questionType = questions[targetIndex].questionType;

            let questionResult = {
                questionId: new mongoose.Types.ObjectId(questionId),
                myAnswer,
                isCorrect: false,
            };

            switch (questionType) {
                case "shortAnswer":
                    if (typeof myAnswer === "string" && questions[targetIndex].answer.trim() === myAnswer.trim()) {
                        questionResult["isCorrect"] = true;
                    } else {
                        countOfWrong++;
                    }
                    educationResult.questions.push(questionResult);
                    break;
                case "singleChoice":
                    const singleChoiceAnswer = questions[targetIndex].options
                        .filter((opt) => opt.isAnswer)[0]?.optionId;
                    if (singleChoiceAnswer === myAnswer) {
                        questionResult["isCorrect"] = true;
                    } else {
                        countOfWrong++;
                    }
                    educationResult.questions.push(questionResult);
                    break;
                case "multipleChoice":
                    const multipleChoiceAnswer: string[] = questions[targetIndex].options
                        .filter((opt) => opt.isAnswer)
                        .map(a => a.optionId as string);

                    if ((Array.isArray(myAnswer) && myAnswer.length === multipleChoiceAnswer.length)) {
                        const setA = new Set(myAnswer as string[]);
                        const setB = new Set(multipleChoiceAnswer);
                        if ([...setA].every(value => setB.has(value))) {
                            questionResult["isCorrect"] = true;
                        } else {
                            countOfWrong++;
                        }
                    } else {
                        countOfWrong++;
                    }
                    educationResult.questions.push(questionResult);
                    break;
                default:
                    break;
            }
        }

        const existingUser = await UserModel.findById(userId).session(sess);

        // 유저가 없을 경우, 에러 발생
        if (!existingUser) {
            await sess.abortTransaction();
            return next(new HttpError("유효하지 않은 데이터이므로 문제를 제출 할 수 없습니다.", 403));
        }

        // 유저의 학년 및 스튜디오 수정
        existingUser.year = year;
        existingUser.studio = studio;

        // 커트라인 개수 이하로 틀린 경우, 유저의 교육 이수 여부를 통과로 처리하기
        existingUser.passEducation = countOfWrong <= cutOffPoint;
        educationResult.isPassed = countOfWrong <= cutOffPoint;

        await educationResult.save({session: sess});
        await existingUser.save({session: sess});

        await sess.commitTransaction();
        return res.status(200).json({data: {message: "문제 제출 및 검사가 완료되었습니다."}});
    } catch (err) {
        console.log("문제 제출 에러: ", err);
        await sess.abortTransaction();
        return next(new HttpError("문제 제출 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
};


// 교육 문제 저장
const saveQuestions = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {questions} = req.body;

    if (role !== "assistant" && role !== "admin") {
        return next(new HttpError("조교만 문제 저장이 가능합니다.", 403));
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        // 기존 문제 내역 삭제하기
        await QuestionModel.deleteMany({}, {session: sess});

        // 새 문제 내역 저장하기
        const createdQuestions = questions.map((q: EducationType) => {
            const questionData = {
                questionType: q.questionType,
                question: q.question,
                explanation: q.explanation,
            };

            if (q.questionType === "shortAnswer") {
                return {
                    ...questionData,
                    answer: q.answer,
                };
            }

            if (q.questionType === "singleChoice" || q.questionType === "multipleChoice") {
                return {
                    ...questionData,
                    options: q.options,
                };
            }

            return next(new HttpError("지원하지 않는 문제 유형입니다.", 400));
        });
        const savedQuestions = await QuestionModel.insertMany(createdQuestions, {session: sess});

        await sess.commitTransaction();
        return res.status(200).json({data: savedQuestions});
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("교육 문제 저장 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
};

// 교육 게시 또는 비게시
const implementationEducation = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "assistant" && role !== "admin") {
        return next(new HttpError("조교만 교육 게시가 가능합니다.", 403));
    }

    try {
        const settings = await EducationSettingsModel.find();
        settings[0].status = !settings[0].status;
        settings[0].save();
        return res.status(200).json({data: settings[0].status});
    } catch (err) {
        return next(new HttpError("교육 문제 저장 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};

// 교육 날짜 설정
const settingDate = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {startDate, endDate} = req.body;

    if (role !== "assistant" && role !== "admin") {
        return next(new HttpError("조교만 교육 날짜 설정이 가능합니다.", 403));
    }

    try {
        const settings = await EducationSettingsModel.find();
        settings[0].startDate = startDate;
        settings[0].endDate = endDate;
        settings[0].save();
        return res.status(200).json({data: {startDate: settings[0].startDate, endDate: settings[0].endDate}});
    } catch (err) {
        return next(new HttpError("교육 날짜 설정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 교육 커트라인 문제 개수 설정
const settingCutOffPoint = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {cutOffPoint} = req.body;

    if (role !== "assistant" && role !== "admin") {
        return next(new HttpError("조교만 커트라인 문제 개수 설정이 가능합니다.", 403));
    }

    if (typeof cutOffPoint !== "number" || cutOffPoint === 0 || cutOffPoint > 9) {
        return next(new HttpError("유효한 데이터 형식이 아닙니다.", 403));
    }

    try {
        const settings = await EducationSettingsModel.find();
        settings[0].cutOffPoint = cutOffPoint;
        settings[0].save();
        return res.status(200).json({data: settings[0].cutOffPoint});
    } catch (err) {
        return next(new HttpError("커트라인 문제 개수 설정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


export {
    getQuestionsAndSettings,
    getSettings,
    getQuestions,
    getUserEducationStatus,
    getUserEducationResult,
    checkEducation,
    saveQuestions,
    implementationEducation,
    settingDate,
    settingCutOffPoint
};