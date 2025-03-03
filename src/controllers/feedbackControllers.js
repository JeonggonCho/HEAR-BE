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
exports.deleteFeedback = exports.updateFeedback = exports.getFeedback = exports.getFeedbackList = exports.likeFeedback = exports.newFeedback = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const errorModel_1 = __importDefault(require("../models/errorModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const feedbackModel_1 = __importDefault(require("../models/feedbackModel"));
const commentModel_1 = __importDefault(require("../models/commentModel"));
// 피드백 생성
const newFeedback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { title, category, content } = req.body;
    const { userId } = req.userData;
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("문의 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 피드백을 생성 할 수 없습니다.", 403));
    }
    const createdFeedback = new feedbackModel_1.default({
        title,
        category,
        content,
        creator: userId,
    });
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        yield createdFeedback.save({ session: sess });
        user.feedback.push(createdFeedback._id);
        yield user.save({ session: sess });
        yield sess.commitTransaction();
    }
    catch (err) {
        yield sess.abortTransaction();
        return next(new errorModel_1.default("피드백 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
    return res.status(201).json({ data: { feedbackId: createdFeedback._id } });
});
exports.newFeedback = newFeedback;
// 피드백 목록 조회
const getFeedbackList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    let feedback;
    try {
        feedback = yield feedbackModel_1.default
            .find()
            .sort({ createdAt: -1 })
            .populate("creator");
    }
    catch (err) {
        return next(new errorModel_1.default("피드백 목록 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (feedback.length === 0) {
        return res.status(200).json({ data: [] });
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
    return res.status(200).json({ data });
});
exports.getFeedbackList = getFeedbackList;
// 피드백 디테일 조회
const getFeedback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { feedbackId } = req.params;
    let feedback;
    try {
        feedback = yield feedbackModel_1.default
            .findById(feedbackId)
            .populate("creator");
    }
    catch (err) {
        return next(new errorModel_1.default("피드백 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!feedback) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 403));
    }
    if (!feedback.viewedBy.includes(userId)) {
        feedback.views += 1;
        feedback.viewedBy.push(userId);
        yield feedback.save();
    }
    let isLiked;
    if (feedback.likedBy.includes(userId)) {
        isLiked = true;
    }
    else {
        isLiked = false;
    }
    let comments = [];
    try {
        comments = yield commentModel_1.default
            .find({ refId: feedback._id, refType: "feedback" })
            .sort({ createdAt: -1 })
            .populate("author");
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
    }
    catch (err) {
        return next(new errorModel_1.default("피드백 댓글 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
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
});
exports.getFeedback = getFeedback;
// 피드백 좋아요
const likeFeedback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { feedbackId } = req.params;
    let feedback;
    try {
        feedback = yield feedbackModel_1.default.findById(feedbackId);
    }
    catch (err) {
        return next(new errorModel_1.default("피드백 좋아요 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!feedback) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 피드백 좋아요를 할 수 없습니다.", 403));
    }
    let message;
    let isLiked;
    if (!feedback.likedBy.includes(userId)) {
        feedback.likes += 1;
        feedback.likedBy.push(userId);
        message = "피드백에 좋아요를 추가하였습니다.";
        isLiked = true;
    }
    else {
        feedback.likes = Math.max(feedback.likes - 1, 0);
        feedback.likedBy = feedback.likedBy.filter((id) => !id.equals(userId));
        message = "피드백에 대한 좋아요를 취소하였습니다.";
        isLiked = false;
    }
    try {
        yield feedback.save();
    }
    catch (err) {
        return next(new errorModel_1.default("피드백 좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({
        data: {
            message,
            likes: feedback.likes,
            isLiked: isLiked,
        }
    });
});
exports.likeFeedback = likeFeedback;
// 피드백 수정
const updateFeedback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { feedbackId } = req.params;
    const { title, category, content } = req.body;
    let feedback;
    try {
        feedback = yield feedbackModel_1.default.findById(feedbackId);
    }
    catch (err) {
        return next(new errorModel_1.default("피드백 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!feedback) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 피드백을 수정할 수 없습니다.", 404));
    }
    if (feedback.creator.toString() !== userId) {
        return next(new errorModel_1.default("권한이 없으므로 피드백을 수정할 수 없습니다.", 403));
    }
    let updatedFeedback;
    try {
        updatedFeedback = yield feedbackModel_1.default.findByIdAndUpdate(feedbackId, { title, category, content }, { new: true });
    }
    catch (err) {
        return next(new errorModel_1.default("피드백 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({ message: "공지가 수정되었습니다.", data: { feedback: updatedFeedback } });
});
exports.updateFeedback = updateFeedback;
// 피드백 삭제
const deleteFeedback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { feedbackId } = req.params;
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    try {
        const feedback = yield feedbackModel_1.default
            .findById(feedbackId)
            .populate("creator")
            .session(sess);
        if (!feedback) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 403));
        }
        if (feedback.creator._id.toString() !== userId) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 피드백을 조회 할 수 없습니다.", 401));
        }
        yield feedback.deleteOne({ session: sess });
        yield sess.commitTransaction();
        return res.status(204).json({ message: "피드백이 삭제되었습니다." });
    }
    catch (err) {
        yield sess.abortTransaction();
        return next(new errorModel_1.default("피드백 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
});
exports.deleteFeedback = deleteFeedback;
