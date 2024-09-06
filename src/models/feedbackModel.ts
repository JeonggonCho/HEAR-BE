import mongoose from "mongoose";

interface IFeedback {

}

const feedbackSchema = new mongoose.Schema<IFeedback>({});

const FeedbackModel = mongoose.model<IFeedback>("Feedback", feedbackSchema);

export default FeedbackModel;