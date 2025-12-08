import express, { Request, Response } from "express";
import { pool } from "../../config/db";
import { userController } from "./user.controller";


const router = express.Router();



router.get("/", userController.getUser);



export const userRoutes = router;

