import express from "express";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

router.get("/", checkAuth,)

export default router;