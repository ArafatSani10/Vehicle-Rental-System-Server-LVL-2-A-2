import { Request, Response } from "express";
import { authService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {


    try {

        const result = await authService.createUser(req.body)

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
};

const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const result = await authService.signin(email, password);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        })
    }
    catch (err: any) {

        res.status(500).json({
            success: false,
            message: err.message
        })

    }
}

export const authController = {
    createUser,
    signin
}