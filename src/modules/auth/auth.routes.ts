import express, { Request, Response } from "express";
import { pool } from "../../config/db";
import { authController } from "./auth.controller";

const router = express.Router();

router.post("/signup", authController.createUser);


export const authRoutes = router;

