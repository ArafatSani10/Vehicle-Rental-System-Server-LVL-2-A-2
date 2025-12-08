import { Request, Response } from "express";
import { pool } from "../../config/db";
import { userService } from "./user.service";


const getUser = async (req: Request, res: Response) => {

    try {
        const result = await userService.getUser()


        res.status(200).json({
            success: true,
            data: result.rows
        });
    }

    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }

}

export const userController = {
    getUser
}