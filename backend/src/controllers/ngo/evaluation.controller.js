import { Evaluation } from '../../models/ngo/evaluation.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export const createEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.create(createPayload(req, req.body));
    res.status(201).json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllEvaluations = async (req, res) => {
  try {
    const { organizationId, projectId } = req.query;
    const filters = listFilters(req, {});
    let evaluations = await Evaluation.getAll(organizationId, projectId, filters);
    evaluations = filterRecordsByOwner(req, evaluations);
    res.json({ success: true, data: evaluations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, evaluation, 'Evaluation')) return;
    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateEvaluation = async (req, res) => {
  try {
    const existing = await Evaluation.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Evaluation')) return;
    const evaluation = await Evaluation.update(req.params.id, updatePayload(req, existing, req.body));
    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteEvaluation = async (req, res) => {
  try {
    const existing = await Evaluation.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Evaluation')) return;
    await Evaluation.delete(req.params.id);
    res.json({ success: true, message: 'Evaluation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
