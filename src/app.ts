import express, {NextFunction, Request, Response} from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Agenda from "agenda";
import cors from "cors";
import usersRoutes from "./routes/usersRoutes";
import inquiriesRoutes from "./routes/inquiriesRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import noticesRoutes from "./routes/noticesRoutes";
import machinesRoutes from "./routes/machinesRoutes";
import reservationsRoutes from "./routes/reservationsRoutes";
import reservationSettingsRoutes from "./routes/reservationSettingsRoutes";
import commentsRoutes from "./routes/commentsRoutes";
import educationRoutes from "./routes/educationRoutes";

import HttpError from "./models/errorModel";

dotenv.config();

const DB_URI = process.env.DB_URI as string;
const PORT = process.env.PORT;

const app = express();

// body 파싱 미들웨어
app.use(bodyParser.json());

// 허용할 도메인 리스트
const allowedOrigins = ["http://localhost:5173", "https://hyue-hear.com"];

// CORS 미들웨어 설정
app.use(cors({
    origin: allowedOrigins, // 허용할 도메인
    methods: ["GET", "POST", "PATCH", "DELETE",], // 허용할 HTTP 메소드
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization",], // 허용할 HTTP 헤더
    credentials: true  // 인증 정보 (쿠키, Authorization 헤더 등) 포함
}));

// 라우트 처리
app.use("/users", usersRoutes);
app.use("/inquiries", inquiriesRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/notices", noticesRoutes);
app.use("/comments", commentsRoutes);
app.use("/machines", machinesRoutes)
app.use("/reservations", reservationsRoutes);
app.use("/reservationSettings", reservationSettingsRoutes);
app.use("/education", educationRoutes);

app.use((req, res, next) => {
    return next(new HttpError("라우트를 찾지 못했습니다", 404));
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        console.log(error);
        return;
    }
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    console.log(error);
    res.status(statusCode);
    res.json({message: error.message || "알 수 없는 오류 발생"});
});

const startServer = async () => {
    try {
        // Mongoose로 MongoDB 연결
        const clientOptions = {serverApi: {version: "1" as const, strict: true, deprecationErrors: true}};
        await mongoose.connect(DB_URI, clientOptions);
        console.log("Mongoose와 MongoDB 연결 성공");

        // 서버 시작
        app.listen(PORT, () => {
            console.log(`서버가 ${PORT}번 포트에서 작동`);
        });

        // Agenda 설정 (Mongoose의 MongoDB 연결 사용)
        const agenda = new Agenda({db: {address: DB_URI, collection: 'agendaJobs'}});

        // Agenda 작업 정의
        agenda.define('reset count of laser per week', async () => {
            const User = mongoose.model('User');
            await User.updateMany({}, {countOfLaserPerWeek: 4});
            console.log('레이저 커팅기 일주일 예약 가능 횟수 필드 초기화 완료');
        });

        agenda.define('reset count of laser per day', async () => {
            const User = mongoose.model('User');
            await User.updateMany({}, {countOfLaserPerDay: 2});
            console.log('레이저 커팅기 오늘 예약 가능 횟수 필드 초기화 완료');
        });

        // Agenda 작업 스케줄링
        await agenda.start();
        await agenda.every('0 0 * * 1', 'reset count of laser per week'); // 매주 월요일 00:00
        await agenda.every('0 0 * * *', 'reset count of laser per day'); // 매일 00:00 (자정)
    } catch (err) {
        console.error("서버 시작 중 오류 발생:", err);
    }
};

startServer();