import { Router } from "express";

import showTimeController from "../controllers/showTimeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const showTimeRoutes = Router();    

showTimeRoutes.get("/",  authMiddleware(['CINEMA']),showTimeController.getShowTimes);
showTimeRoutes.get("/:id", authMiddleware(['CINEMA']), showTimeController.getShowTimeById);
showTimeRoutes.post("/", authMiddleware(['CINEMA']),showTimeController.createShowTime);
showTimeRoutes.put("/:id", authMiddleware(['CINEMA']), showTimeController.updateShowTime);
showTimeRoutes.delete("/:id",  authMiddleware(['CINEMA']),showTimeController.deleteShowTime);
export default showTimeRoutes