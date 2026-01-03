import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const accountsCollection = db().collection("accounts");

export const AccountModel = {
  async create(data) {
    const newDoc = accountsCollection.doc(); // Firestore auto-ID
    await newDoc.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: newDoc.id, ...data };
  },

  async findAll() {
    const snapshot = await accountsCollection.get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async removeAll() {
    const snapshot = await accountsCollection.get();
    const batch = db().batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return snapshot.size;
  }
};
