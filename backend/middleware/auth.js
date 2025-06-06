import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
import jwt from "jsonwebtoken"

const verifyUser = async (req, res, next) => {
   const token  = req.cookies.token;
   if(!token){
    return res.status(401).json({ message: "Unauthorized" });
   }
   try {
    const decoded =  jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
   } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
   }

    };
    export default verifyUser