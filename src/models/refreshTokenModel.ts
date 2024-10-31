import mongoose, {Schema} from "mongoose";

interface IRefreshToken {
    token: string;
    createdAt: Date;
    userId: mongoose.Types.ObjectId;
}

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        expires: "14d",
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
});

const RefreshTokenModel = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export default RefreshTokenModel;