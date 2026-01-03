import { db } from '../../utils/firebase.js';
const coll = () => db().collection('prescriptions');

// Create a new prescription
export const createPrescription = async (data) => {
  const doc = await coll().add({ 
    ...data, 
    status: 'PENDING', 
    createdAt: new Date() 
  });
  return { id: doc.id, ...data };
};

// Get prescription by ID
export const getPrescriptionById = async (id) => {
  const doc = await coll().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

// Get prescriptions for a pharmacy
export const getPrescriptionsByPharmacy = async (pharmacyId) => {
  const snap = await coll().where('pharmacyId', '==', pharmacyId).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Update prescription status (PENDING / DISPENSED / PRICE_SET / PAID)
export const updatePrescriptionStatus = async (id, status) => {
  const ref = coll().doc(id);
  await ref.update({ status, updatedAt: new Date() });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
};

// 🔹 New: Set prices for items and calculate total
export const updatePrescriptionPrice = async (id, { items }) => {
  const totalAmount = items.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0);
  const ref = coll().doc(id);
  await ref.update({
    items,
    totalAmount,
    status: 'PRICE_SET',
    updatedAt: new Date(),
  });
  const doc = await ref.get();
  return { id: doc.id, ...doc.data() };
};

// 🔹 New: Mark prescription as paid
export const markPrescriptionPaid = async (id) => {
  const ref = db().collection("prescriptions").doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Prescription not found");

  await ref.update({
    paid: true,
    status: "PAID",
    updatedAt: new Date(),
  });

  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
};

