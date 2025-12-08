import { pool } from "../../config/db";

const createUser = async (name: string, email: string, phone: string) => {
    const result = await pool.query(
        `INSERT INTO Users(name, email, phone) VALUES($1, $2, $3) RETURNING *`,
        [name, email, phone]
    );
    return result;
}

export const authService = { createUser };