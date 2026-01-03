// backend/src/models/stock/return.model.js
import { db } from '../../../utils/firebase.js';
import admin from 'firebase-admin';

const returnCollection = db().collection('returns');

export const ReturnModel = {
  async create(data) {
    const newDoc = returnCollection.doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const returnData = { ...data, createdAt: timestamp, updatedAt: timestamp };
    await newDoc.set(returnData);
    return { id: newDoc.id, ...returnData };
  },

  async findAll() {
    const snapshot = await returnCollection.get();
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
    const snap = await returnCollection.doc(id).get();
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
    const ref = returnCollection.doc(id);
    const updateData = { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    await ref.update(updateData);
    return { id, ...updateData };
  },

  async remove(id) {
    await returnCollection.doc(id).delete();
    return { id };
  },
};
