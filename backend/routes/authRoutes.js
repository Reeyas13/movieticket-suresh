import { Router } from "express";
import authController from "../controllers/authController.js";
import upload, { handleMulterError } from '../utils/multerConfig.js';
const authRoutes = Router();
authRoutes.post("/auth/login", authController.login);
authRoutes.post("/auth/register/cinema",upload.array('images', 5),handleMulterError, authController.registerCinema);
authRoutes.post("/auth/register", authController.registerUser);

export default authRoutes;