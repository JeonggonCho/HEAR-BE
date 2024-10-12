export interface ILaserStatus {
    name: string;
    times: {
        timeContent: string;
        status: boolean;
    }[]
}