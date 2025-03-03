"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CncReservationModel = exports.VacuumReservationModel = exports.SawReservationModel = exports.HeatReservationModel = exports.PrinterReservationModel = exports.LaserReservationModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const laserReservationSchema = new mongoose_1.default.Schema({
    machine: {
        type: String,
        default: "laser",
        required: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    machineId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Laser",
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
const printerReservationSchema = new mongoose_1.default.Schema({
    machine: {
        type: String,
        default: "printer",
        required: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
        validate: {
            validator: function (value) {
                return __awaiter(this, void 0, void 0, function* () {
                    // 같은 날짜에 이미 저장된 예약이 있는지 확인
                    const reservationCount = yield mongoose_1.default.model('PrinterReservation').countDocuments({ date: value });
                    // 사용 가능한 프린터 개수 확인
                    const printerMachine = yield mongoose_1.default.model('Printer').countDocuments({ status: true });
                    return reservationCount < printerMachine;
                });
            },
            message: '해당 날짜에는 이미 모두 예약되었습니다.'
        }
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    machineId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Printer"
    },
});
const sawReservationSchema = new mongoose_1.default.Schema({
    machine: {
        type: String,
        default: "saw",
        required: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
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
    machineId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Saw",
    },
});
const vacuumReservationSchema = new mongoose_1.default.Schema({
    machine: {
        type: String,
        default: "vacuum",
        required: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
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
    machineId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Vacuum",
    },
});
const heatReservationSchema = new mongoose_1.default.Schema({
    machine: {
        type: String,
        default: "heat",
        required: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    machineId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Heat",
    },
});
const cncReservationSchema = new mongoose_1.default.Schema({
    machine: {
        type: String,
        default: "cnc",
        required: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    machineId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Cnc",
    },
});
const LaserReservationModel = mongoose_1.default.model("LaserReservation", laserReservationSchema);
exports.LaserReservationModel = LaserReservationModel;
const PrinterReservationModel = mongoose_1.default.model("PrinterReservation", printerReservationSchema);
exports.PrinterReservationModel = PrinterReservationModel;
const HeatReservationModel = mongoose_1.default.model("HeatReservation", heatReservationSchema);
exports.HeatReservationModel = HeatReservationModel;
const SawReservationModel = mongoose_1.default.model("SawReservation", sawReservationSchema);
exports.SawReservationModel = SawReservationModel;
const VacuumReservationModel = mongoose_1.default.model("VacuumReservation", vacuumReservationSchema);
exports.VacuumReservationModel = VacuumReservationModel;
const CncReservationModel = mongoose_1.default.model("CncReservation", cncReservationSchema);
exports.CncReservationModel = CncReservationModel;
