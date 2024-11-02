import mongoose, {Document, Schema} from "mongoose";

export interface INotice extends Document {
    title: string;
    content: string;
    createdAt: Date;
    comments: mongoose.Types.ObjectId[];
    views: number;
    viewedBy: mongoose.Types.ObjectId[];
}

const noticeSchema = new mongoose.Schema<INotice>({
    title: {
        type: String,
        required: true,
        minlength: 1,
    },
    content: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 400,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    comments: [{
        type: Schema.Types.ObjectId,
        required: true,
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
});

const NoticeModel = mongoose.model<INotice>("Notice", noticeSchema);

export default NoticeModel;