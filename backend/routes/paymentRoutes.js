import express from "express";
import paymentController from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const paymentRoutes = express.Router();

// Middleware (if needed) to ensure user is authenticated
// For example:
// import { authenticate } from "../middlewares/auth.js";
// paymentRoutes.use(authenticate);

// Create a new payment
paymentRoutes.post("/payments",authMiddleware(['CINEMA','USER','ADMIN']), paymentController.createPayment);

// Update payment status
paymentRoutes.patch("/payments/:paymentId/status",authMiddleware(['CINEMA','USER','ADMIN']), paymentController.updatePaymentStatus);

// Get all payments of the logged-in user (supports pagination and status filtering)
paymentRoutes.get("/payments",authMiddleware(['CINEMA','USER','ADMIN']), paymentController.getUserPayments);

// Get payment details by ID
paymentRoutes.get("/payments/:paymentId",authMiddleware(['CINEMA','USER','ADMIN']), paymentController.getPaymentById);

// Get ticket details by ID
paymentRoutes.get("/tickets/:ticketId", authMiddleware(['CINEMA','USER','ADMIN']),paymentController.getTicketById);

// Cancel a pending payment
paymentRoutes.delete("/payments/:paymentId",authMiddleware(['CINEMA','USER','ADMIN']), paymentController.cancelPayment);

export default paymentRoutes;
