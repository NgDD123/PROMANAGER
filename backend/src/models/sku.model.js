import { db } from '../utils/firebase.js';
const coll = () => db().collection('skus');

export const addSKU = async (data) => {
  const doc = await coll().add({ ...data, createdAt: new Date() });
  return { id: doc.id, ...data };
};

export const findSKUsByPharmacy = async (pharmacyId) => {
  const snap = await coll().where('pharmacy','==',pharmacyId).get();
  if (snap.empty) return [];
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
