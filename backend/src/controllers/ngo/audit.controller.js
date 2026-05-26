import { Audit } from '../../models/ngo/audit.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export const createAudit = async (req, res) => {
  try {
    const audit = await Audit.create(createPayload(req, req.body));
    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllAudits = async (req, res) => {
  try {
    const { organizationId, auditType, status, riskLevel } = req.query;
    const filters = listFilters(req, { auditType, status, riskLevel });
    let audits = await Audit.getAll(organizationId, filters);
    audits = filterRecordsByOwner(req, audits);
    res.json({ success: true, data: audits });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAudit = async (req, res) => {
  try {
    const audit = await Audit.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, audit, 'Audit')) return;
    res.json({ success: true, data: audit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAudit = async (req, res) => {
  try {
    const existing = await Audit.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Audit')) return;
    const audit = await Audit.update(req.params.id, updatePayload(req, existing, req.body));
    res.json({ success: true, data: audit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAudit = async (req, res) => {
  try {
    const existing = await Audit.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Audit')) return;
    await Audit.delete(req.params.id);
    res.json({ success: true, message: 'Audit deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addAuditFinding = async (req, res) => {
  try {
    const existing = await Audit.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Audit')) return;
    const audit = await Audit.addFinding(req.params.id, req.body);
    res.json({ success: true, data: audit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAuditTrail = async (req, res) => {
  try {
    const { organizationId, entityType, entityId } = req.query;
    let trail = await Audit.getAuditTrail(organizationId || req.organizationId, entityType, entityId);
    trail = filterRecordsByOwner(req, trail);
    res.json({ success: true, data: trail });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getComplianceStatus = async (req, res) => {
  try {
    const organizationId = req.params.organizationId || req.organizationId;
    const filters = listFilters(req, {});
    let audits = await Audit.getAll(organizationId, filters);
    audits = filterRecordsByOwner(req, audits);

    const total = audits.length;
    const completed = audits.filter((a) => a.status === 'completed').length;
    const highRisk = audits.filter((a) => a.riskLevel === 'high').length;

    res.json({
      success: true,
      data: {
        totalAudits: total,
        completedAudits: completed,
        pendingAudits: total - completed,
        highRiskFindings: highRisk,
        complianceRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
