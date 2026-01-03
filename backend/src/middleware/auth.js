import jwt from "jsonwebtoken";
import { getUserById } from "../models/user.model.js";

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers["authorization"];
    if (!header) return res.status(401).json({ message: "Missing token" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await getUserById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid user" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Optional: Role-based access
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};
