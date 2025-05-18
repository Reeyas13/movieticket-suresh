import seatController from "../controllers/seatController.js";
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const seatRoutes = Router();

seatRoutes.get("/", seatController.getSeats);
seatRoutes.get("/hall", authMiddleware(['CINEMA']), seatController.getSeatsByHallId);
seatRoutes.get("/:id", seatController.getSeatById);
seatRoutes.post("/",authMiddleware(['CINEMA']),  seatController.createSeat);
seatRoutes.post("/multiple", seatController.createMultipleSeats);
seatRoutes.put("/:id", seatController.updateSeat);
seatRoutes.delete("/:id", seatController.deleteSeat);

export default seatRoutes;