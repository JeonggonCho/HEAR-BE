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

    const {title, category, content} = req.body;
    const {userId} = req.userData;

    // id로 유저 조회
    let user;
    try {
        user = await UserModel.findById(userId);
    } catch (err) {
        return next(new HttpError("문의 등록 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 유저 없을 경우, 오류 발생
    if (!user) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 생성 할 수 없습니다.", 403));
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
    const {userId} = req.userData;

    let inquiries;
    try {
        inquiries = await InquiryModel.find({creator: userId}).sort({createdAt: -1}).populate<{
            creator: IPopulatedInquiryUser
        }>("creator");
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
            answer: i.comments.length > 0,
            creator: i.creator.username,
            createdAt: i.createdAt,
        };
    });

    return res.status(200).json({data: data});
};

// 문의 디테일 조회
const getInquiry = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {userId} = req.userData;
    const {inquiryId} = req.params;

    let inquiry;
    try {
        inquiry = await InquiryModel.findById(inquiryId).populate<{ creator: IPopulatedInquiryUser }>("creator");
    } catch (err) {
        return next(new HttpError("문의 조회 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    if (!inquiry) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 조회 할 수 없습니다.", 403));
    }

    if (inquiry.creator._id.toString() !== userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 조회 할 수 없습니다.", 401));
    }

    res.status(200).json({
        data: {
            title: inquiry.title,
            category: inquiry.category,
            content: inquiry.content,
            creator: inquiry.creator.username,
            createdAt: inquiry.createdAt,
        },
    });
};

// 문의 삭제
const deleteInquiry = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {userId} = req.userData;
    const {inquiryId} = req.params;

    // 문의 조회
    let inquiry;
    try {
        inquiry = await InquiryModel.findById(inquiryId).populate<{ creator: IPopulatedInquiryUser }>("creator");
    } catch (err) {
        return next(new HttpError("문의 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }

    // 해당 문의가 없을 경우, 오류 발생시키기
    if (!inquiry) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 조회 할 수 없습니다.", 403));
    }

    // 문의 작성자와 요청자가 다를 경우, 오류 발생시키기
    if (inquiry.creator._id.toString() !== userId) {
        return next(new HttpError("유효하지 않은 데이터이므로 문의를 조회 할 수 없습니다.", 401));
    }

    // 문의 삭제 시, 유저의 문의 목록에서도 삭제하기
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();

        inquiry.creator.inquiries = inquiry.creator.inquiries.filter(
            (id) => id.toString() !== inquiry._id.toString()
        );

        await inquiry.creator.save({session: sess});
        await inquiry.deleteOne({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError("문의 삭제 중 오류가 발생하였습니다. 다시 시도해주세요.", 500));
    }
};

export {newInquiry, getInquiry, getInquiries, deleteInquiry};