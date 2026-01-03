// backend/src/models/status.model.js
import { db } from "../../utils/firebase.js";

const coll = () => db().collection("statuses");

// Set user online/offline
export const setUserStatus = async (userId, role, online) => {
  const ref = coll().doc(userId);
  await ref.set(
    { userId, role, online, updatedAt: new Date() },
    { merge: true }
  );
  return { userId, role, online };
};

// Get all online users by role
export const getOnlineUsers = async (role) => {
  const snap = await coll()
    .where("role", "==", role)
    .where("online", "==", true)
    .get();

  return snap.docs.map((d) => d.data());
};
