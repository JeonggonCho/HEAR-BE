import express from "express";
import bodyParser from "body-parser";
import * as mongoose from "mongoose";
import dotenv from "dotenv";

import usersRoutes from "./routes/usersRoutes";

dotenv.config();

const DB_URI = process.env.DB_URI as string;
const clientOptions = {serverApi: {version: "1" as const, strict: true, deprecationErrors: true}};

const app = express();

// body 파싱 미들웨어
app.use(bodyParser.json());

app.use();

// 라우트 처리
app.use("/api/users", usersRoutes);
app.use("/api/reservations");
app.use("/api/qna");
app.use("/api/quiz");

// DB 연결
mongoose
    .connect(DB_URI, clientOptions)
    .then(() => {
        app.listen(8080, () => {
            console.log("8080 포트 서버 작동 중");
        });
    })
    .catch((err) => {
        console.log(err);
    });