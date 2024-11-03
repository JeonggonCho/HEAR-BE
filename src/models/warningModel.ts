import mongoose, {Schema} from "mongoose";

export interface IWarning {
    userId: mongoose.Types.ObjectId;
    message: string;
    createdAt?: Date;
}

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

const WarningModel = mongoose.model<IWarning>("Warning", warningSchema);

export default WarningModel;