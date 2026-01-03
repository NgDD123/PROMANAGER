// models/production/finishedGood.model.js
import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const collection = db().collection("finishedGoods");

export const FinishedGoodModel = {
  async create(data) {
    const doc = collection.doc();
    const payload = {
      id: doc.id,
      cycleId: data.cycleId,
      planId: data.planId,
      productId: data.productId,
      productName: data.productName,
      quantityProduced: Number(data.quantityProduced) || 0,
      unitCost: Number(data.unitCost) || 0,
      totalCost: Number(data.totalCost) || 0,
      addedToInventory: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await doc.set(payload);
    return payload;
  },

  async findAll() {
    const snap = await collection.orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async findByCycle(cycleId) {
    const snap = await collection.where("cycleId", "==", cycleId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async update(id, data) {
    const upd = { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    await collection.doc(id).update(upd);
    return this.findById(id);
  },

  async findById(id) {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async remove(id) {
    await collection.doc(id).delete();
    return true;
  },
};
