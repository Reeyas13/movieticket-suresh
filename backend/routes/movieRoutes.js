import { Router } from "express";
import moviesController from "../controllers/moviesController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../utils/multerConfig.js";

const movieRoutes = Router();

movieRoutes.get("/", moviesController.getAllMovies);
movieRoutes.get("/:id", moviesController.getMovieById);
movieRoutes.post("/", authMiddleware(['CINEMA']), upload.array('posterUrl', 5), moviesController.createMovies);
movieRoutes.put("/:id", moviesController.updateMovie);
movieRoutes.delete("/:id", moviesController.deleteMovie);
export default movieRoutes;