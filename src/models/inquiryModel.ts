import mongoose, {Schema} from "mongoose";
import {IUser} from "./userModel";

export interface IPopulatedInquiryUser extends IUser {
    _id: mongoose.Types.ObjectId;
}

export interface IInquiry {
    title: string;
    category: "machine" | "reservation" | "room" | "etc";
    content: string;
    creator: mongoose.Types.ObjectId;
    createdAt: Date;
    comment: mongoose.Types.ObjectId;
}

const inquirySchema = new mongoose.Schema<IInquiry>({
    title: {
        type: String,
        required: true,
        minlength: 1,
    },
    category: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 400,
    },
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    comment: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: "Comment",
    },
});

const InquiryModel = mongoose.model<IInquiry>("Inquiry", inquirySchema);

export default InquiryModel;