"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generatePassword = (length = 12) => {
    // 비밀번호 생성에 사용될 수 있는 모든 대소문자, 숫자, 특수문자
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    // 랜덤으로 인덱스 번호를 뽑아 해당 인덱스의 문자를 비밀번호로 추가
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
};
exports.default = generatePassword;
