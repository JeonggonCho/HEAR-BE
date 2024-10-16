import mongoose, {Document, Schema} from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

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
    lab?: string; // manager
    createdAt?: Date; // 가입일
    updatedAt?: Date; // 마지막 수정일
}

export interface IWarning {
    userId: mongoose.Types.ObjectId;
    message: string;
    createdAt?: Date;
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
    lab: {
        type: String,
        required: function (this: IUser) {
            return this.role === "manager";
        },
    },
}, {timestamps: true});

userSchema.plugin(uniqueValidator);

userSchema.pre<IUser>('save', function (next) {
    const user = this;

    if (user.role === "admin") {
        // Admin에게 필요하지 않은 필드 삭제
        delete user.passQuiz;
        delete user.studio;
        delete user.year;
        delete user.countOfWarning;
        delete user.inquiries;
        delete user.lab;
    } else if (user.role === "manager") {
        // Manager에게 필요하지 않은 필드 삭제
        delete user.countOfWarning;
        delete user.inquiries;
    } else if (user.role === "student") {
        // Student에게 필요하지 않은 필드 삭제
        delete user.lab;
    }

    next();
});

const warningSchema = new mongoose.Schema<IWarning>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    message: {
        type: String,
        required: true,
    },
}, {timestamps: true});

const UserModel = mongoose.model<IUser>("User", userSchema);
const WarningModel = mongoose.model<IWarning>("Warning", warningSchema);

export {UserModel, WarningModel};
