import {body, check} from "express-validator";
import dayjs from "dayjs";

const laserValidator = [
    body().isArray().withMessage('요청은 배열 구조여야 합니다'),
    body('*.date')
        .isISO8601().withMessage('유효한 날짜 형식이여야 합니다 (YYYY-MM-DD)'),
    body('*.machineId')
        .isMongoId().withMessage('유효하지 않은 기기 아이디 형식입니다'),
    body('*.timeId')
        .isMongoId().withMessage('유효하지 않은 시간 아이디 형식입니다'),
];

const heatValidator = [
    check("check")
        .isBoolean().withMessage("반드시 체크되어야 합니다")
        .equals(String(true)).withMessage("반드시 체크되어야 합니다"),
    check("date")
        .isISO8601().withMessage("유효한 날짜 형식이여야 합니다 (YYYY-MM-DD)")
        .custom((value) => {
            const todayDate = dayjs().startOf("day"); // 오늘 날짜
            const validDate = todayDate.add(1, "day") // 내일 날짜
            const selectedDate = dayjs(value, "YYYY-MM-DD", true).startOf("day"); // 예약 날짜

            if (!selectedDate.isSame(validDate)) {
                throw new Error("열선 대여는 다음날만 예약 가능합니다");
            }
            return true;
        })
];

const cncValidator = [
    check("check")
        .isBoolean().withMessage("반드시 체크되어야 합니다")
        .equals(String(true)).withMessage("반드시 체크되어야 합니다"),
    check("date")
        .isISO8601().withMessage("유효한 날짜 형식이여야 합니다 (YYYY-MM-DD)")
        .custom((value) => {
            const todayDate = dayjs().startOf("day"); // 오늘 날짜
            const validDate = todayDate.add(1, "day") // 오늘로부터 2일 후 날짜
            const selectedDate = dayjs(value, "YYYY-MM-DD", true).startOf("day"); // 예약 날짜

            if (!selectedDate.isAfter(validDate)) {
                throw new Error("오늘로부터 2일 후의 날짜만 예약 가능합니다");
            }
            return true;
        })
];

export {laserValidator, heatValidator, cncValidator};