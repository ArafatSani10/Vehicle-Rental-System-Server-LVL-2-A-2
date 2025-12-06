
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import path from "path";


dotenv.config({ path: path.join(process.cwd(), ".env") });
const app = express();
const port = 5000;


// database
const pool = new Pool({
    connectionString: `${process.env.CONNECTION_STR}`,
});

const initDB = async () => {
    await pool.query(`

        CREATE TABLE IF NOT EXISTS Users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone VARCHAR(15) NOT NULL,
        role VARCHAR(50) NOT NULL,
        create_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        );
        
        
        
        `);


    await pool.query(`
        CREATE TABLE IF NOT EXISTS Vehicles(
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(100) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        daily_rent_price NUMERIC(10, 2) NOT NULL CHECK (daily_rent_price > 0),
        availability_status VARCHAR(10) NOT NULL CHECK (availability_status IN ('available', 'booked'))
        );


       `);


    await pool.query(`
       CREATE TABLE IF NOT EXISTS Bookings(
       id SERIAL PRIMARY KEY,
       customer_id INT REFERENCES Users(id) ON DELETE CASCADE,
       vehicle_id INT REFERENCES Vehicles(id) ON DELETE CASCADE,
       rent_start_date DATE NOT NULL,
       rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
       status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'returned')),
        create_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
       );

  
     `);
};


// init DB Call here

initDB();

app.get('/', (req: Request, res: Response) => {
    res.send('Next level Web development is running..!')
});

// parser
app.use(express.json());





// vehicles related apis

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














app.listen(port, () => {
    console.log(`Server is running  on port ${port}`)
});


