import { pool } from "../../config/db";
import bcrypt from "bcryptjs";

import jwt from 'jsonwebtoken';
import config from "../../config";



const createUser = async (payload: Record<string, unknown>) => {
    const { name, role, email, phone, password } = payload;

    const hasedPass = await bcrypt.hash(password as string, 10)


    const result = await pool.query(
        `INSERT INTO Users(name,role, email, phone,password) VALUES($1, $2, $3, $4, $5) RETURNING *`,
        [name, role, email, phone, hasedPass]
    );
    return result;
};

const signin = async (email: string, password: string) => {

    const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);

    if (result.rows.length === 0) {
        return null;
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return false;
    }



    const token = jwt.sign({ name: user.name, email: user.email, role:user.role }, config.jwtSecret as string, {
        expiresIn: '7d',
    });

    console.log({ token });

    return { token, user }

};

export const authService = { createUser, signin };