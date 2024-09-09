import mongoose, {Schema} from "mongoose";
import {IUser} from "./userModel";

export interface IPopulatedFeedbackUser extends IUser {
    _id: mongoose.Types.ObjectId;
}

interface IFeedback {
    title: string;
    category: "machine" | "reservation" | "room" | "etc";
    content: string;
    creator: mongoose.Types.ObjectId;
    createdAt: Date;
    comments: mongoose.Types.ObjectId[];
}

const feedbackSchema = new mongoose.Schema<IFeedback>({
    title: {
        type: String,
        required: true,
        minlength: 1,
    },
    category: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 400,
    },
    creator: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    comments: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Comment",
    }],
});

const FeedbackModel = mongoose.model<IFeedback>("Feedback", feedbackSchema);

export default FeedbackModel;