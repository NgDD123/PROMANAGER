// backend/src/models/stock/adjustment.model.js
import { db } from '../../../utils/firebase.js';
import admin from 'firebase-admin';

const adjustmentCollection = db().collection('adjustments');

export const AdjustmentModel = {
  async create(data) {
    const newDoc = adjustmentCollection.doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const adjustmentData = { ...data, createdAt: timestamp, updatedAt: timestamp };
    await newDoc.set(adjustmentData);
    return { id: newDoc.id, ...adjustmentData };
  },

  async findAll() {
    const snapshot = await adjustmentCollection.get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      };
    });
  },

  async findById(id) {
    const snap = await adjustmentCollection.doc(id).get();
    if (!snap.exists) return null;
    const data = snap.data();
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
    };
  },

  async update(id, data) {
    const ref = adjustmentCollection.doc(id);
    const updateData = { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    await ref.update(updateData);
    return { id, ...updateData };
  },

  async remove(id) {
    await adjustmentCollection.doc(id).delete();
    return { id };
  },
};
