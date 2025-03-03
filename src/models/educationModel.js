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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationResultModel = exports.EducationSettingsModel = exports.QuestionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const errorModel_1 = __importDefault(require("./errorModel"));
const questionSchema = new mongoose_1.default.Schema({
    questionType: {
        type: String,
        enum: ["shortAnswer", "singleChoice", "multipleChoice"],
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    explanation: {
        type: String,
    },
    options: [{
            optionId: { type: String },
            content: { type: String },
            isAnswer: { type: Boolean },
        }],
    answer: {
        type: String,
        required: function () {
            return this.questionType === "shortAnswer";
        },
    },
});
questionSchema.pre("save", function (next) {
    if ((this.questionType === "singleChoice" || this.questionType === "multipleChoice") && !this.options.length) {
        return next(new errorModel_1.default("선택형 유형은 옵션이 필요합니다", 404));
    }
    next();
});
const educationSettingsSchema = new mongoose_1.default.Schema({
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
    cutOffPoint: {
        type: Number,
        default: 0,
    },
});
const educationResultSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    questions: [{
            questionId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Question",
                required: true,
            },
            myAnswer: {
                type: mongoose_1.Schema.Types.Mixed,
                required: true,
            },
            isCorrect: {
                type: Boolean,
                required: true,
            },
        }],
    isPassed: {
        type: Boolean,
        required: true,
    }
});
const QuestionModel = mongoose_1.default.model("Question", questionSchema);
exports.QuestionModel = QuestionModel;
const EducationSettingsModel = mongoose_1.default.model("EducationSettings", educationSettingsSchema);
exports.EducationSettingsModel = EducationSettingsModel;
const EducationResultModel = mongoose_1.default.model("EducationResult", educationResultSchema);
exports.EducationResultModel = EducationResultModel;
