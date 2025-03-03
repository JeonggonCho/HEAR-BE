"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAfterWeekDate = exports.getTomorrowDate = exports.isHoliday = exports.solarHolidays = void 0;
exports.solarHolidays = [
    { name: "신정", month: 0, day: 1 },
    { name: "삼일절", month: 2, day: 1 },
    { name: "어린이날", month: 4, day: 5 },
    { name: "현충일", month: 5, day: 6 },
    { name: "광복절", month: 7, day: 15 },
    { name: "개천절", month: 9, day: 3 },
    { name: "한글날", month: 9, day: 9 },
    { name: "성탄절", month: 11, day: 25 },
];
// 공휴일인지 확인하는 함수
const isHoliday = (date) => {
    return exports.solarHolidays.some(holiday => holiday.month === date.getMonth() && holiday.day === date.getDate());
};
exports.isHoliday = isHoliday;
// 다음날을 계산하는 함수 (주말, 공휴일 고려)
const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // 요일 확인 (0: 일요일, 6: 토요일)
    let dayOfWeek = tomorrow.getDay();
    if (dayOfWeek === 0) {
        // 일요일이면 1일 추가하여 월요일로 변경
        tomorrow.setDate(tomorrow.getDate() + 1);
    }
    else if (dayOfWeek === 6) {
        // 토요일이면 2일 추가하여 월요일로 변경
        tomorrow.setDate(tomorrow.getDate() + 2);
    }
    // 공휴일 체크 및 다음 공휴일이 아닌 날짜로 이동
    while ((0, exports.isHoliday)(tomorrow)) {
        tomorrow.setDate(tomorrow.getDate() + 1);
        // 이동한 날짜가 주말일 경우 다시 월요일로 변경
        dayOfWeek = tomorrow.getDay();
        if (dayOfWeek === 0) {
            tomorrow.setDate(tomorrow.getDate() + 1);
        }
        else if (dayOfWeek === 6) {
            tomorrow.setDate(tomorrow.getDate() + 2);
        }
    }
    const year = tomorrow.getFullYear();
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const day = tomorrow.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
exports.getTomorrowDate = getTomorrowDate;
// 일주일 후의 날짜 계산 함수 (주말, 공휴일 고려)
const getAfterWeekDate = (fromTomorrowNotConsiderHoliday) => {
    // 공휴일을 고려하지 않은 내일부터인지, 위의 공휴일을 제외한 다음날로부터인지 (즉, 시작일 기준점 정하기)
    const oneWeekLater = fromTomorrowNotConsiderHoliday ? new Date() : new Date((0, exports.getTomorrowDate)());
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    // 요일 확인 (0: 일요일, 6: 토요일)
    let dayOfWeek = oneWeekLater.getDay();
    if (dayOfWeek === 0) {
        // 일요일이면 1일 추가하여 월요일로 변경
        oneWeekLater.setDate(oneWeekLater.getDate() + 1);
    }
    else if (dayOfWeek === 6) {
        // 토요일이면 2일 추가하여 월요일로 변경
        oneWeekLater.setDate(oneWeekLater.getDate() + 2);
    }
    // 공휴일 체크 및 다음 공휴일이 아닌 날짜로 이동
    while ((0, exports.isHoliday)(oneWeekLater)) {
        oneWeekLater.setDate(oneWeekLater.getDate() + 1);
        // 이동한 날짜가 주말일 경우 다시 월요일로 변경
        dayOfWeek = oneWeekLater.getDay();
        if (dayOfWeek === 0) {
            oneWeekLater.setDate(oneWeekLater.getDate() + 1);
        }
        else if (dayOfWeek === 6) {
            oneWeekLater.setDate(oneWeekLater.getDate() + 2);
        }
    }
    const year = oneWeekLater.getFullYear();
    const month = (oneWeekLater.getMonth() + 1).toString().padStart(2, '0');
    const day = oneWeekLater.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
exports.getAfterWeekDate = getAfterWeekDate;
