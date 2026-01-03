// models/production/qualityInspection.model.js
import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const collection = db().collection("qualityInspections");

export const QualityInspectionModel = {
  async create(data) {
    const doc = collection.doc();
    const payload = {
      id: doc.id,
      cycleId: data.cycleId,
      inspector: data.inspector || "system",
      passedQty: Number(data.passedQty) || 0,
      rejectedQty: Number(data.rejectedQty) || 0,
      remarks: data.remarks || "",
      status: data.status || (data.rejectedQty > 0 ? "failed" : "passed"),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await doc.set(payload);
    return payload;
  },

  async findByCycle(cycleId) {
    const snap = await collection.where("cycleId", "==", cycleId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};
