const solarHolidays = [
    {name: "신정", month: 0, day: 1},
    {name: "삼일절", month: 2, day: 1},
    {name: "어린이날", month: 4, day: 5},
    {name: "현충일", month: 5, day: 6},
    {name: "광복절", month: 7, day: 15},
    {name: "개천절", month: 9, day: 3},
    {name: "한글날", month: 9, day: 9},
    {name: "성탄절", month: 11, day: 25},
];

// 공휴일인지 확인하는 함수
const isHoliday = (date: Date) => {
    return solarHolidays.some(holiday =>
        holiday.month === date.getMonth() && holiday.day === date.getDate()
    );
};

// 다음날을 계산하는 함수 (주말이면 다음주 월요일로 변경)
export const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 요일 확인 (0: 일요일, 6: 토요일)
    let dayOfWeek = tomorrow.getDay();
    if (dayOfWeek === 0) {
        // 일요일이면 1일 추가하여 월요일로 변경
        tomorrow.setDate(tomorrow.getDate() + 1);
    } else if (dayOfWeek === 6) {
        // 토요일이면 2일 추가하여 월요일로 변경
        tomorrow.setDate(tomorrow.getDate() + 2);
    }

    // 공휴일 체크 및 다음 공휴일이 아닌 날짜로 이동
    while (isHoliday(tomorrow)) {
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 이동한 날짜가 주말일 경우 다시 월요일로 변경
        dayOfWeek = tomorrow.getDay();
        if (dayOfWeek === 0) {
            tomorrow.setDate(tomorrow.getDate() + 1);
        } else if (dayOfWeek === 6) {
            tomorrow.setDate(tomorrow.getDate() + 2);
        }
    }

    const year = tomorrow.getFullYear();
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const day = tomorrow.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 일주일 후의 날짜 계산 함수 (주말이면 다음주 월요일로 변경)
export const getAfterWeekDate = () => {
    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);

    // 요일 확인 (0: 일요일, 6: 토요일)
    const dayOfWeek = oneWeekLater.getDay();
    if (dayOfWeek === 0) {
        // 일요일이면 1일 추가하여 월요일로 변경
        oneWeekLater.setDate(oneWeekLater.getDate() + 1);
    } else if (dayOfWeek === 6) {
        // 토요일이면 2일 추가하여 월요일로 변경
        oneWeekLater.setDate(oneWeekLater.getDate() + 2);
    }

    const year = oneWeekLater.getFullYear();
    const month = (oneWeekLater.getMonth() + 1).toString().padStart(2, '0');
    const day = oneWeekLater.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
