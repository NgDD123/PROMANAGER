// backend/src/models/stock/stockAudit.model.js
import { db } from '../../../utils/firebase.js';
import admin from 'firebase-admin';

const auditCollection = db().collection('stock_audits');

export const StockAuditModel = {
  async log(action, data, userId) {
    const newDoc = auditCollection.doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const entry = { action, data, userId, createdAt: timestamp, updatedAt: timestamp };
    await newDoc.set(entry);
    return { id: newDoc.id, ...entry };
  },

  async findAll() {
    const snapshot = await auditCollection.get();
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
    const snap = await auditCollection.doc(id).get();
    if (!snap.exists) return null;
    const data = snap.data();
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
    };
  },
};
