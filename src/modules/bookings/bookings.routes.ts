import express, { Request, Response } from "express"
import { bookingController } from "./bookings.controller";
const router = express.Router();
router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBooking);
router.put("/:bookingId", bookingController.updateBooking)
export const bookingRoute = router;

