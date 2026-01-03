import { db } from '../utils/firebase.js';
export const createBranding = async (req, res) => {
  const payload = { ...req.body, createdAt: new Date() };
  const ref = await db().collection('branding').add(payload);
  res.json({ id: ref.id, ...payload });
};
export const listBrandings = async (req, res) => {
  const snap = await db().collection('branding').limit(200).get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
};
