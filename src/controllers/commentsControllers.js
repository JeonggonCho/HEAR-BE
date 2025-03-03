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
exports.deleteComment = exports.likeComment = exports.updateComment = exports.newComment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const commentModel_1 = __importDefault(require("../models/commentModel"));
const inquiryModel_1 = __importDefault(require("../models/inquiryModel"));
const errorModel_1 = __importDefault(require("../models/errorModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const feedbackModel_1 = __importDefault(require("../models/feedbackModel"));
const noticeModel_1 = __importDefault(require("../models/noticeModel"));
// 댓글 생성
const newComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { content, refId, refType } = req.body;
    if (content.trim() === "") {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 문의 댓글을 등록 할 수 없습니다.", 403));
    }
    let existingUser;
    try {
        existingUser = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("문의 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!existingUser) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 문의 댓글을 등록 할 수 없습니다.", 403));
    }
    let comment = new commentModel_1.default({
        content,
        author: userId,
        refId,
        refType,
        likes: 0,
    });
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    switch (refType) {
        // 문의 댓글인 경우
        case "inquiry":
            let inquiry;
            try {
                inquiry = yield inquiryModel_1.default.findById(refId);
            }
            catch (err) {
                return next(new errorModel_1.default("문의 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            }
            if (!inquiry) {
                return next(new errorModel_1.default("유효하지 않은 데이터이므로 문의 댓글을 등록 할 수 없습니다.", 403));
            }
            try {
                yield comment.save({ session: sess });
                inquiry.comments.push(comment._id);
                yield inquiry.save({ session: sess });
                existingUser.comments.push(comment._id);
                yield existingUser.save({ session: sess });
                yield sess.commitTransaction();
            }
            catch (err) {
                yield sess.abortTransaction();
                return next(new errorModel_1.default("문의 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            }
            finally {
                yield sess.endSession();
            }
            break;
        // 피드백 댓글인 경우
        case "feedback":
            let feedback;
            try {
                feedback = yield feedbackModel_1.default.findById(refId);
            }
            catch (err) {
                return next(new errorModel_1.default("피드백 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            }
            if (!feedback) {
                return next(new errorModel_1.default("유효하지 않은 데이터이므로 피드백 댓글을 등록 할 수 없습니다.", 403));
            }
            try {
                yield comment.save({ session: sess });
                feedback.comments.push(comment._id);
                yield feedback.save({ session: sess });
                existingUser.comments.push(comment._id);
                yield existingUser.save({ session: sess });
                yield sess.commitTransaction();
            }
            catch (err) {
                yield sess.abortTransaction();
                return next(new errorModel_1.default("피드백 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            }
            finally {
                yield sess.endSession();
            }
            break;
        // 공지 댓글인 경우
        case "notice":
            let notice;
            try {
                notice = yield noticeModel_1.default.findById(refId);
            }
            catch (err) {
                return next(new errorModel_1.default("공지 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            }
            if (!notice) {
                return next(new errorModel_1.default("유효하지 않은 데이터이므로 공지 댓글을 등록 할 수 없습니다.", 403));
            }
            try {
                yield comment.save({ session: sess });
                notice.comments.push(comment._id);
                yield notice.save({ session: sess });
                existingUser.comments.push(comment._id);
                yield existingUser.save({ session: sess });
                yield sess.commitTransaction();
            }
            catch (err) {
                yield sess.abortTransaction();
                return next(new errorModel_1.default("공지 댓글 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
            }
            finally {
                yield sess.endSession();
            }
            break;
        default:
            break;
    }
    let populatedAuthorComment;
    try {
        populatedAuthorComment = yield comment.populate('author');
    }
    catch (err) {
        return next(new errorModel_1.default("댓글 작성자 정보를 가져오는 중 오류가 발생하였습니다.", 500));
    }
    const responseComment = {
        _id: comment._id,
        content: comment.content,
        author: populatedAuthorComment.author.username,
        authorId: populatedAuthorComment.author._id,
        likes: comment.likes,
        createdAt: comment.createdAt,
    };
    return res.status(200).json({ data: responseComment });
});
exports.newComment = newComment;
// 댓글 수정
const updateComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { commentId } = req.params;
    const { content } = req.body;
    let comment;
    try {
        comment = yield commentModel_1.default
            .findById(commentId)
            .populate("author");
        if (!comment) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 댓글을 수정 할 수 없습니다.", 403));
        }
        if (comment.author._id.toString() !== userId) {
            return next(new errorModel_1.default("권한이 없으므로 댓글을 수정할 수 없습니다.", 403));
        }
        if (comment.content.trim().length === 0) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 댓글을 수정 할 수 없습니다.", 403));
        }
        comment.content = content;
        const updatedComment = yield comment.save();
        return res.status(200).json({ data: { comment: updatedComment } });
    }
    catch (err) {
        return next(new errorModel_1.default("댓글 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
});
exports.updateComment = updateComment;
// 댓글 좋아요
const likeComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { commentId } = req.params;
    let comment;
    try {
        comment = yield commentModel_1.default.findById(commentId);
    }
    catch (err) {
        return next(new errorModel_1.default("댓글 좋아요 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!comment) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 댓글 좋아요를 할 수 없습니다.", 403));
    }
    let isLiked;
    if (!comment.likedBy.includes(userId)) {
        comment.likes += 1;
        comment.likedBy.push(userId);
        isLiked = true;
    }
    else {
        comment.likes = Math.max(comment.likes - 1, 0);
        comment.likedBy = comment.likedBy.filter((id) => !id.equals(userId));
        isLiked = false;
    }
    try {
        yield comment.save();
    }
    catch (err) {
        return next(new errorModel_1.default("댓글 좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({
        data: {
            likes: comment.likes,
            isLiked: isLiked,
        }
    });
});
exports.likeComment = likeComment;
// 댓글 삭제
const deleteComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { commentId } = req.params;
    let comment; // 삭제할 타겟 댓글
    let refDoc; // 타겟 댓글이 참조하고 있는 문의 또는 피드백 또는 공지
    try {
        comment = yield commentModel_1.default
            .findById(commentId)
            .populate({ path: "author", select: "comments" });
        if (!comment) {
            return next(new errorModel_1.default("유효하지 않은 데이터이므로 댓글을 삭제할 수 없습니다.", 403));
        }
        // 댓글의 refType 에 참조된 문의, 피드백, 공지 모델 객체 찾기
        switch (comment.refType) {
            case "inquiry":
                refDoc = yield mongoose_1.default.model('Inquiry').findById(comment.refId);
                break;
            case "feedback":
                refDoc = yield mongoose_1.default.model('Feedback').findById(comment.refId);
                break;
            case "notice":
                refDoc = yield mongoose_1.default.model('Notice').findById(comment.refId);
                break;
            default:
                return next(new errorModel_1.default("유효하지 않은 참조 타입입니다.", 400));
        }
        if (!refDoc) {
            return next(new errorModel_1.default("참조된 문서를 찾을 수 없습니다.", 404));
        }
    }
    catch (err) {
        return next(new errorModel_1.default("댓글 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!comment) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 댓글을 삭제 할 수 없습니다.", 403));
    }
    if (comment.author._id.toString() !== userId) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 댓글을 삭제 할 수 없습니다.", 401));
    }
    const sess = yield mongoose_1.default.startSession();
    sess.startTransaction();
    // TODO 댓글 삭제 시, 자식 댓글도 cascade 로 삭제하기
    try {
        // 문의, 피드백, 공지에서 해당 댓글 삭제
        refDoc.comments = refDoc.comments.filter((c) => !c.equals(commentId));
        yield refDoc.save({ session: sess });
        // 유저의 댓글 목록에서 해당 댓글 삭제
        comment.author.comments = comment.author.comments.filter((c) => !c.equals(commentId));
        yield comment.author.save({ session: sess });
        yield comment.deleteOne({ session: sess });
        yield sess.commitTransaction();
    }
    catch (err) {
        console.log("댓글 삭제 중 에러: ", err);
        yield sess.abortTransaction();
        return next(new errorModel_1.default("댓글 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    finally {
        yield sess.endSession();
    }
    return res.status(204).json({ message: "댓글이 삭제되었습니다." });
});
exports.deleteComment = deleteComment;
