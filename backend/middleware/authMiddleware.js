
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided or invalid format.'
        });
      }

      const token = authHeader.split(' ')[1];

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
          });
        }

        // Check if user role is allowed
        if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient permissions.'
          });
        }

        req.user = decoded;
        next();
      });
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
};

export default authMiddleware;
    