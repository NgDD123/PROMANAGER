// models/production/productionPlan.model.js
import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const collection = db().collection("productionPlans");

export const ProductionPlanModel = {
  // Create new production plan
  async create(data) {
    const doc = collection.doc();
    const payload = {
      id: doc.id,
      planCode:
        data.planCode ||
        `PP-${new Date().toISOString().slice(0, 10)}-${doc.id.slice(0, 6)}`,
      finishedProductId: data.finishedProductId,
      finishedProductName: data.finishedProductName,
      plannedQty: Number(data.plannedQty) || 0,
      bom: data.bom || [], // [{ materialId, materialName, qtyPerUnit }]
      plannedStartDate: data.plannedStartDate || new Date().toISOString(),
      plannedEndDate: data.plannedEndDate || null,
      status: data.status || "planned", // planned | approved | in_progress | completed | cancelled
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      meta: data.meta || {},
    };
    await doc.set(payload);
    return payload;
  },

  // Find all plans
  async findAll() {
    const snap = await collection.orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // Find by ID
  async findById(id) {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async update(id, data) {
  if (!id) throw new Error("Document ID is missing");

  const docRef = collection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) throw new Error(`Plan with ID ${id} does not exist`);

  const upd = {
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await docRef.set(upd, { merge: true });

  const updatedDoc = await docRef.get();
  if (!updatedDoc.exists) throw new Error(`Failed to fetch updated plan ${id}`);

  return { id: updatedDoc.id, ...updatedDoc.data() };
},

  // Remove plan
  async remove(id) {
    await collection.doc(id).delete();
    return true;
  },
};
