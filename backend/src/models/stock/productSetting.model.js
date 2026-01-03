import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const collection = db().collection("productSettings");

export const ProductSettingModel = {
  // CREATE PRODUCT SETTING
  async create(data) {
    const newDoc = collection.doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const payload = {
      id: newDoc.id,
      type: data.type || "Product",
      mainOrSub: data.mainOrSub || "Main Stock",
      location: data.location || "",
      storeCategory: data.storeCategory || "",
      productCategory: data.productCategory || "",
      name: data.name || "",
      quality: data.quality || "Medium",
      tax: Number(data.tax) || 0,
      openingStock: Number(data.openingStock) || 0,
      currentStock: Number(data.openingStock) || 0, // track stock movement
      reorderLevel: Number(data.reorderLevel) || 0,
      unit: data.unit || "pcs",
      status: data.status || "Active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await newDoc.set(payload);
    return { id: newDoc.id, ...payload };
  },

  // GET ALL PRODUCT SETTINGS
  async getAll() {
    const snapshot = await collection.orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // GET PRODUCT SETTING BY ID
  async getById(id) {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // UPDATE PRODUCT SETTING
  async update(id, data) {
    const ref = collection.doc(id);
    const existing = await ref.get();
    if (!existing.exists) return null;

    const updatedData = {
      ...existing.data(),
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await ref.update(updatedData);
    return { id, ...updatedData };
  },

  // UPDATE STOCK QUANTITY (used by sales/returns)
  async updateStock(id, quantityChange) {
    const ref = collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new Error("Product not found");

    const data = doc.data();
    const newStock = (Number(data.currentStock) || 0) + Number(quantityChange);
    if (newStock < 0) throw new Error("Insufficient stock");

    await ref.update({
      currentStock: newStock,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { id, newStock };
  },

  // DELETE PRODUCT SETTING
  async remove(id) {
    const ref = collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return false;
    await ref.delete();
    return true;
  },
};
