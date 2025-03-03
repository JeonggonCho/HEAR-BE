"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cncValidator = exports.sawVacuumValidator = exports.heatValidator = exports.laserValidator = void 0;
const express_validator_1 = require("express-validator");
const dayjs_1 = __importDefault(require("dayjs"));
const laserValidator = [
    (0, express_validator_1.body)().isArray().withMessage('요청은 배열 구조여야 합니다'),
    (0, express_validator_1.body)('*.date')
        .isISO8601().withMessage('유효한 날짜 형식이여야 합니다 (YYYY-MM-DD)'),
    (0, express_validator_1.body)('*.machineId')
        .isMongoId().withMessage('유효하지 않은 기기 아이디 형식입니다'),
    (0, express_validator_1.body)('*.startTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('시작 시간은 HH:MM 형식이어야 합니다'),
    (0, express_validator_1.body)('*.endTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("종료 시간은 HH:MM 형식이어야 합니다"),
];
exports.laserValidator = laserValidator;
const heatValidator = [
    (0, express_validator_1.check)("check")
        .isBoolean().withMessage("반드시 체크되어야 합니다")
        .equals(String(true)).withMessage("반드시 체크되어야 합니다"),
    (0, express_validator_1.check)("date")
        .isISO8601().withMessage("유효한 날짜 형식이여야 합니다 (YYYY-MM-DD)")
        .custom((value) => {
        const todayDate = (0, dayjs_1.default)().startOf("day"); // 오늘 날짜
        const validDate = todayDate.add(1, "day"); // 내일 날짜
        const selectedDate = (0, dayjs_1.default)(value, "YYYY-MM-DD", true).startOf("day"); // 예약 날짜
        if (!selectedDate.isSame(validDate)) {
            throw new Error("열선 대여는 다음날만 예약 가능합니다");
        }
        return true;
    })
];
exports.heatValidator = heatValidator;
const sawVacuumValidator = [
    (0, express_validator_1.body)("date")
        .isISO8601().withMessage("유효한 날짜 형식이여야 합니다 (YYYY-MM-DD)")
        .custom((value) => {
        const todayDate = (0, dayjs_1.default)().startOf("day");
        const selectedDate = (0, dayjs_1.default)(value, "YYYY-MM-DD", true).startOf("day");
        if (!selectedDate.isAfter(todayDate)) {
            throw new Error("유효한 날짜만 예약 가능합니다");
        }
        return true;
    }),
    (0, express_validator_1.body)("startTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('시작 시간은 HH:MM 형식이어야 합니다'),
    (0, express_validator_1.body)("endTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("종료 시간은 HH:MM 형식이어야 합니다")
        .custom((endTime, { req }) => {
        const [startHour, startMinute] = req.body.startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
            throw new Error("종료 시간이 시작 시간보다 이후여야 합니다");
        }
        return true;
    }),
];
exports.sawVacuumValidator = sawVacuumValidator;
const cncValidator = [
    (0, express_validator_1.check)("check")
        .isBoolean().withMessage("반드시 체크되어야 합니다")
        .equals(String(true)).withMessage("반드시 체크되어야 합니다"),
    (0, express_validator_1.check)("date")
        .isISO8601().withMessage("유효한 날짜 형식이여야 합니다 (YYYY-MM-DD)")
        .custom((value) => {
        const todayDate = (0, dayjs_1.default)().startOf("day"); // 오늘 날짜
        const validDate = todayDate.add(1, "day"); // 오늘로부터 2일 후 날짜
        const selectedDate = (0, dayjs_1.default)(value, "YYYY-MM-DD", true).startOf("day"); // 예약 날짜
        if (!selectedDate.isAfter(validDate)) {
            throw new Error("오늘로부터 2일 후의 날짜만 예약 가능합니다");
        }
        return true;
    })
];
exports.cncValidator = cncValidator;
