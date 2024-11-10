import mongoose, {Document, Schema} from "mongoose";
import UserModel, {IUser} from "./userModel";
import CommentModel from "./commentModel";
import HttpError from "./errorModel";

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
        enum: ["machine", "reservation", "room", "etc"],
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

// 문의 삭제 시, 수행
inquirySchema.pre<IInquiry>("deleteOne", {document: true, query: false}, async function (next) {
    const inquiry = this;

    try {
        // 현재 실행 중인 세션 가져오기
        const session = inquiry.$session();

        // 문의를 작성한 유저를 찾고 유저의 문의 내역에서 해당 문의 삭제
        const user = await UserModel
            .findById(inquiry.creator)
            .session(session);
        if (!user) {
            return next(new HttpError("유저 정보를 찾을 수 없습니다", 404) as mongoose.CallbackError);
        }

        if (user && user.inquiries) {
            user.inquiries = user.inquiries.filter(i => !i.equals(inquiry._id as mongoose.Types.ObjectId));
            await user.save({session});
        }

        // 해당 문의에 포함된 댓글 삭제
        const comments = await CommentModel
            .find({refId: inquiry._id, refType: "inquiry"})
            .session(session);

        for (const comment of comments) {
            await comment.deleteOne({session});
        }

        next();
    } catch (err) {
        next(err as mongoose.CallbackError);
    }
});

const InquiryModel = mongoose.model<IInquiry>("Inquiry", inquirySchema);

export default InquiryModel;