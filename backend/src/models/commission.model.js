import { db } from '../utils/firebase.js';
const coll = () => db().collection('commissions');

export const createCommission = async (data) => {
  const doc = await coll().add({ ...data, createdAt: new Date(), paid: false });
  return { id: doc.id, ...data };
};

export const listCommissions = async () => {
  const snap = await coll().orderBy('createdAt','desc').limit(200).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
