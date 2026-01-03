// controllers/user.controller.js
import { getUserById, getUserByEmail, updateUser, coll } from "../../models/stock/user.model.js";
import { logAudit } from "../../models/stock/audit.model.js";

/**
 * Example: Admin can list users (simple)
 */
export const listUsers = async (req, res) => {
  try {
    const snap = await coll().orderBy("createdAt", "desc").get();
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(users);
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const patchUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await updateUser(id, updates);
    await logAudit({ actorId: req.user.id, action: "USER_UPDATE", meta: { target: id, updates } });
    res.json(user);
  } catch (err) {
    console.error("Patch user error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
