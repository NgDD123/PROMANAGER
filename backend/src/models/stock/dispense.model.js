import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const dispenseCollection = db().collection("dispenses");

export const DispenseModel = {
  async create(data) {
    const newDoc = dispenseCollection.doc();

    const newData = {
      productId: data.productId || null,
      product: data.product || "",
      quantity: Number(data.quantity) || 0,
      price: Number(data.price) || 0,
      customer: data.customer || "Unknown Customer",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await newDoc.set(newData);
    return { id: newDoc.id, ...newData };
  },

  async findAll() {
    const snapshot = await dispenseCollection.orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async findById(id) {
    const doc = await dispenseCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async update(id, data) {
    const ref = dispenseCollection.doc(id);
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await ref.update(updateData);
    return { id, ...updateData };
  },

  async remove(id) {
    await dispenseCollection.doc(id).delete();
    return { id };
  },
};
