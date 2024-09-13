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
    countOfLaser?: number; // student
    refreshTokenId: mongoose.Types.ObjectId; // 모든 유저
    inquiries?: mongoose.Types.ObjectId[]; // student
    feedback: mongoose.Types.ObjectId[];
    lab?: string; // manager
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
    countOfLaser: {
        type: Number,
        default: 4,
        required: function (this: IUser) {
            return this.role === "student";
        },
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
});

userSchema.plugin(uniqueValidator);

userSchema.pre('save', function (next) {
    const user = this as IUser;

    if (user.role === "admin") {
        delete user.passQuiz;
        delete user.studio;
        delete user.year;
        delete user.countOfWarning;
        delete user.countOfLaser;
        delete user.inquiries;
        delete user.lab;
    } else if (user.role === "manager") {
        delete user.countOfWarning;
        delete user.countOfLaser;
        delete user.inquiries;
    } else if (user.role === "student") {
        delete user.lab;
    }
    next();
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
