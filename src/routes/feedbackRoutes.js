"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = __importDefault(require("../middlewares/checkAuth"));
const boardValidators_1 = require("../validators/boardValidators");
const feedbackControllers_1 = require("../controllers/feedbackControllers");
const router = express_1.default.Router();
router.get("/", checkAuth_1.default, feedbackControllers_1.getFeedbackList);
router.get("/:feedbackId", checkAuth_1.default, feedbackControllers_1.getFeedback);
router.post("/new", checkAuth_1.default, boardValidators_1.feedbackValidator, feedbackControllers_1.newFeedback);
router.post("/like/:feedbackId", checkAuth_1.default, feedbackControllers_1.likeFeedback);
router.patch("/:feedbackId", checkAuth_1.default, boardValidators_1.feedbackValidator, feedbackControllers_1.updateFeedback);
router.delete("/:feedbackId", checkAuth_1.default, feedbackControllers_1.deleteFeedback);
exports.default = router;
