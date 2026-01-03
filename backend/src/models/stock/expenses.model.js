import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const expensesCollection = db().collection("expenses");

export const ExpenseModel = {
  async create(data) {
    const newDoc = expensesCollection.doc();
    await newDoc.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: newDoc.id, ...data };
  },

  async findAll() {
    const snapshot = await expensesCollection.orderBy("date", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async findById(id) {
    const doc = await expensesCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async remove(id) {
    await expensesCollection.doc(id).delete();
    return true;
  }
};
