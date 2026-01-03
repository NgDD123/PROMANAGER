import {
  createPharmacy,
  findPharmaciesByName,
  getPharmacyById,
  updatePharmacy,
  deletePharmacy,
  getPrescriptionsForPharmacy,
  updatePrescriptionStatus as updateRxStatus
} from '../models/pharmacy.model.js';
import admin, { initFirebase } from '../../utils/firebase.js'; // 🔹 import

const { FieldValue } = admin.firestore;
await initFirebase(); // 🔹 Initialize Firebase before usage
const bucket = admin.storage().bucket();

// Upload file to Firebase Storage
const uploadFileToFirebase = async (file) => {
  const fileName = `pharmacies/${Date.now()}_${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  await fileUpload.save(file.buffer, {
    metadata: { contentType: file.mimetype },
    public: true,
    resumable: false,
  });

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
};

// ----------------------------
// CREATE
// ----------------------------
export const create = async (req, res) => {
  try {
    let legalDocUrl = null;
    if (req.file) legalDocUrl = await uploadFileToFirebase(req.file);

    const payload = {
      owner: req.user.id,
      ...req.body,
      legalDocument: legalDocUrl,
      createdAt: FieldValue.serverTimestamp()
    };

    const ph = await createPharmacy(payload);
    res.status(201).json(ph);
  } catch (err) {
    console.error('Create pharmacy error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ----------------------------
// UPDATE
// ----------------------------
export const update = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const legalDocUrl = await uploadFileToFirebase(req.file);
      updateData.legalDocument = legalDocUrl;
    }

    const updated = await updatePharmacy(req.params.id, updateData);
    res.json(updated);
  } catch (err) {
    console.error('Update pharmacy error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ----------------------------
// DELETE
// ----------------------------
export const remove = async (req, res) => {
  try {
    await deletePharmacy(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ----------------------------
// SEARCH & GET BY ID
// ----------------------------
export const search = async (req, res) => {
  try {
    const q = req.query.q || "";
    const pharmacies = await findPharmaciesByName(q);
    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getById = async (req, res) => {
  try {
    const pharmacy = await getPharmacyById(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
    res.json(pharmacy);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ----------------------------
// PRESCRIPTIONS (keep as needed)
// ----------------------------
export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await getPrescriptionsForPharmacy(req.params.id);
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePrescriptionStatus = async (req, res) => {
  try {
    const updated = await updateRxStatus(req.params.id, req.body.status);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
