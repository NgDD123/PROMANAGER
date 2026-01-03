import { db } from '../../utils/firebase.js';

const coll = () => db().collection('pharmacies');
const prescriptionsColl = () => db().collection('prescriptions');

// ----------------------------
// PHARMACIES
// ----------------------------
export const createPharmacy = async (data) => {
  const doc = await coll().add({ ...data, createdAt: new Date() });
  return { id: doc.id, ...data };
};

export const findPharmaciesByName = async (q) => {
  if (!q) {
    const snap = await coll().limit(50).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  const snap = await coll()
    .where('name', '>=', q)
    .where('name', '<=', q + '\uf8ff')
    .limit(50)
    .get();

  if (snap.empty) return [];
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getPharmacyById = async (id) => {
  const doc = await coll().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

// Update Pharmacy
export const updatePharmacy = async (id, data) => {
  const ref = coll().doc(id);
  await ref.update({ ...data, updatedAt: new Date() });
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
};

// Delete Pharmacy
export const deletePharmacy = async (id) => {
  await coll().doc(id).delete();
  return { success: true };
};

// ----------------------------
// PRESCRIPTIONS
// ----------------------------
export const getPrescriptionsForPharmacy = async (pharmacyId) => {
  const snap = await prescriptionsColl()
    .where('pharmacyId', '==', pharmacyId)
    .orderBy('createdAt', 'desc')
    .get();

  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updatePrescriptionStatus = async (prescriptionId, status) => {
  const ref = prescriptionsColl().doc(prescriptionId);
  await ref.update({ status, updatedAt: new Date() });
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
};
