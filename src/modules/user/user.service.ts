import { pool } from "../../config/db";

const getUser = async () => {
    const result = await pool.query(`
    
            SELECT id,name,email,phone FROM Users
            `);

    return result;
}

const updateUser = async (name: string, email: string, phone: string, userId: string | undefined) => {
    const result = await pool.query(
        `UPDATE Users SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *`,
        [name, email, phone, userId]
    );

    return result;
}

const deleteUser = async (userId: string | undefined) => {
    const result = await pool.query(
        `DELETE FROM Users WHERE id = $1`,
        [userId]
    );
    return result;
};


export const userService = {
    getUser,
    updateUser,
    deleteUser
}