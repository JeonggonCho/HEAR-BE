import mongoose, {Document, Schema} from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: "admin" | "student" | "manager";
    passQuiz: boolean;
    studio: string;
    year: "1" | "2" | "3" | "4" | "5";
    tel: string;
    studentId: string;
    countOfWarning: number;
    countOfLaser: number;
    refreshTokenId: mongoose.Types.ObjectId;
    inquiries: mongoose.Types.ObjectId[];
    feedback: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true
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
        required: true
    },
    passQuiz: {
        type: Boolean,
        required: true
    },
    studio: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    tel: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    countOfWarning: {
        type: Number,
        default: 0,
        required: true
    },
    countOfLaser: {
        type: Number,
        default: 4,
        required: true
    },
    refreshTokenId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "RefreshToken",
    },
    inquiries: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Inquiry"
    }],
    feedback: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Feedback"
    }],
});

userSchema.plugin(uniqueValidator);

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;