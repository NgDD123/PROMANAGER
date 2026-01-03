import { db } from '../utils/firebase.js';
import { createCommission } from '../models/commission.model.js';
import { findSKUsByPharmacy } from '../models/sku.model.js';

export const createOrder = async (req, res) => {
  const { pharmacyId, items = [], address, deliveryFee = 0 } = req.body;
  let subtotal = 0;
  const skus = await findSKUsByPharmacy(pharmacyId);
  for (const it of items) {
    const sku = skus.find(s => s.id === it.sku);
    if (!sku || (sku.stockQty || 0) < it.qty) return res.status(400).json({ message: 'Out of stock for an item' });
    subtotal += sku.price * it.qty;
  }
  const total = subtotal + deliveryFee;
  const orderRef = await db().collection('orders').add({
    patient: req.user.id, pharmacy: pharmacyId, subtotal, deliveryFee, total, paymentStatus: 'PENDING', orderStatus: 'PLACED', address, items, createdAt: new Date()
  });
  await createCommission({ source: 'PHARMACY_SALE', sourceId: orderRef.id, amount: subtotal, commissionRate: 0.10, commissionAmount: +(subtotal * 0.10) });
  if (deliveryFee) await createCommission({ source: 'DELIVERY', sourceId: orderRef.id, amount: deliveryFee, commissionRate: 0.15, commissionAmount: +(deliveryFee * 0.15) });
  const orderDoc = await orderRef.get();
  res.json({ id: orderRef.id, ...orderDoc.data() });
};

export const getOrder = async (req, res) => {
  const doc = await db().collection('orders').doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ message: 'Order not found' });
  res.json({ id: doc.id, ...doc.data() });
};
