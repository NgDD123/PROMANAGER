import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const customerInvoiceCollection = db().collection("customerInvoices");

export const CustomerInvoiceModel = {
  async create(data) {
    const newDoc = customerInvoiceCollection.doc();
    await newDoc.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: newDoc.id, ...data };
  },

  async findAll() {
    const snapshot = await customerInvoiceCollection.get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async findById(id) {
    const snap = await customerInvoiceCollection.doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  },

  async update(id, data) {
    const ref = customerInvoiceCollection.doc(id);
    await ref.update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id, ...data };
  },

  async remove(id) {
    const ref = customerInvoiceCollection.doc(id);
    await ref.delete();
    return { id };
  },

  async findByCustomer(customerId) {
    const snapshot = await customerInvoiceCollection
      .where("customerId", "==", customerId)
      .get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};
