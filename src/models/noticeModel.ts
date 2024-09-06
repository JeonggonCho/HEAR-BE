import mongoose from "mongoose";

interface INotice {

}

const noticeSchema = new mongoose.Schema<INotice>({});

const noticeModel = mongoose.model<INotice>("Notice", noticeSchema);

export default noticeModel;