import { DiamondForm } from '../../models/ngo/diamondForm.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export const createDiamondForm = async (req, res) => {
  try {
    const form = await DiamondForm.create(createPayload(req, req.body));
    res.status(201).json({ success: true, data: form });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllDiamondForms = async (req, res) => {
  try {
    const { organizationId } = req.query;
    const filters = listFilters(req, {});
    let forms = await DiamondForm.getAll(organizationId, filters);
    forms = filterRecordsByOwner(req, forms);
    res.json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDiamondForm = async (req, res) => {
  try {
    const form = await DiamondForm.getById(req.params.id);
    if (!form) return res.status(404).json({ success: false, error: 'Form not found' });
    if (denyUnlessCanAccess(req, res, form, 'Form')) return;
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDiamondForm = async (req, res) => {
  try {
    const existing = await DiamondForm.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Form')) return;

    const form = await DiamondForm.update(
      req.params.id,
      updatePayload(req, existing, req.body)
    );
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteDiamondForm = async (req, res) => {
  try {
    const existing = await DiamondForm.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Form')) return;

    await DiamondForm.delete(req.params.id);
    res.json({ success: true, message: 'Form deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
