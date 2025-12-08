import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";

const createVehicle = async (req: Request, res: Response) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

    try {
        const result = await vehicleService.createVehicle(
            vehicle_name,
            type,
            registration_number,
            daily_rent_price,
            availability_status
        );

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
};
const getVehicle = async (req: Request, res: Response) => {
    try {
        const result = await vehicleService.getVehicle();
        const vehicles = result.rows;

        if (vehicles.length > 0) {
            res.status(200).json({
                success: true,
                message: "Vehicles retrieved successfully",
                data: vehicles
            });
        } else {
            res.status(200).json({
                success: true,
                message: "No vehicles found",
                data: [],
            });
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
const viewDetailsVehicle = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.params;

        const result = await vehicleService.viewDetailsVehicle(vehicleId);

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
};
const updateVehicle = async (req: Request, res: Response) => {
    try {
        const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
        const { vehicleId } = req.params;

        const result = await vehicleService.updateVehicle(
            vehicle_name,
            type,
            registration_number,
            daily_rent_price,
            availability_status,
            vehicleId
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vehicle Not found!",
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: result.rows[0],
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const { vehicleId } = req.params;

        const result = await vehicleService.deleteVehicle(vehicleId);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully",
            data: null,
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
export const vehicleController = {
    createVehicle,
    getVehicle,
    viewDetailsVehicle,
    updateVehicle,
    deleteVehicle
}