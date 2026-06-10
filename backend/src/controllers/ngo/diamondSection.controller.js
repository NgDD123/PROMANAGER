import { DiamondSection } from '../../models/ngo/diamondSection.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export const createDiamondSection = async (req, res) => {
  try {
    const section = await DiamondSection.create(createPayload(req, req.body));
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllDiamondSections = async (req, res) => {
  try {
    const { organizationId } = req.query;
    const filters = listFilters(req, {});
    let sections = await DiamondSection.getAll(organizationId, filters);
    sections = filterRecordsByOwner(req, sections);
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDiamondSection = async (req, res) => {
  try {
    const section = await DiamondSection.getById(req.params.id);
    if (!section) return res.status(404).json({ success: false, error: 'Section not found' });
    if (denyUnlessCanAccess(req, res, section, 'Section')) return;
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDiamondSection = async (req, res) => {
  try {
    const existing = await DiamondSection.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Section')) return;

    const section = await DiamondSection.update(
      req.params.id,
      updatePayload(req, existing, req.body)
    );
    res.json({ success: true, data: section });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteDiamondSection = async (req, res) => {
  try {
    const existing = await DiamondSection.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Section')) return;

    await DiamondSection.delete(req.params.id);
    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
