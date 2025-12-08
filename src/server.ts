
import express, { NextFunction, Request, Response } from "express";

import config from "./config";
import initDB, { pool } from "./config/db";
import logger from "./middleware/logger";
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/user/user.routes";

const app = express();
const port = config.port;
// parser
app.use(express.json());


// init DB Call here
const startServer = async () => {
    try {
        await initDB();
        console.log("✅ Database connected!");


    } catch (error) {
        console.error("❌ Failed to start server:", error);
    }
};




app.get('/', logger, (req: Request, res: Response) => {
    res.send('Next level Web development is running..!')
});






// create users another route
app.use("/api/v1/auth", authRoutes);


// get all users
app.use("/api/v1/users", userRoutes);



// update user
app.put("/api/v1/users/:userId", async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { name, phone, email } = req.body;

    try {
        const result = await pool.query(
            `UPDATE Users SET name =$1, email=$2, phone=$3 WHERE id=$4 RETURNING *`,
            [name, email, phone, userId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "user not found..!"
            });
        }
        else {
            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: result.rows[0],
            });
        }
    }
    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


// delete user

app.delete("/api/v1/users/:userId", async (req: Request, res: Response) => {
    const { userId } = req.params;


    try {
        const result = await pool.query(`
        DELETE FROM Users WHERE id =$1
        `, [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        else {
            res.status(200).json({
                success: true,
                message: "User deleted successfully",
                data: null,
            })
        }
    }

    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
})







// vehicles CRUD

// add vehicles
app.post("/api/v1/vehicles", async (req: Request, res: Response) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

    try {
        const result = await pool.query(`INSERT INTO Vehicles(vehicle_name,type,registration_number,daily_rent_price,availability_status) VALUES($1,$2,$3,$4,$5) RETURNING *`, [vehicle_name, type, registration_number, daily_rent_price, availability_status]);

        const newVehicle = result.rows[0];

        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: newVehicle
        });
    }
    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


// get all vehicles
app.get("/api/v1/vehicles", async (req: Request, res: Response) => {
    try {


        const result = await pool.query(`SELECT * FROM Vehicles`);

        const vehicles = result.rows;


        if (vehicles.length > 0) {
            res.status(200).json({
                success: true,
                message: "Vehicles retrieved successfully",
                data: vehicles
            });
        }

        else {
            res.status(200).json({
                success: true,
                message: "No vehicles found",
                data: [],
            });
        }
    }

    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// vehicles details
app.get("/api/v1/vehicles/:vehicleId", async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.params;

        const result = await pool.query(`SELECT * FROM Vehicles WHERE id = $1`, [vehicleId]);

        const vehicle = result.rows[0];

        if (vehicle) {
            res.status(200).json({
                success: true,
                message: "Vehicle retrieved successfully",
                data: vehicle,
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});


// update vehicles
app.put("/api/v1/vehicles/:vehicleId", async (req: Request, res: Response) => {
    try {
        const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
        const { vehicleId } = req.params;

        const result = await pool.query(
            `UPDATE Vehicles SET vehicle_name=$1, type=$2, registration_number=$3, daily_rent_price=$4, availability_status=$5 WHERE id =$6 RETURNING *`,
            [vehicle_name, type, registration_number, daily_rent_price, availability_status, vehicleId]
        );


        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Vehicle Not found.!",
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Vehicle updated successfully",
                data: result.rows[0],
            });
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// delete vehicles

app.delete("/api/v1/vehicles/:vehicleId", async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.params;

        const result = await pool.query(`DELETE FROM Vehicles WHERE id = $1`, [vehicleId]);

        const vehicle = result.rowCount;

        if (vehicle) {
            res.status(200).json({
                success: true,
                message: "Vehicle deleted successfully",
                data: null,
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});






// Bookings Crud

// create booking
app.post("/api/v1/bookings", async (req: Request, res: Response) => {
    try {
        const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;

        const vehicleResult = await pool.query(
            `SELECT vehicle_name, daily_rent_price FROM Vehicles WHERE id=$1`,
            [vehicle_id]
        );

        if (vehicleResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        const vehicle = vehicleResult.rows[0];

        const startDate = new Date(rent_start_date);
        const endDate = new Date(rent_end_date);
        const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) || 1;
        const totalPrice = vehicle.daily_rent_price * durationDays;

        await pool.query('BEGIN');

        const bookingResult = await pool.query(
            `INSERT INTO Bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice, "active"]
        );

        await pool.query(`UPDATE Vehicles SET availability_status = 'booked' WHERE id = $1`, [vehicle_id]);

        await pool.query('COMMIT');

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: {
                ...bookingResult.rows[0],
                vehicle: {
                    vehicle_name: vehicle.vehicle_name,
                    daily_rent_price: vehicle.daily_rent_price,
                }
            }
        });

    } catch (err: any) {
        await pool.query('ROLLBACK');
        res.status(500).json({ success: false, message: err.message });
    }
});

// get all bookings

app.get("/api/v1/bookings", async (req: Request, res: Response) => {
    const getBookingsQuery = `
        SELECT 
            b.id AS booking_id, 
            b.rent_start_date, 
            b.rent_end_date, 
            b.total_price, 
            b.status,
            u.name AS customer_name, 
            v.vehicle_name, 
            v.daily_rent_price
        FROM Bookings b
        JOIN Users u ON b.customer_id = u.id
        JOIN Vehicles v ON b.vehicle_id = v.id
        ORDER BY b.create_at DESC
    `;

    try {
        const result = await pool.query(getBookingsQuery);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No bookings found",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: result.rows
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve bookings"
        });
    }
});

// update bookings status
app.put("/api/v1/bookings/:bookingId", async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const { status } = req.body || {};

    if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
    }

    try {
        const bookingCheck = await pool.query(`SELECT * FROM Bookings WHERE id = $1`, [bookingId]);
        if (bookingCheck.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const currentBooking = bookingCheck.rows[0];

        if (status === 'cancelled') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startDate = new Date(currentBooking.rent_start_date);
            startDate.setHours(0, 0, 0, 0);

            if (today > startDate) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot cancel. Rent period has already started."
                });
            }
        }

        await pool.query('BEGIN');

        const updatedBookingResult = await pool.query(
            `UPDATE Bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, bookingId]
        );

        if (status === 'returned' || status === 'cancelled') {
            await pool.query(
                `UPDATE Vehicles SET availability_status = 'available' WHERE id = $1`,
                [currentBooking.vehicle_id]
            );
        }

        await pool.query('COMMIT');

        res.status(200).json({
            success: true,
            message: status === 'cancelled' ? "Booking cancelled successfully" : "Booking marked as returned. Vehicle is now available",
            data: updatedBookingResult.rows[0]
        });

    } catch (err: any) {
        if (pool) await pool.query('ROLLBACK');
        res.status(500).json({ success: false, message: err.message });
    }
});




// not found route

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not found..!",
        path: req.path
    })
})



startServer();

app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});






