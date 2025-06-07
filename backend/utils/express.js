import dotenv from 'dotenv';
// import { Server as SocketIOServer } from "socket.io";
import http from 'http';
import { Server as SocketIOServer } from "socket.io";
// Load environment variables from .env file
dotenv.config();
import express from "express";
import router from "../routes/route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { createOrder } from "../helpers/initiatePayment.js";
import {
  handleEsewaSuccess,
  updateOrderAfterPayment,
} from "../controllers/esewa.js";
import testingController from '../controllers/testingController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Important for parsing form data
app.use(cookieParser());
console.log(process.env.FRONTENDURL)
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTENDURL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const server = http.createServer(app); 

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",  // ⚠️ just for testing
    methods: ["GET", "POST"],
    credentials: true,
  },
});


io.on("connection", (socket) => {
  testingController.onConnection(socket, io);
});

server.listen(5000, () => {
  console.log(`MovieTicket backend is running on http://localhost:5000`);
});

// Configure static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "MovieTicket backend is running",
  });
});
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});
app.use("/api", router);
app.post("/api/payment/initiate", createOrder);
app.get("/api/esewa/success", handleEsewaSuccess, updateOrderAfterPayment);
app.get("/api/esewa/failure", (req, res) => {
  console.log(req.body);
  return res.status(200).json({ success: false });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/build/index.html"));
  });
}

export default app;
