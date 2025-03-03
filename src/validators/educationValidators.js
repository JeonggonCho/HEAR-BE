"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eductionDateValidator = void 0;
const express_validator_1 = require("express-validator");
const regex_1 = require("../constants/regex");
const dayjs_1 = __importDefault(require("dayjs"));
const eductionDateValidator = [
    (0, express_validator_1.check)("startDate")
        .optional({ nullable: true, checkFalsy: true })
        .matches(regex_1.DATE_REGEX)
        .withMessage("날짜 형식은 YYYY-MM-DD이어야 합니다"),
    (0, express_validator_1.check)("endDate")
        .optional({ nullable: true, checkFalsy: true })
        .matches(regex_1.DATE_REGEX)
        .withMessage("날짜 형식은 YYYY-MM-DD이어야 합니다"),
    (0, express_validator_1.check)("endDate").custom((endDate, { req }) => {
        const { startDate } = req.body;
        if (!startDate && !endDate)
            return true;
        if (startDate && endDate) {
            const start = (0, dayjs_1.default)(startDate, "YYYY-MM-DD");
            const end = (0, dayjs_1.default)(endDate, "YYYY-MM-DD");
            if (!start.isBefore(end) && !start.isSame(end)) {
                throw new Error("시작일은 종료일보다 이전이거나 같아야 합니다");
            }
        }
        return true;
    })
];
exports.eductionDateValidator = eductionDateValidator;
