import mongoose, {Document} from "mongoose";

interface ITimeRange {
    startTime: string;
    endTime: string;
}

interface ILaserTimes {
    times: ITimeRange[];
}

interface ILaser extends Document {
    name: string;
    status: boolean;
}

interface IPrinter extends Document {
    name: string;
    status: boolean;
}

interface IHeat extends Document {
    count: number;
    status: boolean;
}

interface ISaw extends Document {
    status: boolean;
}

interface IVacuum extends Document {
    status: boolean;
}

interface ICnc extends Document {
    status: boolean;
}

const timeRangeSchema = new mongoose.Schema<ITimeRange>({
    startTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        validate: {
            validator: function (value: string): boolean {
                const [startHour, startMinute] = (this as any).startTime.split(':').map(Number);
                const [endHour, endMinute] = value.split(':').map(Number);
                return (startHour < endHour) || (startHour === endHour && startMinute < endMinute);
            },
            message: "종료 시간이 시작 시간보다 이후여야 합니다."
        }
    }
});

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

const laserTimesSchema = new mongoose.Schema<ILaserTimes>({
    times: {
        type: [timeRangeSchema],
        default: []
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
const LaserTimesModel = mongoose.model<ILaserTimes>("LaserTimes", laserTimesSchema);
const PrinterModel = mongoose.model<IPrinter>("Printer", printerSchema);
const HeatModel = mongoose.model<IHeat>("Heat", heatSchema);
const SawModel = mongoose.model<ISaw>("Saw", sawSchema);
const VacuumModel = mongoose.model<IVacuum>("Vacuum", vacuumSchema);
const CncModel = mongoose.model<ICnc>("Cnc", cncSchema);

export {LaserModel, LaserTimesModel, PrinterModel, HeatModel, SawModel, VacuumModel, CncModel};
