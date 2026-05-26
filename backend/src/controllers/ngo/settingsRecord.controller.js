import { SettingsRecord } from '../../models/ngo/settingsRecord.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

function typeFromPath(req) {
  if (req.path.includes('/permissions')) return 'permission';
  return 'document';
}

export const createSettingsRecord = async (req, res) => {
  try {
    const type = typeFromPath(req);
    const record = await SettingsRecord.create(type, createPayload(req, req.body));
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllSettingsRecords = async (req, res) => {
  try {
    const type = typeFromPath(req);
    const filters = listFilters(req, {});
    let records = await SettingsRecord.getAll(type, req.organizationId, filters);
    records = filterRecordsByOwner(req, records);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSettingsRecord = async (req, res) => {
  try {
    const type = typeFromPath(req);
    const record = await SettingsRecord.getById(type, req.params.id);
    if (denyUnlessCanAccess(req, res, record, type === 'permission' ? 'Permission' : 'Document')) return;
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSettingsRecord = async (req, res) => {
  try {
    const type = typeFromPath(req);
    const existing = await SettingsRecord.getById(type, req.params.id);
    if (denyUnlessCanAccess(req, res, existing, type === 'permission' ? 'Permission' : 'Document')) return;
    const record = await SettingsRecord.update(type, req.params.id, updatePayload(req, existing, req.body));
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteSettingsRecord = async (req, res) => {
  try {
    const type = typeFromPath(req);
    const existing = await SettingsRecord.getById(type, req.params.id);
    if (denyUnlessCanAccess(req, res, existing, type === 'permission' ? 'Permission' : 'Document')) return;
    await SettingsRecord.delete(type, req.params.id);
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
