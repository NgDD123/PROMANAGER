import { db } from '../utils/firebase.js';
import { findSKUsByPharmacy } from '../models/sku.model.js';

const scorePharmacies = (candidates) => {
  const min = Math.min(...candidates.map(c => c.total || 0));
  const max = Math.max(...candidates.map(c => c.total || 1));
  const norm = (v) => (max-min)? (v-min)/(max-min) : 0;
  return candidates.map(c => ({ ...c, score: 1 - norm(c.total) })).sort((a,b)=>b.score-a.score);
};

export const getQuotes = async (req, res) => {
  const { rxItems = [], location } = req.body;
  const pharmaciesSnap = await db().collection('pharmacies').get();
  const candidates = [];
  for (const doc of pharmaciesSnap.docs) {
    const ph = { id: doc.id, ...doc.data() };
    let total = 0; let covered = 0;
    const skus = await findSKUsByPharmacy(ph.id);
    for (const it of rxItems) {
      const cheapest = skus.sort((a,b)=>a.price-b.price)[0];
      if (cheapest) { total += cheapest.price; covered++; }
    }
    candidates.push({ pharmacyId: ph.id, name: ph.name, total, coverage: rxItems.length ? covered / rxItems.length : 1, rating: ph.ratingAvg || 3.5 });
  }
  const ranked = scorePharmacies(candidates);
  res.json(ranked);
};
