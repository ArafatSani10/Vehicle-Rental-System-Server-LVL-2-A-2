import express from "express"
import { vehicleController } from "./vehicle.controller";
import auth from "../../middleware/auth";
const router = express.Router();
router.post("/", auth("admin"), vehicleController.createVehicle);
router.get("/", vehicleController.getVehicle);
router.get("/:vehicleId", vehicleController.viewDetailsVehicle);
router.put("/:vehicleId", auth("admin"), vehicleController.updateVehicle);
router.delete("/:vehicleId", auth("admin"), vehicleController.deleteVehicle);
export const vehicleRoutes = router;