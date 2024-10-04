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

export interface ISawVacuumReservation extends IReservation {
    startTime: string;
    endTime: string;
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

const sawVacuumReservationSchema = new mongoose.Schema<ISawVacuumReservation>({
    machine: {
        type: String,
        enum: ["saw", "vacuum"],
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
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
});

const heatCncReservationSchema = new mongoose.Schema<IReservation>({
    machine: {
        type: String,
        enum: ["heat", "cnc"],
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
const HeatReservationModel = mongoose.model<IReservation>("HeatReservation", heatCncReservationSchema);
const SawReservationModel = mongoose.model<ISawVacuumReservation>("SawReservation", sawVacuumReservationSchema);
const VacuumReservationModel = mongoose.model<ISawVacuumReservation>("VacuumReservation", sawVacuumReservationSchema);
const CncReservationModel = mongoose.model<IReservation>("CncReservation", heatCncReservationSchema);

export {
    LaserReservationModel,
    PrinterReservationModel,
    HeatReservationModel,
    SawReservationModel,
    VacuumReservationModel,
    CncReservationModel
};