"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const EMAIL_ACCOUNT = process.env.EMAIL_ACCOUNT;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const sendEmail = (email, subject, content) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: `${EMAIL_ACCOUNT}`,
            pass: `${EMAIL_PASSWORD}`,
        },
    });
    let mailOptions = {
        from: `${EMAIL_ACCOUNT}`, // 송신 이메일
        to: email, // 수신 이메일
        subject: subject, // 메일 제목
        html: content, // 메일 내용
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("이메일 전송 중 오류 발생: ", error);
        }
        // console.log("이메일 전송 완료: ", info);
    });
});
exports.default = sendEmail;
