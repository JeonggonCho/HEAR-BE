export interface ILaserStatus {
    name: string;
    times: {
        timeContent: string;
        status: boolean;
    }[]
}

export type FilteredReservation = {
    machine: "laser" | "printer" | "heat" | "saw" | "vacuum" | "cnc",
    _id: string,
    date: Date,
    machineName?: string,
    startTime?: string,
    endTime?: string
}