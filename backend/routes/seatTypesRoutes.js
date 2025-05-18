import { Router } from "express";
import seatTypeController from "../controllers/seatTypeController.js";
const seatTypeRoutes = Router();

seatTypeRoutes.get("/", seatTypeController.getSeatTypes);
seatTypeRoutes.get("/:id", seatTypeController.getSeatTypeById);
seatTypeRoutes.post("/", seatTypeController.createSeatType);
seatTypeRoutes.put("/:id", seatTypeController.updateSeatType);
seatTypeRoutes.delete("/:id", seatTypeController.deleteSeatType);
export default seatTypeRoutes;
