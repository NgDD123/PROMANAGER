// middleware/auth.js
import jwt from "jsonwebtoken";
import { getUserById } from "../../models/stock/user.model.js";

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers["authorization"];
    if (!header) return res.status(401).json({ message: "Missing token" });

    const parts = header.split(" ");
    if (parts.length !== 2) return res.status(401).json({ message: "Malformed token" });

    const token = parts[1];
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

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const userRole = (req.user.role || "").toUpperCase();
  const normalizedRoles = roles.map((r) => (r || "").toUpperCase());
  if (!normalizedRoles.includes(userRole)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};
