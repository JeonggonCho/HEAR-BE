import mongoose, {Schema} from "mongoose";

export interface IReservation extends Document {
    machine: "laser" | "printer" | "heat" | "saw" | "vacuum" | "cnc";
    date: Date;
    userId: mongoose.Types.ObjectId;
}

export interface ILaserReservation extends IReservation {
    machineId: mongoose.Types.ObjectId;
    timeId: mongoose.Types.ObjectId;
}

export interface IPrinterReservation extends IReservation {
    machineId: mongoose.Types.ObjectId;
}

const laserReservationSchema = new mongoose.Schema<ILaserReservation>({
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
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    machineId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Laser",
    },
    timeId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "LaserTime",
    }
});

const printerReservationSchema = new mongoose.Schema<IPrinterReservation>({
    machine: {
        type: String,
        default: "printer",
        required: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    machineId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Printer"
    },
});

const commonReservationSchema = new mongoose.Schema<IReservation>({
    machine: {
        type: String,
        enum: ["heat", "saw", "vacuum", "cnc"],
        required: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
});

const LaserReservationModel = mongoose.model<ILaserReservation>("LaserReservation", laserReservationSchema);
const PrinterReservationModel = mongoose.model<IPrinterReservation>("PrinterReservation", printerReservationSchema);
const HeatReservationModel = mongoose.model<IReservation>("HeatReservation", commonReservationSchema);
const SawReservationModel = mongoose.model<IReservation>("SawReservation", commonReservationSchema);
const VacuumReservationModel = mongoose.model<IReservation>("VacuumReservation", commonReservationSchema);
const CncReservationModel = mongoose.model<IReservation>("CncReservation", commonReservationSchema);

export {
    LaserReservationModel,
    PrinterReservationModel,
    HeatReservationModel,
    SawReservationModel,
    VacuumReservationModel,
    CncReservationModel
};