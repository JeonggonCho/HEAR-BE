"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CncModel = exports.VacuumModel = exports.SawModel = exports.HeatModel = exports.PrinterModel = exports.LaserTimeModel = exports.LaserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const laserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
});
const laserTimeSchema = new mongoose_1.default.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    startTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
});
const printerSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
});
const heatSchema = new mongoose_1.default.Schema({
    count: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
        default: false,
    }
});
const sawSchema = new mongoose_1.default.Schema({
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
});
const vacuumSchema = new mongoose_1.default.Schema({
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
});
const cncSchema = new mongoose_1.default.Schema({
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
});
const LaserModel = mongoose_1.default.model("Laser", laserSchema);
exports.LaserModel = LaserModel;
const LaserTimeModel = mongoose_1.default.model("LaserTime", laserTimeSchema);
exports.LaserTimeModel = LaserTimeModel;
const PrinterModel = mongoose_1.default.model("Printer", printerSchema);
exports.PrinterModel = PrinterModel;
const HeatModel = mongoose_1.default.model("Heat", heatSchema);
exports.HeatModel = HeatModel;
const SawModel = mongoose_1.default.model("Saw", sawSchema);
exports.SawModel = SawModel;
const VacuumModel = mongoose_1.default.model("Vacuum", vacuumSchema);
exports.VacuumModel = VacuumModel;
const CncModel = mongoose_1.default.model("Cnc", cncSchema);
exports.CncModel = CncModel;
