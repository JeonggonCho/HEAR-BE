import nodemailer from "nodemailer";

const EMAIL_ACCOUNT = process.env.EMAIL_ACCOUNT;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const sendEmail = async (email: string, subject: string, content: string) => {
    const transporter = nodemailer.createTransport({
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
};

export default sendEmail;