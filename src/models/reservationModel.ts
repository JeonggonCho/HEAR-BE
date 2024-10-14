import mongoose, {Schema} from "mongoose";

export interface IReservation extends Document {
    machine: "laser" | "printer" | "heat" | "saw" | "vacuum" | "cnc";
    date: Date;
    userId: mongoose.Types.ObjectId;
    machineId: mongoose.Types.ObjectId;
}

export interface ILaserSawVacuumReservation extends IReservation {
    startTime: string;
    endTime: string;
}

const laserReservationSchema = new mongoose.Schema<ILaserSawVacuumReservation>({
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

const printerReservationSchema = new mongoose.Schema<IReservation>({
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
            validator: async function (value) {
                // 같은 날짜에 이미 저장된 예약이 있는지 확인
                const reservationCount = await mongoose.model('PrinterReservation').countDocuments({date: value});
                // 사용 가능한 프린터 개수 확인
                const printerMachine = await mongoose.model('Printer').countDocuments({status: true});
                return reservationCount < printerMachine;
            },
            message: '해당 날짜에는 이미 모두 예약되었습니다.'
        }
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

const sawReservationSchema = new mongoose.Schema<ILaserSawVacuumReservation>({
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
        type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Saw",
    },
});

const vacuumReservationSchema = new mongoose.Schema<ILaserSawVacuumReservation>({
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
        type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Vacuum",
    },
});

const heatReservationSchema = new mongoose.Schema<IReservation>({
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
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    machineId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Heat",
    },
});

const cncReservationSchema = new mongoose.Schema<IReservation>({
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
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    machineId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Cnc",
    },
});

const LaserReservationModel = mongoose.model<ILaserSawVacuumReservation>("LaserReservation", laserReservationSchema);
const PrinterReservationModel = mongoose.model<IReservation>("PrinterReservation", printerReservationSchema);
const HeatReservationModel = mongoose.model<IReservation>("HeatReservation", heatReservationSchema);
const SawReservationModel = mongoose.model<ILaserSawVacuumReservation>("SawReservation", sawReservationSchema);
const VacuumReservationModel = mongoose.model<ILaserSawVacuumReservation>("VacuumReservation", vacuumReservationSchema);
const CncReservationModel = mongoose.model<IReservation>("CncReservation", cncReservationSchema);

export {
    LaserReservationModel,
    PrinterReservationModel,
    HeatReservationModel,
    SawReservationModel,
    VacuumReservationModel,
    CncReservationModel
};