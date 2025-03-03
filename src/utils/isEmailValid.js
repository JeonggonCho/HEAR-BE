"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isEmailValid = (value) => {
    return (/^[a-zA-Z0-9._%+-]+@hanyang\.ac\.kr$/).test(value);
};
exports.default = isEmailValid;
