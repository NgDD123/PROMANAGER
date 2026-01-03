import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const salesCollection = db().collection("sales");

export const SalesModel = {
  // CREATE SALE
  async create(data) {
    const newDoc = salesCollection.doc();
    const payload = {
      ...data,
      id: newDoc.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await newDoc.set(payload);
    return { id: newDoc.id, ...data };
  },

  // FIND ALL SALES
  async findAll() {
    const snapshot = await salesCollection.orderBy("createdAt", "desc").get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // FIND ONE SALE BY ID
  async findById(id) {
    const doc = await salesCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // UPDATE SALE
  async update(id, data) {
    const ref = salesCollection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;

    const updated = {
      ...doc.data(),
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await ref.update(updated);
    return updated;
  },

  // DELETE SALE
  async remove(id) {
    const ref = salesCollection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },
};
