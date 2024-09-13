import {CustomRequest} from "../middlewares/checkAuth";
import {NextFunction, Response} from "express";

const getLasers = async (req: CustomRequest, res: Response, next: NextFunction) => {

};

const getPrinters = async (req: CustomRequest, res: Response, next: NextFunction) => {

};

const getHeats = async (req: CustomRequest, res: Response, next: NextFunction) => {

};

const getSaws = async (req: CustomRequest, res: Response, next: NextFunction) => {

};

const getVacuums = async (req: CustomRequest, res: Response, next: NextFunction) => {

};

const getCncs = async (req: CustomRequest, res: Response, next: NextFunction) => {

};

export {getLasers, getPrinters, getHeats, getSaws, getVacuums, getCncs}