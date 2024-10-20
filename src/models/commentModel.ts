import mongoose, {Schema} from "mongoose";

interface IComment {
    content: string;
    author: mongoose.Types.ObjectId;
    refId: mongoose.Types.ObjectId;
    refType: "inquiry" | "feedback";
    parentId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new mongoose.Schema<IComment>({
    content: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    refId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    refType: {
        type: String,
        enum: ["inquiry", "feedback",],
        required: true,
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    },
}, {timestamps: true});

const CommentModel = mongoose.model<IComment>("Comment", commentSchema);

export default CommentModel;