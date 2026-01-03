// backend/src/controllers/stock/admin.controller.js
import { db }from "../../../utils/firebase.js";

export const getAuditLogs = async (req, res) => {
  try {
    const snap = await db.collection("auditLogs")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

export const getCommissions = async (req, res) => {
  try {
    const snap = await db.collection("commissions")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const commissions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(commissions);
  } catch (error) {
    console.error("Error fetching commissions:", error);
    res.status(500).json({ message: "Failed to fetch commissions" });
  }
};
