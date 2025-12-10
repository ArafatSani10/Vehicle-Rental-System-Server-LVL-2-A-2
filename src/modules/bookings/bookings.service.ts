import { PoolClient } from "pg";
import { pool } from "../../config/db";
const createBookingService = async (payload: Record<string, unknown>) => {
    const customer_id = payload.customer_id as number;
    const vehicle_id = payload.vehicle_id as number;
    const rent_start_date = payload.rent_start_date as string;
    const rent_end_date = payload.rent_end_date as string;

    let client: PoolClient | null = null;

    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const vehicleQuery = `SELECT vehicle_name, daily_rent_price FROM Vehicles WHERE id=$1`;
        const vehicleResult = await client.query(vehicleQuery, [vehicle_id]);

        if (vehicleResult.rows.length === 0) {
            throw new Error("Vehicle not found");
        }

        const vehicle = vehicleResult.rows[0];

        const startDate = new Date(rent_start_date);
        const endDate = new Date(rent_end_date);
        const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) || 1;
        const totalPrice = vehicle.daily_rent_price * durationDays;

        const bookingQuery = `
            INSERT INTO Bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const bookingResult = await client.query(bookingQuery, [
            customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice, "active"
        ]);

        const updateVehicleQuery = `UPDATE Vehicles SET availability_status = 'booked' WHERE id = $1`;
        await client.query(updateVehicleQuery, [vehicle_id]);

        await client.query('COMMIT');
        return {
            ...bookingResult.rows[0],
            vehicle: {
                vehicle_name: vehicle.vehicle_name,
                daily_rent_price: vehicle.daily_rent_price,
            },
        };

    } catch (error: any) {
        if (client) {
            await client.query('ROLLBACK');
        }

        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};
const getAllBookingsService = async () => {

    
    const getBookingsQuery = `
        SELECT 
            b.id AS id, 
            b.customer_id, 
            b.vehicle_id, 
            b.rent_start_date, 
            b.rent_end_date, 
            b.total_price, 
            b.status,
            u.name AS customer_name,
            u.email AS customer_email, -- Added email
            v.vehicle_name, 
            v.registration_number,    -- Added registration_number
            v.daily_rent_price,
            v.type AS vehicle_type    -- Added vehicle type for potential customer view use
        FROM Bookings b
        JOIN Users u ON b.customer_id = u.id
        JOIN Vehicles v ON b.vehicle_id = v.id
        ORDER BY b.create_at DESC
    `;

    const result = await pool.query(getBookingsQuery);

    if (result.rows.length === 0) {
        return [];
    }

    const nestedBookings = result.rows.map((row: any) => ({
        id: row.id,
        customer_id: row.customer_id,
        vehicle_id: row.vehicle_id,
        rent_start_date: row.rent_start_date,
        rent_end_date: row.rent_end_date,
        total_price: row.total_price,
        status: row.status,
        
        customer: {
            name: row.customer_name,
            email: row.customer_email,
        },
        
        vehicle: {
            vehicle_name: row.vehicle_name,
            registration_number: row.registration_number,
            type: row.vehicle_type,
        }
    }));

    return nestedBookings;
};
const updateOne = async (bookingId: number, status: string) => {
    let client: any = null;

    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const bookingCheckQuery = `SELECT vehicle_id, rent_start_date, status FROM Bookings WHERE id = $1`;
        const bookingCheck = await client.query(bookingCheckQuery, [bookingId]);

        if (bookingCheck.rowCount === 0) {
            throw new Error("Booking not found");
        }

        const currentBooking = bookingCheck.rows[0];

        if (status === 'cancelled') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startDate = new Date(currentBooking.rent_start_date);
            startDate.setHours(0, 0, 0, 0);

            if (today > startDate) {
                throw new Error("Cannot cancel. Rent period has already started.");
            }
        }

        const updatedBookingQuery = `
            UPDATE Bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *
        `;
        const updatedBookingResult = await client.query(updatedBookingQuery, [status, bookingId]);

        if (status === 'returned' || status === 'cancelled') {
            const updateVehicleQuery = `
                UPDATE Vehicles SET availability_status = 'available' WHERE id = $1
            `;
            await client.query(updateVehicleQuery, [currentBooking.vehicle_id]);
        }

        await client.query('COMMIT');

        return updatedBookingResult.rows[0];

    } catch (error: any) {
        if (client) {
            await client.query('ROLLBACK');
        }
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
};
export const bookingService = {
    createBookingService,
    getAllBookingsService,
    updateOne
};