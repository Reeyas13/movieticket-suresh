import filmHallController from "../controllers/filmHallController.js";
import { Router } from "express";

const filmHallRoutes = Router();

filmHallRoutes.get("/", filmHallController.getFilmHalls);
filmHallRoutes.get("/:id", filmHallController.getFilmHallById);
filmHallRoutes.post("/", filmHallController.createFilmHall);
filmHallRoutes.put("/:id", filmHallController.updateFilmHall);
filmHallRoutes.delete("/:id", filmHallController.deleteFilmHall);
export default filmHallRoutes;