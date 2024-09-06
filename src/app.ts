import express, {NextFunction, Request, Response} from "express";
import bodyParser from "body-parser";
import * as mongoose from "mongoose";
import dotenv from "dotenv";

import usersRoutes from "./routes/usersRoutes";
import inquiriesRoutes from "./routes/inquiriesRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import noticesRoutes from "./routes/noticesRoutes";
import HttpError from "./models/errorModel";

dotenv.config();

const DB_URI = process.env.DB_URI as string;
const PORT = process.env.PORT;
const clientOptions = {serverApi: {version: "1" as const, strict: true, deprecationErrors: true}};

const app = express();

// body 파싱 미들웨어
app.use(bodyParser.json());

// CORS 에러 해결
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    next();
});

// 라우트 처리
app.use("/api/users", usersRoutes);
app.use("/api/inquiries", inquiriesRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notices", noticesRoutes);
// app.use("/api/reservations");
// app.use("/api/quiz");

app.use((req, res, next) => {
    const error = new HttpError("라우트를 찾지 못했습니다", 404);
    throw error;
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        console.log(error);
        return next(error);
    }
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    console.log(error);
    res.status(statusCode);
    res.json({message: error.message || "알 수 없는 오류 발생"});
});

// DB 연결
mongoose
    .connect(DB_URI, clientOptions)
    .then(() => {
        app.listen(8080, () => {
            console.log(`서버 작동 중`);
        });
    })
    .catch((err) => {
        console.log(err);
    });