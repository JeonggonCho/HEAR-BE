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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const agenda_1 = __importDefault(require("agenda"));
const cors_1 = __importDefault(require("cors"));
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const inquiriesRoutes_1 = __importDefault(require("./routes/inquiriesRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
const noticesRoutes_1 = __importDefault(require("./routes/noticesRoutes"));
const machinesRoutes_1 = __importDefault(require("./routes/machinesRoutes"));
const reservationsRoutes_1 = __importDefault(require("./routes/reservationsRoutes"));
const reservationSettingsRoutes_1 = __importDefault(require("./routes/reservationSettingsRoutes"));
const commentsRoutes_1 = __importDefault(require("./routes/commentsRoutes"));
const educationRoutes_1 = __importDefault(require("./routes/educationRoutes"));
const errorModel_1 = __importDefault(require("./models/errorModel"));
dotenv_1.default.config();
const DB_URI = process.env.DB_URI;
const PORT = process.env.PORT;
const app = (0, express_1.default)();
// body 파싱 미들웨어
app.use(body_parser_1.default.json());
// 허용할 도메인 리스트
// const allowedOrigins = ["http://localhost:5173", "https://hyue-hear.com"];
// CORS 에러 해결
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
//     next();
// });
// CORS 미들웨어 설정
app.use((0, cors_1.default)({
    origin: "*", // 허용할 도메인
    methods: ["GET", "POST", "PATCH", "DELETE",], // 허용할 HTTP 메소드
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization",], // 허용할 HTTP 헤더
    credentials: true // 인증 정보 (쿠키, Authorization 헤더 등) 포함
}));
// 라우트 처리
app.use("/api/users", usersRoutes_1.default);
app.use("/api/inquiries", inquiriesRoutes_1.default);
app.use("/api/feedback", feedbackRoutes_1.default);
app.use("/api/notices", noticesRoutes_1.default);
app.use("/api/comments", commentsRoutes_1.default);
app.use("/api/machines", machinesRoutes_1.default);
app.use("/api/reservations", reservationsRoutes_1.default);
app.use("/api/reservationSettings", reservationSettingsRoutes_1.default);
app.use("/api/education", educationRoutes_1.default);
app.use((req, res, next) => {
    return next(new errorModel_1.default("라우트를 찾지 못했습니다", 404));
});
app.use((error, req, res, next) => {
    if (res.headersSent) {
        console.log(error);
        return;
    }
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    console.log(error);
    res.status(statusCode);
    res.json({ message: error.message || "알 수 없는 오류 발생" });
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Mongoose로 MongoDB 연결
        const clientOptions = { serverApi: { version: "1", strict: true, deprecationErrors: true } };
        yield mongoose_1.default.connect(DB_URI, clientOptions);
        console.log("Mongoose와 MongoDB 연결 성공");
        // 서버 시작
        app.listen(PORT, () => {
            console.log(`서버가 ${PORT}번 포트에서 작동`);
        });
        // Agenda 설정 (Mongoose의 MongoDB 연결 사용)
        const agenda = new agenda_1.default({ db: { address: DB_URI, collection: 'agendaJobs' } });
        // Agenda 작업 정의
        agenda.define('reset count of laser per week', () => __awaiter(void 0, void 0, void 0, function* () {
            const User = mongoose_1.default.model('User');
            yield User.updateMany({}, { countOfLaserPerWeek: 4 });
            console.log('레이저 커팅기 일주일 예약 가능 횟수 필드 초기화 완료');
        }));
        agenda.define('reset count of laser per day', () => __awaiter(void 0, void 0, void 0, function* () {
            const User = mongoose_1.default.model('User');
            yield User.updateMany({}, { countOfLaserPerDay: 2 });
            console.log('레이저 커팅기 오늘 예약 가능 횟수 필드 초기화 완료');
        }));
        // Agenda 작업 스케줄링
        yield agenda.start();
        yield agenda.every('0 0 * * 1', 'reset count of laser per week'); // 매주 월요일 00:00
        yield agenda.every('0 0 * * *', 'reset count of laser per day'); // 매일 00:00 (자정)
    }
    catch (err) {
        console.error("서버 시작 중 오류 발생:", err);
    }
});
startServer();
