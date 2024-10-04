import {NextFunction, Response} from "express";
import {validationResult} from "express-validator";
import mongoose from "mongoose";

import HttpError from "../models/errorModel";
import UserModel from "../models/userModel";
import FeedbackModel, {IPopulatedFeedbackUser} from "../models/feedbackModel";

import {CustomRequest} from "../middlewares/checkAuth";

// 피드백 생성
const newFeedback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    if (!req.body) {
        return next(new HttpError("데이터가 없어 요청을 처리할 수 없습니다. 다시 시도 해주세요.", 401));
    }

    const {title, category, content} = req.body;
    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 생성 할 수 없습니다.", 403));
    }

    let user;
    try {
        user = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("문의 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!user) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 생성 할 수 없습니다.", 403));
    }

    const createdFeedback = new FeedbackModel({
        title,
        category,
        content,
        creator: userId,
    });

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        await createdFeedback.save({session: sess});
        user.feedback.push(createdFeedback._id);
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("피드백 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }

    res.status(201).json({data: {feedbackId: createdFeedback._id}});
};

// 피드백 목록 조회
const getFeedbackList = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백 목록을 조회 할 수 없습니다.", 403));
    }

    let feedback: any[];
    try {
        feedback = await FeedbackModel.find().sort({createdAt: -1}).populate<{
            creator: IPopulatedFeedbackUser
        }>("creator");
    } catch (err) {
        return next(new HttpError("피드백 목록 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (feedback.length === 0) {
        return res.status(200).json({data: []});
    }

    const data = feedback.map((f) => {
        return {
            _id: f._id,
            title: f.title,
            category: f.category,
            answer: !!f.comment,
            creator: f.creator.username,
            createdAt: f.createdAt,
        };
    });

    return res.status(200).json({data});
};

// 피드백 디테일 조회
const getFeedback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId, role} = req.userData;
    const {feedbackId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 403));
    }

    if (!role) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 403));
    }

    let feedback;
    try {
        feedback = await FeedbackModel.findById(feedbackId).populate<{ creator: IPopulatedFeedbackUser }>("creator");
    } catch (err) {
        return next(new HttpError("피드백 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!feedback) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 403));
    }

    if (!(["manager", "admin", "student"]).includes(role)) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 401));
    }

    res.status(200).json({
        data: {
            title: feedback.title,
            category: feedback.category,
            content: feedback.content,
            creator: feedback.creator.username,
            creatorId: feedback.creator._id.toString(),
            createdAt: feedback.createdAt,
        },
    });
};

// 피드백 수정
const updateFeedback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    if (!req.body) {
        return next(new HttpError("데이터가 없어 요청을 처리할 수 없습니다. 다시 시도 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {feedbackId} = req.params;
    const {title, category, content} = req.body;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 수정 할 수 없습니다.", 403));
    }

    let updatedFeedback;
    try {
        updatedFeedback = await FeedbackModel.findByIdAndUpdate(
            feedbackId,
            {title, category, content},
            {new: true},
        );
    } catch (err) {
        return next(new HttpError("피드백 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!updatedFeedback) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 수정 할 수 없습니다.", 403));
    }

    res.status(200).json({message: "공지가 수정되었습니다.", data: {feedback: updatedFeedback}});
};

// 피드백 삭제
const deleteFeedback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {feedbackId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 삭제 할 수 없습니다.", 403));
    }

    let feedback;
    try {
        feedback = await FeedbackModel.findById(feedbackId).populate<{ creator: IPopulatedFeedbackUser }>("creator");
    } catch (err) {
        return next(new HttpError("피드백 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!feedback) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 403));
    }

    if (feedback.creator._id.toString() !== userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 401));
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        feedback.creator.feedback = feedback.creator.feedback.filter((id) =>
            id.toString() !== feedback._id.toString()
        );

        await feedback.creator.save({session: sess});
        await feedback.deleteOne({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("피드백 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }

    res.status(204).json({message: "피드백이 삭제되었습니다."});
};

export {newFeedback, getFeedbackList, getFeedback, updateFeedback, deleteFeedback};