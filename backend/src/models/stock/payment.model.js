import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const supplierPayments = db().collection("supplierPayments");
const customerPayments = db().collection("customerPayments");

export const PaymentModel = {
  // ===== SUPPLIER PAYMENTS =====
  async createSupplierPayment(data) {
    const newDoc = supplierPayments.doc();
    await newDoc.set({
      ...data,
      type: "supplier",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: newDoc.id, ...data };
  },

  async findAllSupplierPayments() {
    const snapshot = await supplierPayments.get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async findSupplierPaymentById(id) {
    const snap = await supplierPayments.doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  },

  async updateSupplierPayment(id, data) {
    const ref = supplierPayments.doc(id);
    await ref.update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id, ...data };
  },

  async removeSupplierPayment(id) {
    await supplierPayments.doc(id).delete();
    return { id };
  },

  async findBySupplier(supplierId) {
    const snapshot = await supplierPayments.where("supplierId", "==", supplierId).get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // ===== CUSTOMER PAYMENTS =====
  async createCustomerPayment(data) {
    const newDoc = customerPayments.doc();
    await newDoc.set({
      ...data,
      type: "customer",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id: newDoc.id, ...data };
  },

  async findAllCustomerPayments() {
    const snapshot = await customerPayments.get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async findCustomerPaymentById(id) {
    const snap = await customerPayments.doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  },

  async updateCustomerPayment(id, data) {
    const ref = customerPayments.doc(id);
    await ref.update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { id, ...data };
  },

  async removeCustomerPayment(id) {
    await customerPayments.doc(id).delete();
    return { id };
  },

  async findByCustomer(customerId) {
    const snapshot = await customerPayments.where("customerId", "==", customerId).get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};
