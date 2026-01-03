// models/production/materialConsumption.model.js
import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const collection = db().collection("materialConsumption");

export const MaterialConsumptionModel = {
  async create(data) {
    const doc = collection.doc();
    const payload = {
      id: doc.id,
      cycleId: data.cycleId,
      finishedGoodId: data.finishedGoodId || null,
      materialId: data.materialId,
      materialName: data.materialName,
      qtyUsed: Number(data.qtyUsed) || 0,
      unitCost: Number(data.unitCost) || 0,
      totalCost: Number(data.totalCost) || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await doc.set(payload);
    return payload;
  },

  async findByCycle(cycleId) {
    const snap = await collection.where("cycleId", "==", cycleId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async findByFinishedGood(fgId) {
    const snap = await collection.where("finishedGoodId", "==", fgId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};
