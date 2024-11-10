import {NextFunction, Response} from "express";
import {validationResult} from "express-validator";
import mongoose from "mongoose";

import UserModel, {IUser} from "../models/userModel";
import InquiryModel, {IPopulatedInquiryUser} from "../models/inquiryModel";
import HttpError from "../models/errorModel";

import {CustomRequest} from "../middlewares/checkAuth";
import CommentModel from "../models/commentModel";


// 문의 등록
const newInquiry = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {title, category, content} = req.body;
    const {userId, role} = req.userData;

    if (role !== "student") {
        return next(new HttpError("학생만 문의 등록이 가능합니다.", 403));
    }

    // id로 유저 조회
    let user;
    try {
        user = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("문의 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 유저 없을 경우, 오류 발생
    if (!user) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 등록 할 수 없습니다.", 403));
    }

    // 새 문의 생성
    const createdInquiry = new InquiryModel({
        title,
        category,
        content,
        creator: userId,
    });

    // 문의 저장 및 유저에 등록
    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        await createdInquiry.save({session: sess});

        if (!user.inquiries) {
            user.inquiries = [];
        }
        user.inquiries.push(createdInquiry._id as mongoose.Types.ObjectId);

        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("문의 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }

    return res.status(201).json({data: {inquiryId: createdInquiry._id}});
};


// 문의 목록 조회
const getInquiries = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    let inquiries: any[];
    try {
        inquiries = await InquiryModel
            .find()
            .sort({createdAt: -1})
            .populate<{ creator: IPopulatedInquiryUser }>("creator");
    } catch (err) {
        return next(new HttpError("문의 목록 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (inquiries.length === 0) {
        return res.status(200).json({data: []});
    }

    const data = inquiries.map((i) => {
        return {
            _id: i._id,
            title: i.title,
            category: i.category,
            creator: i.creator.username,
            createdAt: i.createdAt,
            views: i.views,
            likes: i.likes,
            comments: i.comments.length,
        };
    });

    return res.status(200).json({data});
};


// 내 문의 내역 조회
const getMyInquiries = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;

    let inquiries: any[];
    try {
        inquiries = await InquiryModel
            .find({creator: userId})
            .sort({createdAt: -1})
            .populate<{ creator: IPopulatedInquiryUser }>("creator");
    } catch (err) {
        return next(new HttpError("문의 목록 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (inquiries.length === 0) {
        return res.status(200).json({data: []});
    }

    const data = inquiries.map((i) => {
        return {
            _id: i._id,
            title: i.title,
            category: i.category,
            answer: !!i.comment,
            creator: i.creator.username,
            createdAt: i.createdAt,
            views: i.views,
            likes: i.likes,
            comments: i.comments.length,
        };
    });

    return res.status(200).json({data});
};


// 문의 디테일 조회
const getInquiry = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {inquiryId} = req.params;

    let inquiry;
    try {
        inquiry = await InquiryModel
            .findById(inquiryId)
            .populate<{ creator: IPopulatedInquiryUser }>("creator");
    } catch (err) {
        return next(new HttpError("문의 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!inquiry) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 조회 할 수 없습니다.", 403));
    }

    if (!inquiry.viewedBy.includes(userId)) {
        inquiry.views += 1;
        inquiry.viewedBy.push(userId);
        await inquiry.save();
    }

    let isLiked;
    if (inquiry.likedBy.includes(userId)) {
        isLiked = true;
    } else {
        isLiked = false;
    }

    let comments = [];
    try {
        comments = await CommentModel
            .find({refId: inquiry._id, refType: "inquiry"})
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
        return next(new HttpError("문의 댓글 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    return res.status(200).json({
        data: {
            inquiry: {
                _id: inquiry._id,
                title: inquiry.title,
                category: inquiry.category,
                content: inquiry.content,
                creator: inquiry.creator.username,
                creatorId: inquiry.creator._id.toString(),
                createdAt: inquiry.createdAt,
                views: inquiry.views,
                likes: inquiry.likes,
                isLiked: isLiked,
                comments: inquiry.comments.length,
            },
            comments: comments,
        },
    });
};

// 문의 수정
const updateInquiry = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {inquiryId} = req.params;
    const {title, category, content} = req.body;

    let inquiry;
    try {
        inquiry = await InquiryModel.findById(inquiryId).populate("creator");

        if (!inquiry) {
            return next(new HttpError("유효하지 않은 데이터이므로 문의를 수정 할 수 없습니다.", 403));
        }

        if (inquiry.creator._id.toString() !== userId) {
            return next(new HttpError("권한이 없으므로 문의를 수정할 수 없습니다.", 403));
        }

        inquiry.title = title;
        inquiry.category = category;
        inquiry.content = content;

        const updatedInquiry = await inquiry.save();

        return res.status(200).json({message: "문의가 수정되었습니다.", data: {inquiry: updatedInquiry}});
    } catch (err) {
        return next(new HttpError("문의 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 문의 좋아요
const likeInquiry = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {inquiryId} = req.params;

    let inquiry;
    try {
        inquiry = await InquiryModel.findById(inquiryId);
    } catch (err) {
        return next(new HttpError("문의 좋아요 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!inquiry) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의 좋아요를 할 수 없습니다.", 403));
    }

    // 좋아요 추가 또는 취소 처리
    let message;
    let isLiked;
    if (!inquiry.likedBy.includes(userId)) {
        inquiry.likes += 1;
        inquiry.likedBy.push(userId);
        message = "문의에 좋아요를 추가하였습니다.";
        isLiked = true;
    } else {
        inquiry.likes = Math.max(inquiry.likes - 1, 0); // likes가 0 미만으로 내려가지 않도록 설정
        inquiry.likedBy = inquiry.likedBy.filter((id: mongoose.Types.ObjectId) => !id.equals(userId));
        message = "문의에 대한 좋아요를 취소하였습니다.";
        isLiked = false;
    }

    try {
        await inquiry.save();
    } catch (err) {
        return next(new HttpError("문의 좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({
        data: {
            message,
            likes: inquiry.likes,
            isLiked: isLiked,
        }
    });
};


// 문의 삭제
const deleteInquiry = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {inquiryId} = req.params;

    const sess = await mongoose.startSession();
    sess.startTransaction();

    // TODO 문의 삭제 시, 문의에 있는 댓글들, 대댓글 모두 cascade 로 삭제하기
    try {
        // 문의 조회
        const inquiry = await InquiryModel
            .findById(inquiryId)
            .populate<{ creator: IPopulatedInquiryUser }>("creator")
            .session(sess);

        if (!inquiry) {
            await sess.abortTransaction();
            return next(new HttpError("유효하지 않은 데이터이므로 문의를 삭제 할 수 없습니다.", 403));
        }

        if (inquiry.creator._id.toString() !== userId) {
            await sess.abortTransaction();
            return next(new HttpError("유효하지 않은 데이터이므로 문의를 삭제 할 수 없습니다.", 401));
        }

        // 문의 삭제
        await inquiry.deleteOne({session: sess});

        await sess.commitTransaction();
        return res.status(204).json({message: "문의가 삭제되었습니다."});
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("문의 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
};

export {
    newInquiry,
    getInquiry,
    getMyInquiries,
    getInquiries,
    likeInquiry,
    updateInquiry,
    deleteInquiry,
};