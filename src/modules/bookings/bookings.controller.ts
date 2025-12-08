import { Request, Response } from 'express';
import { bookingService } from './bookings.service';
const createBooking = async (req: Request, res: Response) => {
    try {

        const newBookingData = await bookingService.createBookingService(req.body);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: newBookingData
        });

    } catch (err: any) {
        let status = 500;
        const errorMessage = err.message;

        if (errorMessage.includes('not found')) {
            status = 404;
        } else if (errorMessage.includes('already booked')) {
            status = 400;
        } else if (errorMessage.includes('duplicate')) {
            status = 409;
        }

        res.status(status).json({ success: false, message: errorMessage });
    }
};
const getBooking = async (req: Request, res: Response) => {
    try {
        const result = await bookingService.getAllBookingsService();

        if (result.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No bookings found",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: result
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve bookings",
            error: err.message
        });
    }
};
const updateBooking = async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId as string;
    const status = req.body.status as string;

    if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
    }

    try {
        const updatedBookingData = await bookingService.updateOne(parseInt(bookingId), status);

        res.status(200).json({
            success: true,
            message: status === 'cancelled' ? "Booking cancelled successfully" : "Booking status updated successfully",
            data: updatedBookingData
        });

    } catch (err: any) {
        let status = 500;
        const errorMessage = err.message;

        if (errorMessage.includes('Booking not found')) {
            status = 404;
        } else if (errorMessage.includes('Cannot cancel') || errorMessage.includes('invalid')) {
            status = 400;
        }

        res.status(status).json({ success: false, message: errorMessage });
    }
};
export const bookingController = {
    createBooking,
    getBooking,
    updateBooking
}