import {check} from "express-validator";

const checkStatus = check("status", "상태 정보가 필요합니다").not().isEmpty();

const newLaserValidator = [
    check("name", "기기명을 입력해주세요").not().isEmpty(),
];

const newLaserTimeValidator = [
    check("id")
        .notEmpty().withMessage("ID는 필수 항목입니다")
        .isString().withMessage("ID는 문자열이어야 합니다"),
    check("startTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("시작 시간은 HH:MM 형식이어야 합니다"),
    check("endTime")
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

const updateLaserValidator = [
    checkStatus,
];

const newPrinterValidator = [
    check("name", "기기명을 입력해주세요").not().isEmpty(),
];

const updatePrinterValidator = [
    checkStatus,
];

const updateHeatValidator = [
    check('count'),
];

const statusValidator = [
    checkStatus,
];

export {
    newLaserValidator,
    newLaserTimeValidator,
    updateLaserValidator,
    newPrinterValidator,
    updatePrinterValidator,
    updateHeatValidator,
    statusValidator
};