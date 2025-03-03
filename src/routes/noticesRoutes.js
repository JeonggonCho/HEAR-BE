"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = __importDefault(require("../middlewares/checkAuth"));
const boardValidators_1 = require("../validators/boardValidators");
const noticesControllers_1 = require("../controllers/noticesControllers");
const router = express_1.default.Router();
router.get("/", checkAuth_1.default, noticesControllers_1.getNotices);
router.get("/latest", checkAuth_1.default, noticesControllers_1.getLatestNotices);
router.get("/:noticeId", checkAuth_1.default, noticesControllers_1.getNotice);
router.post("/new", checkAuth_1.default, boardValidators_1.noticeValidator, noticesControllers_1.newNotice);
router.patch("/:noticeId", checkAuth_1.default, boardValidators_1.noticeValidator, noticesControllers_1.updateNotice);
router.delete("/:noticeId", checkAuth_1.default, noticesControllers_1.deleteNotice);
exports.default = router;
