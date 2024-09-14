import {check} from "express-validator";

const checkStatus = check("status", "상태 정보가 필요합니다").not().isEmpty();

const newLaserValidator = [
    check("name"),
    checkStatus,
];

const updateLaserValidator = [
    check("name"),
    checkStatus,
];

const newPrinterValidator = [
    check("name"),
    checkStatus,
];

const updatePrinterValidator = [
    check("name"),
    checkStatus,
];

const updateHeatValidator = [
    check("count"),
    checkStatus,
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