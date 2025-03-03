"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const userModel_1 = __importDefault(require("./userModel"));
const errorModel_1 = __importDefault(require("./errorModel"));
const commentSchema = new mongoose_1.default.Schema({
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    refId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        refPath: "refType",
    },
    refType: {
        type: String,
        enum: ["inquiry", "feedback", "notice"],
        required: true,
    },
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    },
    likes: {
        type: Number,
        default: 0,
    },
    likedBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        }],
    childComments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Comment",
        }],
}, { timestamps: true });
// 댓글 삭제 시, 수행
commentSchema.pre("deleteOne", { document: true, query: false }, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const comment = this;
        try {
            // 현재 실행 중인 세션 가져오기
            const session = comment.$session();
            // 댓글 작성 유저를 찾고 유저의 댓글 내역에서 해당 댓글 삭제
            const user = yield userModel_1.default
                .findById(comment.author)
                .session(session);
            if (!user) {
                return next(new errorModel_1.default("유저 정보를 찾을 수 없습니다", 404));
            }
            if (user && user.comments) {
                user.comments = user.comments.filter(c => !c.equals(comment._id));
                yield user.save({ session });
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
});
const CommentModel = mongoose_1.default.model("Comment", commentSchema);
exports.default = CommentModel;
