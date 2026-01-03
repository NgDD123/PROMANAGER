import {
  createPrescription,
  getPrescriptionById,
  getPrescriptionsByPharmacy,
  updatePrescriptionStatus,
  updatePrescriptionPrice as updatePrescriptionPriceModel,
  markPrescriptionPaid as markPrescriptionPaidModel
} from '../models/prescription.model.js';

/**
 * Doctor/Admin creates a prescription
 */
export const createRx = async (req, res) => {
  try {
    const payload = {
      patient: req.body.patientId,
      doctor: req.user.id,
      diagnosis: req.body.diagnosis,
      notes: req.body.notes,
      items: req.body.items || [],
      pharmacyId: req.body.pharmacyId, // must match a valid pharmacy UID
    };
    const rx = await createPrescription(payload);
    res.status(201).json(rx);
  } catch (err) {
    console.error('Create prescription error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Pharmacy gets all prescriptions assigned to it
 */
export const getPharmacyRx = async (req, res) => {
  try {
     console.log("👉 Authenticated user:", req.user);
    if (!req.user.pharmacyId){ 
      console.warn("⚠️ No pharmacyId found for user:", req.user.id, req.user.email);
      return res.status(400).json({ message: "Pharmacy not assigned" });
    }
    console.log("✅ Fetching prescriptions for pharmacy:", req.user.pharmacyId);
    const rows = await getPrescriptionsByPharmacy(req.user.pharmacyId);
     console.log("📦 Prescriptions found:", rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Get pharmacy prescriptions error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


/**
 * Pharmacy updates prescription status
 */
export const updateRxStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING','DISPENSED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const rx = await getPrescriptionById(req.params.id);
    if (!rx) return res.status(404).json({ message: 'Prescription not found' });

    // ✅ compare pharmacyId instead of user.id
    if (rx.pharmacyId !== req.user.pharmacyId && req.user.role !== 'ADMIN') {
      console.log(
        "❌ Forbidden update. rx.pharmacyId:", rx.pharmacyId,
        "user.pharmacyId:", req.user.pharmacyId,
        "user.id:", req.user.id
      );
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await updatePrescriptionStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    console.error('Update prescription status error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const setPrescriptionPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;  // expect items with price & qty
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Items with price are required' });
    }

    const updated = await updatePrescriptionPriceModel(id, { items });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark prescription as paid

export const markPrescriptionPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await markPrescriptionPaidModel(id);
    res.json(updated);
  } catch (err) {
    console.error("Mark paid error:", err);
    res.status(400).json({ error: "Failed to mark as paid" });
  }
}; 