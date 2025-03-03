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
exports.deleteNotice = exports.updateNotice = exports.getNotice = exports.getLatestNotices = exports.getNotices = exports.newNotice = void 0;
const express_validator_1 = require("express-validator");
const errorModel_1 = __importDefault(require("../models/errorModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const noticeModel_1 = __importDefault(require("../models/noticeModel"));
const commentModel_1 = __importDefault(require("../models/commentModel"));
// 공지 등록
const newNotice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { title, content } = req.body;
    const { userId, role } = req.userData;
    // 조교 및 운영자 공지 등록 가능
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("조교만 공지 등록이 가능합니다.", 403));
    }
    let user;
    try {
        user = yield userModel_1.default.findById(userId);
    }
    catch (err) {
        return next(new errorModel_1.default("공지 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!user) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 공지를 등록 할 수 없습니다.", 403));
    }
    const createdNotice = new noticeModel_1.default({
        title,
        content,
    });
    try {
        yield createdNotice.save();
    }
    catch (err) {
        return next(new errorModel_1.default("공지 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(201).json({ data: { noticeId: createdNotice._id } });
});
exports.newNotice = newNotice;
// 공지 목록 조회
const getNotices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    let notices;
    try {
        notices = yield noticeModel_1.default
            .find()
            .sort({ createdAt: -1 });
    }
    catch (err) {
        return next(new errorModel_1.default("공지 목록 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (notices.length === 0) {
        return res.status(200).json({ data: [] });
    }
    const data = notices.map((n) => {
        return {
            _id: n._id,
            title: n.title,
            createdAt: n.createdAt,
            views: n.views,
            comments: n.comments.length,
        };
    });
    return res.status(200).json({ data });
});
exports.getNotices = getNotices;
// 최신 공지 가져오기
const getLatestNotices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    let latestNotices;
    try {
        latestNotices = yield noticeModel_1.default
            .find()
            .sort({ createdAt: -1 })
            .limit(4);
    }
    catch (err) {
        return next(new errorModel_1.default("최신 공지 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (latestNotices.length === 0) {
        return res.status(200).json({ data: [] });
    }
    const filteredLatestNotices = latestNotices.map((n) => ({
        noticeId: n._id,
        title: n.title
    }));
    return res.status(200).json({ data: filteredLatestNotices });
});
exports.getLatestNotices = getLatestNotices;
// 공지 디테일 조회
const getNotice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { userId } = req.userData;
    const { noticeId } = req.params;
    if (!noticeId) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 공지를 조회 할 수 없습니다.", 403));
    }
    let notice;
    try {
        notice = yield noticeModel_1.default.findById(noticeId);
    }
    catch (err) {
        return next(new errorModel_1.default("공지 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!notice) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 공지를 조회 할 수 없습니다.", 403));
    }
    // 공지사항 조회 수
    if (!notice.viewedBy.includes(userId)) {
        notice.views += 1;
        notice.viewedBy.push(userId);
        yield notice.save();
    }
    let comments = [];
    try {
        comments = yield commentModel_1.default
            .find({ refId: notice._id, refType: "notice" })
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
        return next(new errorModel_1.default("공지 댓글 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(200).json({
        data: {
            notice: {
                _id: notice._id,
                title: notice.title,
                content: notice.content,
                createdAt: notice.createdAt,
                views: notice.views,
                comments: notice.comments.length,
            },
            comments: comments,
        },
    });
});
exports.getNotice = getNotice;
// 공지 수정
const updateNotice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return next(new errorModel_1.default("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { noticeId } = req.params;
    const { title, content } = req.body;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("조교만 공지 수정이 가능합니다.", 403));
    }
    let updatedNotice;
    try {
        updatedNotice = yield noticeModel_1.default.findByIdAndUpdate(noticeId, { title, content }, { new: true });
    }
    catch (err) {
        return next(new errorModel_1.default("공지 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    if (!updatedNotice) {
        return next(new errorModel_1.default("유효하지 않은 데이터이므로 공지를 수정 할 수 없습니다.", 403));
    }
    return res.status(200).json({ message: "공지가 수정되었습니다.", data: { notice: updatedNotice } });
});
exports.updateNotice = updateNotice;
// 공지 삭제
const deleteNotice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.userData) {
        return next(new errorModel_1.default("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }
    const { role } = req.userData;
    const { noticeId } = req.params;
    if (role !== "assistant" && role !== "admin") {
        return next(new errorModel_1.default("조교만 공지 삭제가 가능합니다.", 403));
    }
    try {
        yield noticeModel_1.default.findByIdAndDelete(noticeId);
    }
    catch (err) {
        return next(new errorModel_1.default("공지 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
    return res.status(204).json({ message: "공지가 삭제되었습니다." });
});
exports.deleteNotice = deleteNotice;
