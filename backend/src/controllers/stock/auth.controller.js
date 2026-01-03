// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  getUserByEmail,
  createUser,
  hashPassword,
  comparePassword,
  getUserById,
  createPasswordResetToken,
  getPasswordResetByToken,
  markPasswordResetUsed,
  updateUser,
  ALLOWED_ROLES,
} from "../../models/stock/user.model.js";
import { logAudit } from "../../models/stock/audit.model.js";

/**
 * Helper to sign tokens
 */
const signToken = (payload, expiresIn = "1h") =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn });

/**
 * Register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role = "GUEST", department = null, extra } = req.body;
    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const normalizedRole = (role || "GUEST").toUpperCase();
    const roleToUse = ALLOWED_ROLES.includes(normalizedRole) ? normalizedRole : "GUEST";

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      name,
      email,
      passwordHash,
      phone,
      role: roleToUse,
      department,
      extra,
    });

    await logAudit({ actorId: user.id, action: "USER_REGISTER", meta: { email: user.email, role: user.role } });

    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({
      token,
      user: { ...user, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await comparePassword(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({ id: user.id, role: user.role });

    // optional: mark user online
    await updateUser(user.id, { status: "ONLINE" }).catch(() => {});

    await logAudit({ actorId: user.id, action: "USER_LOGIN", meta: { email: user.email, role: user.role } });

    res.json({
      token,
      user: { ...user, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Logout
 */
export const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    await updateUser(userId, { status: "OFFLINE" });
    await logAudit({ actorId: userId, action: "USER_LOGOUT" });
    res.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Me
 */
export const me = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user, role: user.role });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Refresh
 */
export const refresh = async (req, res) => {
  try {
    const oldToken = req.body.token;
    if (!oldToken) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(oldToken, process.env.JWT_ACCESS_SECRET);
    const user = await getUserById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid user" });

    const newToken = signToken({ id: user.id, role: user.role });
    res.json({ token: newToken, user: { ...user, role: user.role } });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * Forgot password - create token and (optionally) send email
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await getUserByEmail(email);
    if (!user) return res.status(200).json({ message: "If the email exists, a reset link will be sent." }); // avoid revealing existence

    // generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    await createPasswordResetToken(user.id, token, 60); // 60 minutes

    // TODO: hook your email service here to send the reset link:
    // e.g. `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    // sendEmail(user.email, "Password reset", `Click: ${link}`);

    await logAudit({ actorId: user.id, action: "PASSWORD_RESET_REQUEST", meta: { email: user.email } });

    res.json({ message: "If the email exists, a reset link will be sent." });
  } catch (err) {
    console.error("Request password reset error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Reset password using token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and newPassword required" });

    const record = await getPasswordResetByToken(token);
    if (!record) return res.status(400).json({ message: "Invalid or expired token" });
    if (record.used) return res.status(400).json({ message: "Token already used" });
    if (new Date() > new Date(record.expiresAt.toDate ? record.expiresAt.toDate() : record.expiresAt)) {
      return res.status(400).json({ message: "Token expired" });
    }

    const hashed = await hashPassword(newPassword);
    await updateUser(record.userId, { passwordHash: hashed });
    await markPasswordResetUsed(record.id);
    await logAudit({ actorId: record.userId, action: "PASSWORD_RESET_COMPLETE" });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
