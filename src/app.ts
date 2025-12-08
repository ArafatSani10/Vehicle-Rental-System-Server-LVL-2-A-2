import express, { Request, Response } from "express";
import initDB from "./config/db";
import logger from "./middleware/logger";
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/user/user.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.route";
import { bookingRoute } from "./modules/bookings/bookings.routes";
const app = express();
app.use(express.json());
const startServer = async () => {
    try {
        await initDB();
        console.log("Database connected!");
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};
app.get('/', logger, (req: Request, res: Response) => {
    res.send('Next level Web development is running..!');
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoute);
// not found route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not found..!",
        path: req.path
    })
})
startServer();
export default app;





