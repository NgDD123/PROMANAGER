import { Tender } from '../../models/ngo/tender.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export const createTender = async (req, res) => {
  try {
    const tender = await Tender.create(createPayload(req, req.body));
    res.status(201).json({ success: true, data: tender });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllTenders = async (req, res) => {
  try {
    const { organizationId, projectId } = req.query;
    const filters = listFilters(req, {});
    let tenders = await Tender.getAll(organizationId, projectId, filters);
    tenders = filterRecordsByOwner(req, tenders);
    res.json({ success: true, data: tenders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTender = async (req, res) => {
  try {
    const tender = await Tender.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, tender, 'Tender')) return;
    res.json({ success: true, data: tender });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTender = async (req, res) => {
  try {
    const existing = await Tender.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Tender')) return;
    const tender = await Tender.update(req.params.id, updatePayload(req, existing, req.body));
    res.json({ success: true, data: tender });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTender = async (req, res) => {
  try {
    const existing = await Tender.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Tender')) return;
    await Tender.delete(req.params.id);
    res.json({ success: true, message: 'Tender deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
