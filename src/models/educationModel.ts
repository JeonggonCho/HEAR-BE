import mongoose, {Schema} from "mongoose";
import HttpError from "./errorModel";

export interface IShortAnswer {
    _id: string;
    questionType: "shortAnswer";
    question: string;
    explanation?: string;
    answer: string;
}

export interface ISingleChoice {
    _id: string;
    questionType: "singleChoice";
    question: string;
    explanation?: string;
    options: {
        optionId: string;
        content: string;
        isAnswer: boolean;
    }[];
}

export interface IMultipleChoice {
    _id: string;
    questionType: "multipleChoice";
    question: string;
    explanation?: string;
    options: {
        optionId: string;
        content: string;
        isAnswer: boolean;
    }[];
}

export type EducationType = IShortAnswer | ISingleChoice | IMultipleChoice;

interface IEducationSettings {
    startDate: Date;
    endDate: Date;
    status: boolean;
    cutOffPoint: number;
}

interface ITestResult {
    userId: mongoose.Types.ObjectId;
    questions: {
        questionId: mongoose.Types.ObjectId;
        myAnswer: string | string[];
        isCorrect: boolean;
    }[];
    isPassed: boolean;
}

const questionSchema = new mongoose.Schema<EducationType>({
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
        optionId: {type: String},
        content: {type: String},
        isAnswer: {type: Boolean},
    }],
    answer: {
        type: String,
        required: function () {
            return this.questionType === "shortAnswer";
        },
    },
});

questionSchema.pre<EducationType>("save", function (next) {
    if ((this.questionType === "singleChoice" || this.questionType === "multipleChoice") && !this.options.length) {
        return next(new HttpError("선택형 유형은 옵션이 필요합니다", 404));
    }
    next();
});

const educationSettingsSchema = new mongoose.Schema<IEducationSettings>({
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

const testResultSchema = new mongoose.Schema<ITestResult>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    questions: [{
        questionId: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        myAnswer: {
            type: Schema.Types.Mixed,
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


const QuestionModel = mongoose.model<EducationType>("Question", questionSchema);
const EducationSettingsModel = mongoose.model<IEducationSettings>("EducationSettings", educationSettingsSchema);
const TestResultModel = mongoose.model<ITestResult>("TestResult", testResultSchema);

export {QuestionModel, EducationSettingsModel, TestResultModel};