import { Project } from '../../models/ngo/project.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export const createProject = async (req, res) => {
  try {
    const project = await Project.create(createPayload(req, req.body));
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const { organizationId, status } = req.query;
    const filters = listFilters(req, { status });
    let projects = await Project.getAll(organizationId, filters);
    projects = filterRecordsByOwner(req, projects);
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.getById(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    if (denyUnlessCanAccess(req, res, project, 'Project')) return;
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const existing = await Project.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Project')) return;

    const project = await Project.update(req.params.id, updatePayload(req, existing, req.body));
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const existing = await Project.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Project')) return;

    await Project.delete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
