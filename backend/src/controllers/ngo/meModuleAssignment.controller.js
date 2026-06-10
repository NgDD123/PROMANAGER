import { MeModuleAssignment } from '../../models/ngo/meModuleAssignment.model.js';

export const getMeModuleAssignments = async (req, res) => {
  try {
    const organizationId = req.query.organizationId || req.organizationId;
    if (!organizationId) {
      return res.status(400).json({ success: false, error: 'organizationId is required' });
    }
    const record = await MeModuleAssignment.getByOrganizationId(organizationId);
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const upsertMeModuleAssignments = async (req, res) => {
  try {
    const organizationId = req.body.organizationId || req.organizationId;
    if (!organizationId) {
      return res.status(400).json({ success: false, error: 'organizationId is required' });
    }
    const record = await MeModuleAssignment.upsert(organizationId, {
      assignments: req.body.assignments,
      updatedBy: req.ngoUserId,
    });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
