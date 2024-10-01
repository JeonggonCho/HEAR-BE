import mongoose, {Schema} from "mongoose";

interface INotice {
    title: string;
    content: string;
    createdAt: Date;
    comments: mongoose.Types.ObjectId[];
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
});

const NoticeModel = mongoose.model<INotice>("Notice", noticeSchema);

export default NoticeModel;