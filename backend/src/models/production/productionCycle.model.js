// models/production/productionCycle.model.js
import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const collection = db().collection("productionCycles");

export const ProductionCycleModel = {
  // ✅ Create new production cycle
  async create(data) {
    const doc = collection.doc();
    const payload = {
      id: doc.id,
      planId: data.planId,
      name: data.name || `Cycle-${doc.id.slice(0, 6)}`,
      batchNo: data.batchNo || `BATCH-${doc.id.slice(0, 6)}`,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null,
      consumedMaterials: data.consumedMaterials || [],
      producedQty: Number(data.producedQty) || 0,
      quantityPlanned: data.quantityPlanned || 0,
      quantityCompleted: data.quantityCompleted || 0,
      wasteQty: Number(data.wasteQty) || 0,
      productId: data.productId || null,
      productName: data.productName || null,
      status: data.status || "in_progress",
      costSummary: data.costSummary || {
        materialCost: 0,
        laborCost: 0,
        overheadCost: 0,
        totalCost: 0,
        costPerUnit: 0,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      meta: data.meta || {},
    };
    await doc.set(payload);
    return payload;
  },

  async findAll() {
    const snap = await collection.orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async findById(id) {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async findByPlan(planId) {
    const snap = await collection.where("planId", "==", planId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async update(id, data) {
    const upd = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await collection.doc(id).set(upd, { merge: true });
    const updated = await collection.doc(id).get();
    return { id: updated.id, ...updated.data() };
  },

  async remove(id) {
    await collection.doc(id).delete();
    return true;
  },
};
