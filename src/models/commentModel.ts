import mongoose, {Document, Schema} from "mongoose";
import UserModel from "./userModel";
import HttpError from "./errorModel";

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

// 댓글 삭제 시, 수행
commentSchema.pre("deleteOne", {document: true, query: false}, async function (next) {
    const comment = this;

    try {
        // 현재 실행 중인 세션 가져오기
        const session = comment.$session();

        // 댓글 작성 유저를 찾고 유저의 댓글 내역에서 해당 댓글 삭제
        const user = await UserModel
            .findById(comment.author)
            .session(session);
        if (!user) {
            return next(new HttpError("유저 정보를 찾을 수 없습니다", 404) as mongoose.CallbackError);
        }

        if (user && user.comments) {
            user.comments = user.comments.filter(c => !c.equals(comment._id as mongoose.Types.ObjectId));
            await user.save({session});
        }

        next();
    } catch (err) {
        next(err as mongoose.CallbackError);
    }
});

const CommentModel = mongoose.model<IComment>("Comment", commentSchema);

export default CommentModel;