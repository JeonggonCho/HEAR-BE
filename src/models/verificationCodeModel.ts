import mongoose from "mongoose";

interface IVerificationCode {
    email: string;
    code: string;
    verified: boolean;
    createdAt: Date;
}

const verificationCodeSchema = new mongoose.Schema<IVerificationCode>({
    email: {
        type: String,
        required: true,
        match: [/^[a-zA-Z0-9._%+-]+@hanyang\.ac\.kr$/, "이메일은 @hanyang.ac.kr 도메인이어야 합니다."],
    },
    code: {
        type: String,
        required: true,
        match: [/^\d{6}$/, "인증 코드는 6자리 숫자여야 합니다."],
    },
    verified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "1h", // 1시간 후 만료
    },
});

const VerificationCodeModel = mongoose.model<IVerificationCode>("VerificationCodeModel", verificationCodeSchema);

export default VerificationCodeModel;