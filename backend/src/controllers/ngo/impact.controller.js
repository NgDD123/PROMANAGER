import { Impact } from '../../models/ngo/impact.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export const createImpact = async (req, res) => {
  try {
    const impact = await Impact.create(createPayload(req, req.body));
    res.status(201).json({ success: true, data: impact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllImpacts = async (req, res) => {
  try {
    const { organizationId, projectId } = req.query;
    const filters = listFilters(req, {});
    let impacts = await Impact.getAll(organizationId, projectId, filters);
    impacts = filterRecordsByOwner(req, impacts);
    res.json({ success: true, data: impacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getImpact = async (req, res) => {
  try {
    const impact = await Impact.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, impact, 'Impact')) return;
    res.json({ success: true, data: impact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateImpact = async (req, res) => {
  try {
    const existing = await Impact.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Impact')) return;
    const impact = await Impact.update(req.params.id, updatePayload(req, existing, req.body));
    res.json({ success: true, data: impact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteImpact = async (req, res) => {
  try {
    const existing = await Impact.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Impact')) return;
    await Impact.delete(req.params.id);
    res.json({ success: true, message: 'Impact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
