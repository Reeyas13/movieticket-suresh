import { Router } from "express";
import hallController from "../controllers/hallController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const hallRoutes = Router();

hallRoutes.get("/",authMiddleware(['CINEMA']), hallController.getHalls);
hallRoutes.get("/:id",authMiddleware(['CINEMA']), hallController.getHallById);
hallRoutes.post("/", authMiddleware(['CINEMA']), hallController.createHall);
hallRoutes.put("/:id",authMiddleware(['CINEMA']), hallController.updateHall);
hallRoutes.delete("/:id",authMiddleware(['CINEMA']), hallController.deleteHall);
export default hallRoutes;