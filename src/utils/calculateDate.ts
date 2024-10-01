// 다음날을 계산하는 함수 (주말이면 다음주 월요일로 변경)
export const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 요일 확인 (0: 일요일, 6: 토요일)
    const dayOfWeek = tomorrow.getDay();
    if (dayOfWeek === 0) {
        // 일요일이면 1일 추가하여 월요일로 변경
        tomorrow.setDate(tomorrow.getDate() + 1);
    } else if (dayOfWeek === 6) {
        // 토요일이면 2일 추가하여 월요일로 변경
        tomorrow.setDate(tomorrow.getDate() + 2);
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
