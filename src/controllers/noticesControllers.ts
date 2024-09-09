import {NextFunction, Response} from "express";
import {CustomRequest} from "../middlewares/checkAuth";
import {validationResult} from "express-validator";
import HttpError from "../models/errorModel";
import UserModel from "../models/userModel";
import NoticeModel from "../models/noticeModel";

// 공지 등록
const newNotice = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }

    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {title, content} = req.body;
    const {userId, role} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 공지를 등록 할 수 없습니다.", 403));
    }

    // 조교만 공지 등록 가능
    if (role !== "manager") {
        return next(new HttpError("조교만 공지 등록이 가능합니다.", 403));
    }

    let user;
    try {
        user = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("공지 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!user) {
        return next(new HttpError("유효하지 않은 데이터이므로 공지를 등록 할 수 없습니다.", 403));
    }

    const createdNotice = new NoticeModel({
        title,
        content,
    });

    try {
        await createdNotice.save();
    } catch (err) {
        return next(new HttpError("공지 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(201).json({data: {noticeId: createdNotice._id}});
};

// 공지 목록 조회
const getNotices = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 공지 목록을 조회 할 수 없습니다.", 403));
    }

    let notices;
    try {
        notices = await NoticeModel.find().sort({createdAt: -1});
    } catch (err) {
        return next(new HttpError("공지 목록 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (notices.length === 0) {
        return res.status(200).json({data: []});
    }

    const data = notices.map((n) => {
        return {
            _id: n._id,
            title: n.title,
            createdAt: n.createdAt,
        };
    });

    return res.status(200).json({data});
};

// 공지 디테일 조회
const getNotice = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {noticeId} = req.params;

    if (!noticeId) {
        return next(new HttpError("유효하지 않은 데이터이므로 공지를 조회 할 수 없습니다.", 403));
    }

    let notice;
    try {
        notice = await NoticeModel.findById(noticeId);
    } catch (err) {
        return next(new HttpError("공지 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!notice) {
        return next(new HttpError("유효하지 않은 데이터이므로 공지를 조회 할 수 없습니다.", 403));
    }

    res.status(200).json({
        data: {
            title: notice.title,
            content: notice.content,
            createdAt: notice.createdAt,
        },
    });
};

// 공지 수정
const updateNotice = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("유효하지 않은 입력 데이터를 전달하였습니다.", 422));
    }
};

// 공지 삭제
const deleteNotice = async (req: CustomRequest, res: Response, next: NextFunction) => {

};

export {newNotice, getNotices, getNotice, updateNotice, deleteNotice};