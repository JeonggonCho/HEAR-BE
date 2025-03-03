"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const verificationCodeSchema = new mongoose_1.default.Schema({
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
const VerificationCodeModel = mongoose_1.default.model("VerificationCode", verificationCodeSchema);
exports.default = VerificationCodeModel;
