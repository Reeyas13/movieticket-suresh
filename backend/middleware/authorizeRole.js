// authorizeRole.js
import { getTokenInfo } from "../helpers/TokenHandler.js";

const authorizeRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = await getTokenInfo(token);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      // Add user info to request and proceed
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
};

export default authorizeRole;
