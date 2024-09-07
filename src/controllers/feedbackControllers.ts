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

    const {title, category, content} = req.body;
    const {userId} = req.userData;

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

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdFeedback.save({session: sess});
        user.inquiries.push(createdFeedback._id);
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("피드백 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(201).json({data: {feedbackId: createdFeedback._id}});
};

// 피드백 목록 조회
const getFeedbackList = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {userId} = req.userData;

    let feedback;
    try {
        feedback = await FeedbackModel.find({creator: userId}).sort({createdAt: -1}).populate<{
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
            answer: f.comments.length > 0,
            creator: f.creator.username,
            createdAt: f.createdAt,
        };
    });

    return res.status(200).json({data: data});
};

// 피드백 디테일 조회
const getFeedback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {userId} = req.userData;
    const {feedbackId} = req.params;

    let feedback;
    try {
        feedback = await FeedbackModel.findById(feedbackId).populate<{ creator: IPopulatedFeedbackUser }>("creator");
    } catch (err) {
        return next(new HttpError("피드백 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!feedback) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 403));
    }

    if (feedback.creator._id.toString() !== userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 401));
    }

    res.status(200).json({
        data: {
            title: feedback.title,
            category: feedback.category,
            content: feedback.content,
            creator: feedback.creator.username,
            createdAt: feedback.createdAt,
        },
    });
};

// 피드백 삭제
const deleteFeedback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {userId} = req.userData;
    const {feedbackId} = req.params;

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

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();

        feedback.creator.feedback = feedback.creator.feedback.filter(
            (id) => id.toString() !== feedback._id.toString()
        );

        await feedback.creator.save({session: sess});
        await feedback.deleteOne({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("피드백 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};

export {newFeedback, getFeedbackList, getFeedback, deleteFeedback};