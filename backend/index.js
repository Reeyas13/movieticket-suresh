import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

import app from "./utils/express.js";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(express.static(path.join(__dirname, "/client/build")));

// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "/client/build/", "index.html"));
// })


app.listen(process.env.PORT || 5000, () => {
    console.log(`MovieTicket backend is running on http://localhost:${process.env.PORT}`); 
});