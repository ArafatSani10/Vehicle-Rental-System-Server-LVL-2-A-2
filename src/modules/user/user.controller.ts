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

};
const updateUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { name, email, phone } = req.body;

    try {
        const result = await userService.updateUser(name, email, phone, userId);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: result.rows[0],
        });
    }
    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
const deleteUser = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const result = await userService.deleteUser(userId);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: null
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


export const userController = {
    getUser,
    updateUser,
    deleteUser
}