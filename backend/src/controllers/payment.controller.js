import { db } from '../utils/firebase.js';
export const createIntent = async (req, res) => {
  const { amount, currency='USD', provider='mock' } = req.body;
  const rec = { provider, amount, currency, status: 'PENDING', createdAt: new Date() };
  const ref = await db().collection('payments').add(rec);
  res.json({ paymentId: ref.id, provider, clientToken: 'MOCK_CLIENT_TOKEN' });
};
export const webhook = async (req, res) => {
  const { paymentId, providerRef } = req.body;
  const docRef = db().collection('payments').doc(paymentId);
  await docRef.update({ status: 'PAID', providerRef, paidAt: new Date() });
  res.json({ ok: true });
};
