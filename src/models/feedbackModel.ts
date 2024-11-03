import mongoose, {Document, Schema} from "mongoose";
import UserModel, {IUser} from "./userModel";
import HttpError from "./errorModel";
import CommentModel from "./commentModel";

export interface IPopulatedFeedbackUser extends IUser {
    _id: mongoose.Types.ObjectId;
}

export interface IFeedback extends Document {
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

const feedbackSchema = new mongoose.Schema<IFeedback>({
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
        ref: "User"
    }],
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
});

// 피드백 삭제 시, 수행
feedbackSchema.pre<IFeedback>("deleteOne", {document: true, query: false}, async function (next) {
    const feedback = this;

    try {
        const session = feedback.$session();

        // 피드백 작성 유저를 찾고 유저의 피드백 내역에서 해당 피드백 삭제
        const user = await UserModel.findById(feedback.creator).session(session);
        if (!user) {
            next(new HttpError("유저 정보를 찾을 수 없습니다", 404) as mongoose.CallbackError);
        }

        if (user && user.feedback) {
            user.feedback = user.feedback.filter(f => !f.equals(feedback._id as mongoose.Types.ObjectId));
            await user.save({session});
        }

        // 해당 피드백에 포함된 댓글 삭제
        await CommentModel.deleteMany({refId: feedback._id, refType: "feedback"}).session(session);

        next();
    } catch (err) {
        next(err as mongoose.CallbackError);
    }
});

const FeedbackModel = mongoose.model<IFeedback>("Feedback", feedbackSchema);

export default FeedbackModel;