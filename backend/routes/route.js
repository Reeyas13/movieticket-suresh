import { Router } from "express";   
// import userRouter from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import test from "./test.js";
import filmHallRoutes from "./filmHallRoutes.js";
import hallRoutes from "./hallRoutes.js";
import seatRoutes from "./seatRoutes.js";
import seatTypeRoutes from "./seatTypesRoutes.js";
import movieRoutes from "./movieRoutes.js";
import showTimeRoutes from "./showTimeRoutes.js";
import frontedRoutes from "./frontedRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
const router = Router();

router.use("/", authRoutes)
router.use("/", test)
router.use("/film-hall", filmHallRoutes)
router.use("/hall", hallRoutes)
router.use("/seat", seatRoutes)
router.use("/seat-type", seatTypeRoutes)
router.use("/movies", movieRoutes)
router.use("/show-times", showTimeRoutes)
router.use("/frontend", frontedRoutes)
router.use("/", paymentRoutes)



export default router