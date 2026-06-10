import { DiamondOption } from '../../models/ngo/diamondOption.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export const createDiamondOption = async (req, res) => {
  try {
    const option = await DiamondOption.create(createPayload(req, req.body));
    res.status(201).json({ success: true, data: option });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllDiamondOptions = async (req, res) => {
  try {
    const { organizationId } = req.query;
    const filters = listFilters(req, {});
    let options = await DiamondOption.getAll(organizationId, filters);
    options = filterRecordsByOwner(req, options);
    res.json({ success: true, data: options });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDiamondOption = async (req, res) => {
  try {
    const option = await DiamondOption.getById(req.params.id);
    if (!option) return res.status(404).json({ success: false, error: 'Option not found' });
    if (denyUnlessCanAccess(req, res, option, 'Option')) return;
    res.json({ success: true, data: option });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDiamondOption = async (req, res) => {
  try {
    const existing = await DiamondOption.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Option')) return;

    const option = await DiamondOption.update(
      req.params.id,
      updatePayload(req, existing, req.body)
    );
    res.json({ success: true, data: option });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteDiamondOption = async (req, res) => {
  try {
    const existing = await DiamondOption.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Option')) return;

    await DiamondOption.delete(req.params.id);
    res.json({ success: true, message: 'Option deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
