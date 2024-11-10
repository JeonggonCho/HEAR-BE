import mongoose from "mongoose";
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
});

const QuestionModel = mongoose.model<EducationType>("Question", questionSchema);
const EducationSettingsModel = mongoose.model<IEducationSettings>("EducationSettings", educationSettingsSchema);

export {QuestionModel, EducationSettingsModel};