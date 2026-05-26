import { Contract } from '../../models/ngo/contract.model.js';
import { aggregateMeMetrics, formatUtilizationPercent } from '../../utils/meMetrics.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

const ME_RECORD_EXISTS_ERROR =
  'You have already added a Monitoring & Evaluation record for this project.';

async function findContractForProject(projectId, organizationId) {
  if (!projectId) return null;
  const matches = await Contract.getAll(organizationId || undefined, projectId);
  return matches[0] || null;
}

export const createContract = async (req, res) => {
  try {
    const body = createPayload(req, req.body);
    if (body.projectId) {
      const existing = await findContractForProject(body.projectId, body.organizationId);
      if (existing) {
        return res.status(409).json({ success: false, error: ME_RECORD_EXISTS_ERROR });
      }
    }
    const contract = await Contract.create(body);
    res.status(201).json({ success: true, data: contract });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllContracts = async (req, res) => {
  try {
    const { organizationId, projectId, status } = req.query;
    const filters = listFilters(req, { status });
    let contracts = await Contract.getAll(organizationId, projectId, filters);
    contracts = filterRecordsByOwner(req, contracts);
    res.json({ success: true, data: contracts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getContractAnalytics = async (req, res) => {
  try {
    const { organizationId, projectId } = req.query;
    const filters = listFilters(req, {});
    let records = await Contract.getAll(organizationId, projectId, filters);
    records = filterRecordsByOwner(req, records);

    const aggregated = aggregateMeMetrics(records);
    const analytics = {
      ...aggregated,
      budgetUtilization: formatUtilizationPercent(aggregated.budgetUtilization),
      activityCompletion: formatUtilizationPercent(aggregated.activityCompletion),
      performance: formatUtilizationPercent(aggregated.performance),
      projectCompletion: formatUtilizationPercent(aggregated.projectCompletion),
      records,
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getContract = async (req, res) => {
  try {
    const contract = await Contract.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, contract, 'Contract')) return;
    res.json({ success: true, data: contract });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateContract = async (req, res) => {
  try {
    const existing = await Contract.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Contract')) return;

    const body = updatePayload(req, existing, req.body);
    const projectIdChanging =
      body.projectId !== undefined &&
      body.projectId &&
      body.projectId !== existing.projectId;

    if (projectIdChanging) {
      const duplicate = await findContractForProject(
        body.projectId,
        body.organizationId || existing.organizationId
      );
      if (duplicate && duplicate.id !== req.params.id) {
        return res.status(409).json({ success: false, error: ME_RECORD_EXISTS_ERROR });
      }
    }

    const contract = await Contract.update(req.params.id, body);
    res.json({ success: true, data: contract });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteContract = async (req, res) => {
  try {
    const existing = await Contract.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Contract')) return;
    await Contract.delete(req.params.id);
    res.json({ success: true, message: 'Contract deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
