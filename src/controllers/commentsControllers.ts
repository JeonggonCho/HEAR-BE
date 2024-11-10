import {NextFunction, Response} from "express";
import mongoose from "mongoose";

import {CustomRequest} from "../middlewares/checkAuth";

import CommentModel from "../models/commentModel";
import InquiryModel from "../models/inquiryModel";
import HttpError from "../models/errorModel";
import UserModel, {IUser} from "../models/userModel";
import FeedbackModel from "../models/feedbackModel";
import NoticeModel from "../models/noticeModel";


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
                inquiry.comments.push(comment._id as mongoose.Types.ObjectId);
                await inquiry.save({session: sess});
                existingUser.comments.push(comment._id as mongoose.Types.ObjectId);
                await existingUser.save({session: sess});
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
            let feedback;
            try {
                feedback = await FeedbackModel.findById(refId);
            } catch (err) {
                return next(new HttpError("피드백 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            }

            if (!feedback) {
                return next(new HttpError("유효하지 않은 데이터이므로 피드백 댓글을 등록 할 수 없습니다.", 403));
            }

            try {
                await comment.save({session: sess});
                feedback.comments.push(comment._id as mongoose.Types.ObjectId);
                await feedback.save({session: sess});
                existingUser.comments.push(comment._id as mongoose.Types.ObjectId);
                await existingUser.save({session: sess});
                await sess.commitTransaction();
            } catch (err) {
                await sess.abortTransaction();
                return next(new HttpError("피드백 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            } finally {
                await sess.endSession();
            }
            break;

        // 공지 댓글인 경우
        case "notice":
            let notice;
            try {
                notice = await NoticeModel.findById(refId);
            } catch (err) {
                return next(new HttpError("공지 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            }

            if (!notice) {
                return next(new HttpError("유효하지 않은 데이터이므로 공지 댓글을 등록 할 수 없습니다.", 403));
            }

            try {
                await comment.save({session: sess});
                notice.comments.push(comment._id as mongoose.Types.ObjectId);
                await notice.save({session: sess});
                existingUser.comments.push(comment._id as mongoose.Types.ObjectId);
                await existingUser.save({session: sess});
                await sess.commitTransaction();
            } catch (err) {
                await sess.abortTransaction();
                return next(new HttpError("공지 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            } finally {
                await sess.endSession();
            }
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
        comment = await CommentModel
            .findById(commentId)
            .populate("author");
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

    let comment; // 삭제할 타겟 댓글
    let refDoc: any; // 타겟 댓글이 참조하고 있는 문의 또는 피드백 또는 공지
    try {
        comment = await CommentModel
            .findById(commentId)
            .populate<{ author: IUser & { _id: mongoose.Types.ObjectId } }>({path: "author", select: "comments"});

        if (!comment) {
            return next(new HttpError("유효하지 않은 데이터이므로 댓글을 삭제할 수 없습니다.", 403));
        }

        // 댓글의 refType 에 참조된 문의, 피드백, 공지 모델 객체 찾기
        switch (comment.refType) {
            case "inquiry":
                refDoc = await mongoose.model('Inquiry').findById(comment.refId);
                break;
            case "feedback":
                refDoc = await mongoose.model('Feedback').findById(comment.refId);
                break;
            case "notice":
                refDoc = await mongoose.model('Notice').findById(comment.refId);
                break;
            default:
                return next(new HttpError("유효하지 않은 참조 타입입니다.", 400));
        }

        if (!refDoc) {
            return next(new HttpError("참조된 문서를 찾을 수 없습니다.", 404));
        }
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
        // 문의, 피드백, 공지에서 해당 댓글 삭제
        refDoc.comments = refDoc.comments.filter((c: mongoose.Types.ObjectId) => !c.equals(commentId));
        await refDoc.save({session: sess});

        // 유저의 댓글 목록에서 해당 댓글 삭제
        comment.author.comments = comment.author.comments.filter((c: mongoose.Types.ObjectId) => !c.equals(commentId));
        await comment.author.save({session: sess});

        await comment.deleteOne({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        console.log("댓글 삭제 중 에러: ", err);
        await sess.abortTransaction();
        return next(new HttpError("댓글 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    } finally {
        await sess.endSession();
    }
    return res.status(204).json({message: "댓글이 삭제되었습니다."});
};


export {newComment, updateComment, likeComment, deleteComment};