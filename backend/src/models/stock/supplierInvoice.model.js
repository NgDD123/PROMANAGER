import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const supplierInvoiceCollection = db().collection("supplierInvoices");

export const SupplierInvoiceModel = {
  async create(data) {
    const newDoc = supplierInvoiceCollection.doc();
    await newDoc.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: newDoc.id, ...data };
  },

  async findAll() {
    const snapshot = await supplierInvoiceCollection.get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async findById(id) {
    const snap = await supplierInvoiceCollection.doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  },

  async update(id, data) {
    const ref = supplierInvoiceCollection.doc(id);
    await ref.update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id, ...data };
  },

  async remove(id) {
    const ref = supplierInvoiceCollection.doc(id);
    await ref.delete();
    return { id };
  },

  async findBySupplier(supplierId) {
    const snapshot = await supplierInvoiceCollection
      .where("supplierId", "==", supplierId)
      .get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};
