// backend/src/models/stock/purchase.model.js
import { db } from '../../../utils/firebase.js';
import admin from 'firebase-admin';

// Call db() because it's a function
const purchaseCollection = db().collection('purchases');

export const PurchaseModel = {
  async create(data) {
    const newDoc = purchaseCollection.doc();
    await newDoc.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: newDoc.id, ...data };
  },

  async findAll() {
    const snapshot = await purchaseCollection.get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async findById(id) {
    const snap = await purchaseCollection.doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  },

  async update(id, data) {
    const ref = purchaseCollection.doc(id);
    await ref.update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id, ...data };
  },

  async remove(id) {
    const ref = purchaseCollection.doc(id);
    await ref.delete();
    return { id };
  },

  // --- New method to adjust stock for a purchase ---
  async adjustStock(id, qtyChange) {
    const ref = purchaseCollection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Purchase not found");

    const currentStock = doc.data().currentStock || 0;
    const newStock = currentStock + qtyChange;

    await ref.update({ currentStock: newStock, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    return { id, currentStock: newStock };
  },
};
