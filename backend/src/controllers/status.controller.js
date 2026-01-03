// backend/src/controllers/status.controller.js
import { setUserStatus, getOnlineUsers } from "../models/status.model.js";

// When user logs in or connects
export const goOnline = async (req, res) => {
  try {
    const result = await setUserStatus(req.user.uid, req.user.role, true);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to set online" });
  }
};

// When user logs out or disconnects
export const goOffline = async (req, res) => {
  try {
    const result = await setUserStatus(req.user.uid, req.user.role, false);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to set offline" });
  }
};

// Get all available doctors/pharmacies
export const listAvailable = async (req, res) => {
  try {
    const { role } = req.params; // "DOCTOR" | "PHARMACY" | "CALLCENTER"
    const users = await getOnlineUsers(role);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch online users" });
  }
};
