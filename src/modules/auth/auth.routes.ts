import express, { Request, Response } from "express";
import { authController } from "./auth.controller";
const router = express.Router();
router.post("/signup", authController.createUser);
router.post("/signin", authController.signin);
export const authRoutes = router;

