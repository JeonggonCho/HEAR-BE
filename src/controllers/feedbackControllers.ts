import {NextFunction, Response} from "express";
import {validationResult} from "express-validator";
import mongoose from "mongoose";

import HttpError from "../models/errorModel";
import UserModel, {IUser} from "../models/userModel";
import FeedbackModel, {IPopulatedFeedbackUser} from "../models/feedbackModel";

import {CustomRequest} from "../middlewares/checkAuth";
import CommentModel from "../models/commentModel";


// 피드백 생성
const newFeedback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
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

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        await createdFeedback.save({session: sess});
        user.feedback.push(createdFeedback._id as mongoose.Types.ObjectId);
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("피드백 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }

    return res.status(201).json({data: {feedbackId: createdFeedback._id}});
};


// 피드백 목록 조회
const getFeedbackList = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    let feedback: any[];
    try {
        feedback = await FeedbackModel
            .find()
            .sort({createdAt: -1})
            .populate<{ creator: IPopulatedFeedbackUser }>("creator");
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
            creator: f.creator.username,
            createdAt: f.createdAt,
            views: f.views,
            likes: f.likes,
            comments: f.comments.length,
        };
    });

    return res.status(200).json({data});
};


// 피드백 디테일 조회
const getFeedback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {feedbackId} = req.params;

    let feedback;
    try {
        feedback = await FeedbackModel
            .findById(feedbackId)
            .populate<{ creator: IPopulatedFeedbackUser }>("creator");
    } catch (err) {
        return next(new HttpError("피드백 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!feedback) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 403));
    }

    if (!feedback.viewedBy.includes(userId)) {
        feedback.views += 1;
        feedback.viewedBy.push(userId);
        await feedback.save();
    }

    let isLiked;
    if (feedback.likedBy.includes(userId)) {
        isLiked = true;
    } else {
        isLiked = false;
    }

    let comments = [];
    try {
        comments = await CommentModel
            .find({refId: feedback._id, refType: "feedback"})
            .sort({createdAt: -1})
            .populate<{ author: IUser }>("author");
        comments = comments.map((comment) => {
            let isLiked = false;
            if (comment.likedBy.includes(userId)) {
                isLiked = true;
            }
            return ({
                _id: comment._id,
                content: comment.content,
                author: comment.author.username,
                authorId: comment.author._id,
                likes: comment.likes,
                createdAt: comment.createdAt,
                isLiked: isLiked,
            });
        });
    } catch (err) {
        return next(new HttpError("피드백 댓글 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    return res.status(200).json({
        data: {
            feedback: {
                _id: feedback._id,
                title: feedback.title,
                category: feedback.category,
                content: feedback.content,
                creator: feedback.creator.username,
                creatorId: feedback.creator._id.toString(),
                createdAt: feedback.createdAt,
                views: feedback.views,
                likes: feedback.likes,
                isLiked: isLiked,
                comments: feedback.comments.length,
            },
            comments: comments,
        },
    });
};


// 피드백 좋아요
const likeFeedback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {feedbackId} = req.params;

    let feedback;
    try {
        feedback = await FeedbackModel.findById(feedbackId);
    } catch (err) {
        return next(new HttpError("피드백 좋아요 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!feedback) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백 좋아요를 할 수 없습니다.", 403));
    }

    let message;
    let isLiked;
    if (!feedback.likedBy.includes(userId)) {
        feedback.likes += 1;
        feedback.likedBy.push(userId);
        message = "피드백에 좋아요를 추가하였습니다.";
        isLiked = true;
    } else {
        feedback.likes = Math.max(feedback.likes - 1, 0);
        feedback.likedBy = feedback.likedBy.filter((id: mongoose.Types.ObjectId) => !id.equals(userId));
        message = "피드백에 대한 좋아요를 취소하였습니다.";
        isLiked = false;
    }

    try {
        await feedback.save();
    } catch (err) {
        return next(new HttpError("피드백 좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({
        data: {
            message,
            likes: feedback.likes,
            isLiked: isLiked,
        }
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

    const {userId} = req.userData;
    const {feedbackId} = req.params;
    const {title, category, content} = req.body;

    let feedback;
    try {
        feedback = await FeedbackModel.findById(feedbackId);
    } catch (err) {
        return next(new HttpError("피드백 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!feedback) {
        return next(new HttpError("유효하지 않은 데이터이므로 피드백을 수정할 수 없습니다.", 404));
    }

    if (feedback.creator.toString() !== userId) {
        return next(new HttpError("권한이 없으므로 피드백을 수정할 수 없습니다.", 403));
    }

    let updatedFeedback;
    try {
        updatedFeedback = await FeedbackModel.findByIdAndUpdate(feedbackId, {title, category, content}, {new: true},);
    } catch (err) {
        return next(new HttpError("피드백 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    return res.status(200).json({message: "공지가 수정되었습니다.", data: {feedback: updatedFeedback}});
};


// 피드백 삭제
const deleteFeedback = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {feedbackId} = req.params;

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        const feedback = await FeedbackModel
            .findById(feedbackId)
            .populate<{ creator: IPopulatedFeedbackUser }>("creator")
            .session(sess);

        if (!feedback) {
            return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 403));
        }

        if (feedback.creator._id.toString() !== userId) {
            return next(new HttpError("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 401));
        }

        await feedback.deleteOne({session: sess});

        await sess.commitTransaction();
        return res.status(204).json({message: "피드백이 삭제되었습니다."});
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("피드백 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
};

export {newFeedback, likeFeedback, getFeedbackList, getFeedback, updateFeedback, deleteFeedback};