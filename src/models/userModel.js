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
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const inquiryModel_1 = __importDefault(require("./inquiryModel"));
const feedbackModel_1 = __importDefault(require("./feedbackModel"));
const commentModel_1 = __importDefault(require("./commentModel"));
const reservationModel_1 = require("./reservationModel");
const refreshTokenModel_1 = __importDefault(require("./refreshTokenModel"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "student",
        enum: ["admin", "student", "assistant"],
        required: true,
    },
    passEducation: {
        type: Boolean,
        required: function () {
            return this.role === "student";
        },
    },
    studio: {
        type: String,
        required: function () {
            return this.role === "student";
        },
    },
    year: {
        type: String,
        required: function () {
            return this.role === "student";
        },
        enum: ["1", "2", "3", "4", "5"],
    },
    tel: {
        type: String,
        required: true,
    },
    studentId: {
        type: String,
        required: true,
    },
    countOfWarning: {
        type: Number,
        default: 0,
        required: function () {
            return this.role === "student";
        },
    },
    countOfLaserPerWeek: {
        type: Number,
        default: 4,
        required: true,
    },
    countOfLaserPerDay: {
        type: Number,
        default: 2,
        required: true,
    },
    refreshTokenId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "RefreshToken",
    },
    inquiries: [{
            type: mongoose_1.Schema.Types.ObjectId,
            required: function () {
                return this.role === "student";
            },
            ref: "Inquiry",
        }],
    feedback: [{
            type: mongoose_1.Schema.Types.ObjectId,
            required: true,
            ref: "Feedback",
        }],
    comments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            required: true,
            ref: "Comment",
        }],
    lab: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true,
    }
}, { timestamps: true });
userSchema.plugin(mongoose_unique_validator_1.default);
// 유저 삭제 시, 수행
userSchema.pre("deleteOne", { document: true, query: false }, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const session = user.$session();
        try {
            // 예약 내역 삭제
            yield reservationModel_1.LaserReservationModel
                .deleteMany({ userId: user._id })
                .session(session);
            yield reservationModel_1.PrinterReservationModel
                .deleteMany({ userId: user._id })
                .session(session);
            yield reservationModel_1.SawReservationModel
                .deleteMany({ userId: user._id })
                .session(session);
            yield reservationModel_1.VacuumReservationModel
                .deleteMany({ userId: user._id })
                .session(session);
            yield reservationModel_1.HeatReservationModel
                .deleteMany({ userId: user._id })
                .session(session);
            yield reservationModel_1.CncReservationModel
                .deleteMany({ userId: user._id })
                .session(session);
            // 문의, 피드백, 댓글 삭제
            const inquiries = yield inquiryModel_1.default
                .find({ creator: user._id })
                .session(session);
            for (const inquiry of inquiries) {
                yield inquiry.deleteOne({ session });
            }
            const feedback = yield feedbackModel_1.default
                .find({ creator: user._id })
                .session(session);
            for (const feed of feedback) {
                yield feed.deleteOne({ session });
            }
            const comments = yield commentModel_1.default
                .find({ author: user._id })
                .session(session);
            for (const comment of comments) {
                yield comment.deleteOne({ session });
            }
            // 리프레시 토큰 삭제
            yield refreshTokenModel_1.default.deleteMany({ userId: user._id }).session(session);
            next();
        }
        catch (err) {
            next(err);
        }
    });
});
// 유저 정보 업데이트 및 생성 시, 수행
userSchema.pre('save', function (next) {
    var _a, _b;
    const user = this;
    if (user.isModified('role')) {
        if (user.role !== "student") {
            // 학생이 아닌 경우 필드 제거
            user.set({
                passEducation: undefined,
                studio: undefined,
                year: undefined,
                countOfWarning: undefined,
                inquiries: undefined
            });
        }
        // 역할에 맞는 필드 설정
        if (user.role === "admin") {
            // Admin 역할에 필요한 필드 없음
        }
        else if (user.role === "assistant") {
            user.lab = user.lab || '';
        }
        else if (user.role === "student") {
            user.passEducation = (_a = user.passEducation) !== null && _a !== void 0 ? _a : false;
            user.studio = user.studio || '';
            user.year = user.year || '1';
            user.countOfWarning = (_b = user.countOfWarning) !== null && _b !== void 0 ? _b : 0;
            user.inquiries = user.inquiries || [];
        }
    }
    next();
});
const UserModel = mongoose_1.default.model("User", userSchema);
exports.default = UserModel;
