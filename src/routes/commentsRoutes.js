"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = __importDefault(require("../middlewares/checkAuth"));
const commentsControllers_1 = require("../controllers/commentsControllers");
const router = express_1.default.Router();
router.post("/", checkAuth_1.default, commentsControllers_1.newComment);
router.post("/like/:commentId", checkAuth_1.default, commentsControllers_1.likeComment);
router.patch("/:commentId", checkAuth_1.default, commentsControllers_1.updateComment);
router.delete("/:commentId", checkAuth_1.default, commentsControllers_1.deleteComment);
exports.default = router;
