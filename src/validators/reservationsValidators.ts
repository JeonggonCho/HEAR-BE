import {body, check} from "express-validator";
import dayjs from "dayjs";

const laserValidator = [
    body().isArray().withMessage('요청은 배열 구조여야 합니다'),
    body('*.date')
        .isISO8601().withMessage('유효한 날짜 형식이여야 합니다 (YYYY-MM-DD)'),
    body('*.machineId')
        .isMongoId().withMessage('유효하지 않은 기기 아이디 형식입니다'),
    body('*.startTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('시작 시간은 HH:MM 형식이어야 합니다'),
    body('*.endTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("종료 시간은 HH:MM 형식이어야 합니다"),
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

const sawVacuumValidator = [
    body("date")
        .isISO8601().withMessage("유효한 날짜 형식이여야 합니다 (YYYY-MM-DD)")
        .custom((value) => {
            const todayDate = dayjs().startOf("day");
            const selectedDate = dayjs(value, "YYYY-MM-DD", true).startOf("day");

            if (!selectedDate.isAfter(todayDate)) {
                throw new Error("유효한 날짜만 예약 가능합니다");
            }
            return true;
        }),
    body("startTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('시작 시간은 HH:MM 형식이어야 합니다'),
    body("endTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("종료 시간은 HH:MM 형식이어야 합니다")
        .custom((endTime, {req}) => {
            const [startHour, startMinute] = req.body.startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
                throw new Error("종료 시간이 시작 시간보다 이후여야 합니다");
            }
            return true;
        }),
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

export {laserValidator, heatValidator, sawVacuumValidator, cncValidator};