"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateRandomCode = () => {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
};
exports.default = generateRandomCode;
