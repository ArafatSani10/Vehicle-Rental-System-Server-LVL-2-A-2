
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




app.post("/", (req: Request, res: Response) => {
    console.log(req);

    res.status(201).json({
        success: true,
        message: "API is working.."
    });
});

app.listen(port, () => {
    console.log(`Server is running  on port ${port}`)
});


