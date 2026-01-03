import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const fixedAssetsCollection = db().collection("fixedAssets");

export const FixedAssetModel = {
  async create(data) {
    // Create a shallow copy to avoid mutating caller object
    const sanitizedData = { ...data };

    // Provide defaults and avoid undefined values. Firestore will reject undefined fields.
    if (!sanitizedData.acquisitionDate && sanitizedData.date) {
      sanitizedData.acquisitionDate = sanitizedData.date;
    }
    if (!sanitizedData.acquisitionDate) {
      sanitizedData.acquisitionDate = new Date().toISOString();
    }
    if (!sanitizedData.depreciationStartDate) {
      sanitizedData.depreciationStartDate = sanitizedData.acquisitionDate;
    }

    // Ensure numeric values
    sanitizedData.cost = Number(sanitizedData.cost || 0);
    sanitizedData.usefulLife = Number(sanitizedData.usefulLife || 5);
    sanitizedData.accumulatedDepreciation = Number(sanitizedData.accumulatedDepreciation || 0);

    // Remove any keys with value `undefined` (Firestore doesn't accept undefined)
    Object.keys(sanitizedData).forEach((k) => sanitizedData[k] === undefined && delete sanitizedData[k]);

    sanitizedData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    sanitizedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    const newDoc = fixedAssetsCollection.doc();
    await newDoc.set(sanitizedData);

    // Return a representation for the API response (note createdAt/updatedAt are server timestamps)
    return { id: newDoc.id, ...sanitizedData };
  },

  async findAll() {
    const snapshot = await fixedAssetsCollection.orderBy("acquisitionDate", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async findById(id) {
    const doc = await fixedAssetsCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async update(id, data) {
    const sanitizedData = { ...data };
    // Remove undefined keys to prevent firestore errors
    Object.keys(sanitizedData).forEach((key) => sanitizedData[key] === undefined && delete sanitizedData[key]);

    sanitizedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await fixedAssetsCollection.doc(id).update(sanitizedData);
    return this.findById(id);
  },

  async remove(id) {
    await fixedAssetsCollection.doc(id).delete();
    return true;
  },
};
