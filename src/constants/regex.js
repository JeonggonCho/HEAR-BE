"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATE_REGEX = exports.TEL_REGEX = exports.STUDENTID_REGEX = exports.PW_REGEX = exports.EMAIL_REGEX = void 0;
// 한양대 이메일 정규표현식
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@hanyang\.ac\.kr$/;
exports.EMAIL_REGEX = EMAIL_REGEX;
// 비밀번호 정규표현식
const PW_REGEX = /^(?!((?:[A-Za-z]+)|(?:[~!@#$%^&*()_+=]+)|(?:[0-9]+))$)[A-Za-z\d~!@#$%^&*()_+=]{8,20}$/;
exports.PW_REGEX = PW_REGEX;
// 학번 정규표현식
const STUDENTID_REGEX = /^\d{10}$/;
exports.STUDENTID_REGEX = STUDENTID_REGEX;
// 휴대전화번호 정규표현식
const TEL_REGEX = /^\+?[0-9\s\-()]{7,20}$/;
exports.TEL_REGEX = TEL_REGEX;
// 시간 형식(HH:MM) 정규표현식
// export const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
// 날짜 정규표현식
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
exports.DATE_REGEX = DATE_REGEX;
