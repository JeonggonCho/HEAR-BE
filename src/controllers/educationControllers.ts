import {NextFunction, Response} from "express";
import mongoose from "mongoose";
import {CustomRequest} from "../middlewares/checkAuth";
import HttpError from "../models/errorModel";
import {EducationType, QuestionModel} from "../models/educationModel";


// 교육 문제 조회
const getQuestions = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;

    if (role !== "manager" && role !== "admin") {
        return next(new HttpError("조교만 문제 조회가 가능합니다.", 403));
    }

    let questions;
    try {
        questions = await QuestionModel.find();
        return res.status(200).json({data: {message: "교육 문제 조회 성공", questions: questions}});
    } catch (err) {
        return next(new HttpError("교육 문제 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 교육 문제 저장
const saveQuestions = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {role} = req.userData;
    const {questions} = req.body;

    if (role !== "manager" && role !== "admin") {
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
        return res.status(200).json({data: {message: "문제 저장이 완료되었습니다", questions: savedQuestions}});
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("교육 문제 저장 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
};


export {getQuestions, saveQuestions};