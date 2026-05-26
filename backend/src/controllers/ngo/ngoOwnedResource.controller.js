import {
  canAccessNgoRecord,
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export function buildOwnedResourceHandlers(Model, label = 'Record') {
  return {
    create: async (req, res) => {
      try {
        const record = await Model.create(createPayload(req, req.body));
        res.status(201).json({ success: true, data: record });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    },

    getAll: async (req, res) => {
      try {
        const filters = listFilters(req, {});
        const organizationId = req.organizationId || req.query.organizationId;
        let records = await Model.getAll(organizationId, filters);
        records = filterRecordsByOwner(req, records);
        res.json({ success: true, data: records });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    },

    getById: async (req, res) => {
      try {
        const record = await Model.getById(req.params.id);
        if (denyUnlessCanAccess(req, res, record, label)) return;
        res.json({ success: true, data: record });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    },

    update: async (req, res) => {
      try {
        const existing = await Model.getById(req.params.id);
        if (denyUnlessCanAccess(req, res, existing, label)) return;
        const record = await Model.update(req.params.id, updatePayload(req, existing, req.body));
        res.json({ success: true, data: record });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    },

    remove: async (req, res) => {
      try {
        const existing = await Model.getById(req.params.id);
        if (denyUnlessCanAccess(req, res, existing, label)) return;
        await Model.delete(req.params.id);
        res.json({ success: true, message: `${label} deleted` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    },
  };
}

export { canAccessNgoRecord, filterRecordsByOwner, listFilters, createPayload, updatePayload, denyUnlessCanAccess };
