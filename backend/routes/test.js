import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js"
const test = Router();
test.get("/get",authMiddleware(['ADMIN', 'CINEMA']),  (req, res) => {
    return res.status(200).json({
        success: true,
        message: "MovieTicket backend is running",
        data:req.user
    });
})

export default  test