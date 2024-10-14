import mongoose, {Document} from "mongoose";

interface ILaserTime {
    id: string;
    startTime: string;
    endTime: string;
}

export interface ILaser extends Document {
    name: string;
    status: boolean;
}

export interface IPrinter extends Document {
    name: string;
    status: boolean;
}

export interface IHeat extends Document {
    count: number;
    status: boolean;
}

export interface ISaw extends Document {
    status: boolean;
}

export interface IVacuum extends Document {
    status: boolean;
}

export interface ICnc extends Document {
    status: boolean;
}

const laserSchema = new mongoose.Schema<ILaser>({
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

const laserTimeSchema = new mongoose.Schema<ILaserTime>({
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

const printerSchema = new mongoose.Schema<IPrinter>({
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

const heatSchema = new mongoose.Schema<IHeat>({
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

const sawSchema = new mongoose.Schema<ISaw>({
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const vacuumSchema = new mongoose.Schema<IVacuum>({
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const cncSchema = new mongoose.Schema<ICnc>({
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const LaserModel = mongoose.model<ILaser>("Laser", laserSchema);
const LaserTimeModel = mongoose.model<ILaserTime>("LaserTime", laserTimeSchema);
const PrinterModel = mongoose.model<IPrinter>("Printer", printerSchema);
const HeatModel = mongoose.model<IHeat>("Heat", heatSchema);
const SawModel = mongoose.model<ISaw>("Saw", sawSchema);
const VacuumModel = mongoose.model<IVacuum>("Vacuum", vacuumSchema);
const CncModel = mongoose.model<ICnc>("Cnc", cncSchema);

export {LaserModel, LaserTimeModel, PrinterModel, HeatModel, SawModel, VacuumModel, CncModel};
