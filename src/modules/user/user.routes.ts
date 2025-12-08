import express, { Request, Response } from "express";
import { pool } from "../../config/db";

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {


    try {
        const result = await pool.query(
            `INSERT INTO Users(name, email, phone) VALUES($1, $2, $3) RETURNING *`,
            [req.body.name, req.body.email, req.body.phone]
        );

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
});


export const userRoutes = router;

