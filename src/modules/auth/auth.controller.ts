import { Request, Response } from "express";
import { pool } from "../../config/db";
import { authService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {


    try {
        const { name, email, phone } = req.body;
        const result = await authService.createUser(name, email, phone)

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        });


    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const authController = {
    createUser
}