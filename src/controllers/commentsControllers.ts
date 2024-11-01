import {NextFunction, Response} from "express";
import mongoose from "mongoose";

import {CustomRequest} from "../middlewares/checkAuth";

import CommentModel from "../models/commentModel";
import InquiryModel from "../models/inquiryModel";
import HttpError from "../models/errorModel";
import {IUser, UserModel} from "../models/userModel";


// 댓글 생성
const newComment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {content, refId, refType} = req.body;

    if (content.trim() === "") {
        return next(new HttpError("유효하지 않은 데이터이므로 문의 댓글을 등록 할 수 없습니다.", 403));
    }

    let existingUser;
    try {
        existingUser = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("문의 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!existingUser) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의 댓글을 등록 할 수 없습니다.", 403));
    }

    let comment = new CommentModel({
        content,
        author: userId,
        refId,
        refType,
        likes: 0,
    });

    const sess = await mongoose.startSession();
    sess.startTransaction();

    switch (refType) {
        // 문의 댓글인 경우
        case "inquiry":
            let inquiry;
            try {
                inquiry = await InquiryModel.findById(refId);
            } catch (err) {
                return next(new HttpError("문의 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            }

            if (!inquiry) {
                return next(new HttpError("유효하지 않은 데이터이므로 문의 댓글을 등록 할 수 없습니다.", 403));
            }

            try {
                await comment.save({session: sess});
                inquiry.comments.push(comment._id);
                existingUser.comments.push(comment._id);
                await existingUser.save({session: sess});
                await inquiry.save({session: sess});
                await sess.commitTransaction();
            } catch (err) {
                await sess.abortTransaction();
                return next(new HttpError("문의 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            } finally {
                await sess.endSession();
            }
            break;

        // 피드백 댓글인 경우
        case "feedback":
            break;

        // 공지 댓글인 경우
        case "notice":
            break;

        default:
            break;
    }

    let populatedAuthorComment;
    try {
        populatedAuthorComment = await comment.populate<{ author: IUser }>('author');
    } catch (err) {
        return next(new HttpError("댓글 작성자 정보를 가져오는 중 오류가 발생하였습니다.", 500));
    }

    const responseComment = {
        _id: comment._id,
        content: comment.content,
        author: populatedAuthorComment.author.username,
        authorId: populatedAuthorComment.author._id,
        likes: comment.likes,
        createdAt: comment.createdAt,
    };

    return res.status(200).json({data: responseComment});
};

// 댓글 수정
const updateComment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {commentId} = req.params;
    const {content} = req.body;

    let comment;
    try {
        comment = await CommentModel.findById(commentId).populate("author");
        if (!comment) {
            return next(new HttpError("유효하지 않은 데이터이므로 댓글을 수정 할 수 없습니다.", 403));
        }
        if (comment.author._id.toString() !== userId) {
            return next(new HttpError("권한이 없으므로 댓글을 수정할 수 없습니다.", 403));
        }

        if (comment.content.trim().length === 0) {
            return next(new HttpError("유효하지 않은 데이터이므로 댓글을 수정 할 수 없습니다.", 403));
        }

        comment.content = content;

        const updatedComment = await comment.save();

        return res.status(200).json({data: {comment: updatedComment}});
    } catch (err) {
        return next(new HttpError("댓글 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};


// 댓글 좋아요
const likeComment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {commentId} = req.params;

    let comment;
    try {
        comment = await CommentModel.findById(commentId);
    } catch (err) {
        return next(new HttpError("댓글 좋아요 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!comment) {
        return next(new HttpError("유효하지 않은 데이터이므로 댓글 좋아요를 할 수 없습니다.", 403));
    }

    let isLiked;
    if (!comment.likedBy.includes(userId)) {
        comment.likes += 1;
        comment.likedBy.push(userId);
        isLiked = true;
    } else {
        comment.likes = Math.max(comment.likes - 1, 0);
        comment.likedBy = comment.likedBy.filter((id: mongoose.Types.ObjectId) => !id.equals(userId));
        isLiked = false;
    }

    try {
        await comment.save();
    } catch (err) {
        return next(new HttpError("댓글 좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({
        data: {
            likes: comment.likes,
            isLiked: isLiked,
        }
    });
};


// 댓글 삭제
const deleteComment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {commentId} = req.params;

    let comment;
    try {
        comment = await CommentModel.findById(commentId).populate<{
            author: IUser & { _id: mongoose.Types.ObjectId }
        }>("author");
    } catch (err) {
        return next(new HttpError("댓글 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!comment) {
        return next(new HttpError("유효하지 않은 데이터이므로 댓글을 삭제 할 수 없습니다.", 403));
    }

    if (comment.author._id.toString() !== userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 댓글을 삭제 할 수 없습니다.", 401));
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();

    // TODO 댓글 삭제 시, 자식 댓글도 cascade 로 삭제하기
    try {
        comment.author.comments = comment.author.comments.filter((c: mongoose.Types.ObjectId) => !c.equals(commentId));
        await comment.author.save({session: sess});
        await comment.deleteOne({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        await sess.abortTransaction();
        return next(new HttpError("댓글 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
    return res.status(204).json({message: "댓글이 삭제되었습니다."});
};


export {newComment, updateComment, likeComment, deleteComment};