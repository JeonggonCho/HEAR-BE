import mongoose, {Schema} from "mongoose";

export interface IReservation extends Document {
    machine: "laser" | "printer" | "heat" | "saw" | "vacuum" | "cnc";
    date: Date;
    userId: mongoose.Types.ObjectId;
}

export interface ILaserReservation extends IReservation {
    machineId: mongoose.Types.ObjectId;
    startTime: string;
    endTime: string;
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
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
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