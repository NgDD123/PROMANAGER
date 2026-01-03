import { db } from '../utils/firebase.js';
export const createClinic = async (req, res) => {
  const payload = { owner: req.user.id, ...req.body, createdAt: new Date() };
  const ref = await db().collection('clinics').add(payload);
  res.json({ id: ref.id, ...payload });
};
export const searchClinics = async (req, res) => {
  const q = req.query.q || '';
  const snap = await db().collection('clinics').where('name','>=',q).limit(50).get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
};
