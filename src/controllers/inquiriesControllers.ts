import {NextFunction, Response} from "express";
import {validationResult} from "express-validator";
import mongoose from "mongoose";

import UserModel from "../models/userModel";
import InquiryModel, {IPopulatedInquiryUser} from "../models/inquiryModel";
import HttpError from "../models/errorModel";

import {CustomRequest} from "../middlewares/checkAuth";

// 문의 등록
const newInquiry = async (req: CustomRequest, res: Response, next: NextFunction) => {
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
    const {userId, role} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 등록 할 수 없습니다.", 403));
    }

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
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdInquiry.save({session: sess});

        if (!user.inquiries) {
            user.inquiries = [];
        }
        user.inquiries.push(createdInquiry._id);
        
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("문의 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(201).json({data: {inquiryId: createdInquiry._id}});
};

// 문의 목록 조회
const getInquiries = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId, role} = req.userData;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의 목록을 조회 할 수 없습니다.", 403));
    }

    if (!role) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의 목록을 조회 할 수 없습니다.", 403));
    }

    let inquiries: any[];
    try {
        if (role === "student") {
            inquiries = await InquiryModel.find({creator: userId}).sort({createdAt: -1}).populate<{
                creator: IPopulatedInquiryUser
            }>("creator");
        } else if (role === "manager" || role === "admin") {
            inquiries = await InquiryModel.find().sort({createdAt: -1}).populate<{
                creator: IPopulatedInquiryUser
            }>("creator");
        } else {
            inquiries = [];
        }
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
        };
    });

    return res.status(200).json({data});
};

// 문의 디테일 조회
const getInquiry = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId, role} = req.userData;
    const {inquiryId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 조회 할 수 없습니다.", 403));
    }

    if (!role) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 조회 할 수 없습니다.", 403));
    }

    if (!inquiryId) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 조회 할 수 없습니다.", 403));
    }

    let inquiry;
    try {
        inquiry = await InquiryModel.findById(inquiryId).populate<{ creator: IPopulatedInquiryUser }>("creator");
    } catch (err) {
        return next(new HttpError("문의 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!inquiry) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 조회 할 수 없습니다.", 403));
    }

    if (!(["manager", "admin", "student"]).includes(role)) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 조회 할 수 없습니다.", 401));
    }

    res.status(200).json({
        data: {
            title: inquiry.title,
            category: inquiry.category,
            content: inquiry.content,
            creator: inquiry.creator.username,
            creatorId: inquiry.creator._id.toString(),
            createdAt: inquiry.createdAt,
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

    if (!req.body) {
        return next(new HttpError("데이터가 없어 요청을 처리할 수 없습니다. 다시 시도 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {inquiryId} = req.params;
    const {title, category, content} = req.body;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 수정 할 수 없습니다.", 403));
    }

    let updatedInquiry;
    try {
        updatedInquiry = await InquiryModel.findByIdAndUpdate(
            inquiryId,
            {title, category, content},
            {new: true},
        );
    } catch (err) {
        return next(new HttpError("문의 수정 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!updatedInquiry) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 수정 할 수 없습니다.", 403));
    }

    res.status(200).json({message: "공지가 수정되었습니다.", data: {inquiry: updatedInquiry}});
};

// 문의 삭제
const deleteInquiry = async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userData) {
        return next(new HttpError("인증 정보가 없어 요청을 처리할 수 없습니다. 다시 로그인 해주세요.", 401));
    }

    const {userId} = req.userData;
    const {inquiryId} = req.params;

    if (!userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 삭제 할 수 없습니다.", 403));
    }

    // 문의 조회
    let inquiry;
    try {
        inquiry = await InquiryModel.findById(inquiryId).populate<{ creator: IPopulatedInquiryUser }>("creator");
    } catch (err) {
        return next(new HttpError("문의 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 해당 문의가 없을 경우, 오류 발생시키기
    if (!inquiry) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 삭제 할 수 없습니다.", 403));
    }

    // 문의 작성자와 요청자가 다를 경우, 오류 발생시키기
    if (inquiry.creator._id.toString() !== userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 삭제 할 수 없습니다.", 401));
    }

    // 문의 삭제 시, 유저의 문의 목록에서도 삭제하기
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();

        if (inquiry.creator.role === "student" && inquiry.creator.inquiries) {
            inquiry.creator.inquiries = inquiry.creator.inquiries.filter(
                (id) => id.toString() !== inquiry._id.toString()
            );
            await inquiry.creator.save({session: sess});
        }

        await inquiry.deleteOne({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("문의 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    res.status(204).json({message: "문의가 삭제되었습니다."});
};

export {newInquiry, getInquiry, getInquiries, updateInquiry, deleteInquiry};