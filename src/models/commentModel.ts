import mongoose, {Document, Schema} from "mongoose";

interface IComment extends Document {
    content: string;
    author: mongoose.Types.ObjectId;
    refId: mongoose.Types.ObjectId;
    refType: "inquiry" | "feedback" | "notice";
    parentId: mongoose.Types.ObjectId;
    likes: number;
    likedBy: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    childComments: mongoose.Types.ObjectId[];
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
        refPath: "refType",
    },
    refType: {
        type: String,
        enum: ["inquiry", "feedback", "notice"],
        required: true,
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    },
    likes: {
        type: Number,
        default: 0,
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    childComments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
    }],
}, {timestamps: true});

const CommentModel = mongoose.model<IComment>("Comment", commentSchema);

export default CommentModel;