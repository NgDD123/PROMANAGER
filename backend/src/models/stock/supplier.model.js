import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const supplierCollection = db().collection("suppliers");

export const SupplierModel = {
  async create(data) {
    const newDoc = supplierCollection.doc();
    await newDoc.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: newDoc.id, ...data };
  },

  async findAll() {
    const snapshot = await supplierCollection.get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async findById(id) {
    const snap = await supplierCollection.doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  },

  async update(id, data) {
    const ref = supplierCollection.doc(id);
    await ref.update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id, ...data };
  },

  async remove(id) {
    const ref = supplierCollection.doc(id);
    await ref.delete();
    return { id };
  },
};
