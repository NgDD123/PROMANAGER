import { Organization } from '../../models/ngo/organization.model.js';

export const createOrganization = async (req, res) => {
  try {
    const organization = await Organization.create(req.body);
    res.status(201).json({ success: true, data: organization });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllOrganizations = async (req, res) => {
  try {
    if (req.isSuperAdmin) {
      const organizations = await Organization.getAll(req.query);
      return res.json({ success: true, data: organizations });
    }

    const organization = await Organization.getById(req.organizationId);
    res.json({ success: true, data: organization ? [organization] : [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOrganization = async (req, res) => {
  try {
    if (!req.isSuperAdmin && req.params.id !== req.organizationId) {
      return res.status(403).json({ success: false, error: 'Access denied for this organization' });
    }
    const organization = await Organization.getById(req.params.id);
    if (!organization) return res.status(404).json({ success: false, error: 'Organization not found' });
    res.json({ success: true, data: organization });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    if (!req.isSuperAdmin && req.params.id !== req.organizationId) {
      return res.status(403).json({ success: false, error: 'Access denied for this organization' });
    }
    const organization = await Organization.update(req.params.id, req.body);
    res.json({ success: true, data: organization });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    await Organization.delete(req.params.id);
    res.json({ success: true, message: 'Organization deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOrganizationStats = async (req, res) => {
  try {
    if (!req.isSuperAdmin && req.params.id !== req.organizationId) {
      return res.status(403).json({ success: false, error: 'Access denied for this organization' });
    }
    const stats = await Organization.getStats(req.params.id);
    if (!stats) return res.status(404).json({ success: false, error: 'Organization not found' });
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
