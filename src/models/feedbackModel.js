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
const commentModel_1 = __importDefault(require("./commentModel"));
const feedbackSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
    },
    category: {
        type: String,
        required: true,
        enum: ["good", "bad", "suggest", "etc"],
    },
    content: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 400,
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    comments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            default: null,
            ref: "Comment",
        }],
    views: {
        type: Number,
        default: 0,
    },
    viewedBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User"
        }],
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User"
        }],
});
// 피드백 삭제 시, 수행
feedbackSchema.pre("deleteOne", { document: true, query: false }, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const feedback = this;
        try {
            const session = feedback.$session();
            // 피드백 작성 유저를 찾고 유저의 피드백 내역에서 해당 피드백 삭제
            const user = yield userModel_1.default
                .findById(feedback.creator)
                .session(session);
            if (!user) {
                next(new errorModel_1.default("유저 정보를 찾을 수 없습니다", 404));
            }
            if (user && user.feedback) {
                user.feedback = user.feedback.filter(f => !f.equals(feedback._id));
                yield user.save({ session });
            }
            // 해당 피드백에 포함된 댓글 삭제
            const comments = yield commentModel_1.default
                .find({ refId: feedback._id, refType: "feedback" })
                .session(session);
            for (const comment of comments) {
                yield comment.deleteOne({ session });
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
});
const FeedbackModel = mongoose_1.default.model("Feedback", feedbackSchema);
exports.default = FeedbackModel;
