"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusValidator = exports.updateHeatValidator = exports.updatePrinterValidator = exports.newPrinterValidator = exports.updateLaserTimeValidator = exports.newLaserTimeValidator = exports.updateLaserValidator = exports.newLaserValidator = void 0;
const express_validator_1 = require("express-validator");
const checkStatus = (0, express_validator_1.check)("status", "상태 정보가 필요합니다").optional().isBoolean();
const newLaserValidator = [
    (0, express_validator_1.check)("name", "기기명을 입력해주세요").not().isEmpty(),
];
exports.newLaserValidator = newLaserValidator;
const newLaserTimeValidator = [
    (0, express_validator_1.check)("id")
        .notEmpty().withMessage("ID는 필수 항목입니다")
        .isString().withMessage("ID는 문자열이어야 합니다"),
    (0, express_validator_1.check)("startTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("시작 시간은 HH:MM 형식이어야 합니다"),
    (0, express_validator_1.check)("endTime")
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
exports.newLaserTimeValidator = newLaserTimeValidator;
const updateLaserTimeValidator = [
    // 배열 내 각 객체에 대해 id, startTime, endTime을 검증
    (0, express_validator_1.body)('*.id')
        .notEmpty().withMessage('ID는 필수 항목입니다')
        .isString().withMessage('ID는 문자열이어야 합니다'),
    (0, express_validator_1.body)('*.startTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('시작 시간은 HH:MM 형식이어야 합니다'),
    (0, express_validator_1.body)('*.endTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('종료 시간은 HH:MM 형식이어야 합니다')
        .custom((endTime, { req, path }) => {
        const index = path.split('[')[1].split(']')[0];
        const startTime = req.body[index].startTime;
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
            throw new Error('종료 시간이 시작 시간보다 이후여야 합니다');
        }
        return true;
    }),
];
exports.updateLaserTimeValidator = updateLaserTimeValidator;
const updateLaserValidator = [
    checkStatus.optional(),
    (0, express_validator_1.check)("name", "기기명을 입력해주세요").optional().not().isEmpty(),
];
exports.updateLaserValidator = updateLaserValidator;
const newPrinterValidator = [
    (0, express_validator_1.check)("name", "기기명을 입력해주세요").not().isEmpty(),
];
exports.newPrinterValidator = newPrinterValidator;
const updatePrinterValidator = [
    checkStatus.optional(),
    (0, express_validator_1.check)("name", "기기명을 입력해주세요").optional().not().isEmpty(),
];
exports.updatePrinterValidator = updatePrinterValidator;
const updateHeatValidator = [
    checkStatus.optional(),
    (0, express_validator_1.check)('count', "기기 대수를 입력해주세요").optional().isInt({ min: 0, max: 15 }),
];
exports.updateHeatValidator = updateHeatValidator;
const statusValidator = [
    checkStatus,
];
exports.statusValidator = statusValidator;
