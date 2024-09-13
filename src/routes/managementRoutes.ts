import express from "express";
import {getMachines, getUsers} from "../controllers/managementControllers";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

router.get("/users", checkAuth, getUsers);
router.get("/machines", checkAuth, getMachines);

export default router;