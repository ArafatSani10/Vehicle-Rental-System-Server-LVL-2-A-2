import { pool } from "../../config/db";

const getUser = async () => {
    const result = await pool.query(`
    
            SELECT id,name,email,phone FROM Users
            `);

    return result;
}



export const userService = {
    getUser,
}