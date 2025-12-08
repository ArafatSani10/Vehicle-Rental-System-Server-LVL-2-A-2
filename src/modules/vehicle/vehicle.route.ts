import express from "express"
import { vehicleController } from "./vehicle.controller";
const router = express.Router();
router.post("/", vehicleController.createVehicle);
router.get("/", vehicleController.getVehicle);
router.get("/:vehicleId", vehicleController.viewDetailsVehicle);
router.put("/:vehicleId", vehicleController.updateVehicle);
router.delete("/:vehicleId", vehicleController.deleteVehicle);
export const vehicleRoutes = router;