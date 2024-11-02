import mongoose, {Document, Schema} from "mongoose";
import {IUser} from "./userModel";

export interface IPopulatedInquiryUser extends IUser {
    _id: mongoose.Types.ObjectId;
}

export interface IInquiry extends Document {
    title: string;
    category: "machine" | "reservation" | "room" | "etc";
    content: string;
    creator: mongoose.Types.ObjectId;
    createdAt: Date;
    comments: mongoose.Types.ObjectId[];
    views: number;
    viewedBy: mongoose.Types.ObjectId[];
    likes: number;
    likedBy: mongoose.Types.ObjectId[];
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
    comments: [{
        type: Schema.Types.ObjectId,
        default: null,
        ref: "Comment",
    }],
    views: {
        type: Number,
        default: 0,
    },
    viewedBy: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    likes: {
        type: Number,
        default: 0,
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
});

const InquiryModel = mongoose.model<IInquiry>("Inquiry", inquirySchema);

export default InquiryModel;