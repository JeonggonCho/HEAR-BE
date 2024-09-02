import {check} from "express-validator";

const signupValidator = [check()];
const loginValidator = [check()];

export {signupValidator, loginValidator}