import mongoose, {Document, Schema} from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import InquiryModel from "./inquiryModel";
import FeedbackModel from "./feedbackModel";
import CommentModel from "./commentModel";
import {
    CncReservationModel,
    HeatReservationModel,
    LaserReservationModel,
    PrinterReservationModel,
    SawReservationModel,
    VacuumReservationModel
} from "./reservationModel";
import RefreshTokenModel from "./refreshTokenModel";

export interface IUser extends Document {
    username: string; // 모든 유저
    email: string; // 모든 유저
    password: string; // 모든 유저
    role: "admin" | "student" | "manager"; // 모든 유저
    passQuiz?: boolean; // student
    studio?: string; // student
    year?: "1" | "2" | "3" | "4" | "5"; // student
    tel: string; // 모든 유저
    studentId: string; // 모든 유저
    countOfWarning?: number; // student
    countOfLaserPerWeek: number; // 모든 유저
    countOfLaserPerDay: number; // 모든 유저
    refreshTokenId: mongoose.Types.ObjectId; // 모든 유저
    inquiries?: mongoose.Types.ObjectId[]; // student
    feedback: mongoose.Types.ObjectId[];
    comments: mongoose.Types.ObjectId[];
    lab?: string; // manager
    createdAt?: Date; // 가입일
    updatedAt?: Date; // 마지막 수정일
}

const userSchema = new mongoose.Schema<IUser>({
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
        required: true,
    },
    passQuiz: {
        type: Boolean,
        required: function (this: IUser) {
            return this.role === "student";
        },
    },
    studio: {
        type: String,
        required: function (this: IUser) {
            return this.role === "student";
        },
    },
    year: {
        type: String,
        required: function (this: IUser) {
            return this.role === "student";
        },
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
        required: function (this: IUser) {
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
        type: Schema.Types.ObjectId,
        required: true,
        ref: "RefreshToken",
    },
    inquiries: [{
        type: Schema.Types.ObjectId,
        required: function (this: IUser) {
            return this.role === "student";
        },
        ref: "Inquiry",
    }],
    feedback: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Feedback",
    }],
    comments: [{
        type: Schema.Types.ObjectId,
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
}, {timestamps: true});

userSchema.plugin(uniqueValidator);

// 유저 삭제 시, 수행
userSchema.pre<IUser>("deleteOne", {document: true, query: false}, async function (next) {
    const user = this;

    const sess = await mongoose.startSession();
    sess.startTransaction();

    try {
        // 예약 내역 삭제
        await LaserReservationModel.deleteMany({userId: user._id}).session(sess);
        await PrinterReservationModel.deleteMany({userId: user._id}).session(sess);
        await SawReservationModel.deleteMany({userId: user._id}).session(sess);
        await VacuumReservationModel.deleteMany({userId: user._id}).session(sess);
        await HeatReservationModel.deleteMany({userId: user._id}).session(sess);
        await CncReservationModel.deleteMany({userId: user._id}).session(sess);

        // 문의, 피드백, 댓글 삭제
        await InquiryModel.deleteMany({creator: user._id}).session(sess);
        await FeedbackModel.deleteMany({creator: user._id}).session(sess);
        await CommentModel.deleteMany({author: user._id}).session(sess);

        // 리프레시 토큰 삭제
        await RefreshTokenModel.deleteMany({userId: user._id}).session(sess);

        await sess.commitTransaction();
        next();
    } catch (err) {
        await sess.abortTransaction();
        next(err as mongoose.CallbackError);
    } finally {
        await sess.endSession();
    }
});

// 유저 정보 업데이트 및 생성 시, 수행
userSchema.pre<IUser>('save', function (next) {
    const user = this;

    if (user.isModified('role')) {
        if (user.role !== "student") {
            // 학생이 아닌 경우 필드 제거
            user.set({
                passQuiz: undefined,
                studio: undefined,
                year: undefined,
                countOfWarning: undefined,
                inquiries: undefined
            });
        }

        // 역할에 맞는 필드 설정
        if (user.role === "admin") {
            // Admin 역할에 필요한 필드 없음
        } else if (user.role === "manager") {
            user.lab = user.lab || '';
        } else if (user.role === "student") {
            user.passQuiz = user.passQuiz ?? false;
            user.studio = user.studio || '';
            user.year = user.year || '1';
            user.countOfWarning = user.countOfWarning ?? 0;
            user.inquiries = user.inquiries || [];
        }
    }

    next();
});


const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
