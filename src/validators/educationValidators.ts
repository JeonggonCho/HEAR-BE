import {check} from "express-validator";
import {DATE_REGEX} from "../constants/regex";
import dayjs from "dayjs";

const eductionDateValidator = [
    check("startDate")
        .optional({nullable: true, checkFalsy: true})
        .matches(DATE_REGEX)
        .withMessage("날짜 형식은 YYYY-MM-DD이어야 합니다"),
    check("endDate")
        .optional({nullable: true, checkFalsy: true})
        .matches(DATE_REGEX)
        .withMessage("날짜 형식은 YYYY-MM-DD이어야 합니다"),

    check("endDate").custom((endDate, {req}) => {
        const {startDate} = req.body;

        if (!startDate && !endDate) return true;

        if (startDate && endDate) {
            const start = dayjs(startDate, "YYYY-MM-DD");
            const end = dayjs(endDate, "YYYY-MM-DD");
            if (!start.isBefore(end) && !start.isSame(end)) {
                throw new Error("시작일은 종료일보다 이전이거나 같아야 합니다");
            }
        }
        return true;
    })
];

export {eductionDateValidator};