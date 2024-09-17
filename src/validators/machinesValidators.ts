import {check} from "express-validator";

const checkStatus = check("status", "상태 정보가 필요합니다").not().isEmpty();

const newLaserValidator = [
    check("name", "기기명을 입력해주세요").not().isEmpty(),
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
    updateLaserValidator,
    newPrinterValidator,
    updatePrinterValidator,
    updateHeatValidator,
    statusValidator
};