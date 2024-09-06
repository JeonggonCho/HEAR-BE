import {CustomRequest} from "../middlewares/checkAuth";
import {NextFunction, Response} from "express";
import {validationResult} from "express-validator";
import HttpError from "../models/errorModel";
import UserModel from "../models/userModel";
import InquiryModel from "../models/inquiryModel";
import mongoose from "mongoose";

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
        return next(new HttpError("유효하지 않은 데이터이므로 로그인 할 수 없습니다.", 403));
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
const getInquiries = (req: CustomRequest, res: Response, next: NextFunction) => {

};

// 문의 디테일 조회
const getInquiry = (req: CustomRequest, res: Response, next: NextFunction) => {

};

// 문의 삭제
const deleteInquiry = (req: CustomRequest, res: Response, next: NextFunction) => {

};

export {newInquiry, getInquiry, getInquiries, deleteInquiry};