import { BeneficialOwner } from '../../models/ngo/beneficialOwner.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export const createBeneficialOwner = async (req, res) => {
  try {
    const owner = await BeneficialOwner.create(createPayload(req, req.body));
    res.status(201).json({ success: true, data: owner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllBeneficialOwners = async (req, res) => {
  try {
    const { organizationId, status, verificationStatus } = req.query;
    const filters = listFilters(req, { status, verificationStatus });
    let owners = await BeneficialOwner.getAll(organizationId, filters);
    owners = filterRecordsByOwner(req, owners);
    res.json({ success: true, data: owners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getBeneficialOwner = async (req, res) => {
  try {
    const owner = await BeneficialOwner.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, owner, 'Beneficial owner')) return;
    res.json({ success: true, data: owner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateBeneficialOwner = async (req, res) => {
  try {
    const existing = await BeneficialOwner.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Beneficial owner')) return;
    const owner = await BeneficialOwner.update(req.params.id, updatePayload(req, existing, req.body));
    res.json({ success: true, data: owner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteBeneficialOwner = async (req, res) => {
  try {
    const existing = await BeneficialOwner.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Beneficial owner')) return;
    await BeneficialOwner.delete(req.params.id);
    res.json({ success: true, message: 'Beneficial owner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyBeneficialOwner = async (req, res) => {
  try {
    const existing = await BeneficialOwner.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Beneficial owner')) return;
    const { verifiedBy } = req.body;
    const owner = await BeneficialOwner.verify(req.params.id, verifiedBy);
    res.json({ success: true, data: owner });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOwnershipStructure = async (req, res) => {
  try {
    const organizationId = req.params.organizationId || req.organizationId;
    const filters = listFilters(req, {});
    let owners = await BeneficialOwner.getAll(organizationId, filters);
    owners = filterRecordsByOwner(req, owners);

    const totalOwnership = owners.reduce((sum, owner) => sum + (owner.ownershipPercentage || 0), 0);

    res.json({
      success: true,
      data: {
        owners: owners.map((owner) => ({
          id: owner.id,
          name: owner.fullName,
          percentage: owner.ownershipPercentage,
          type: owner.ownershipType,
          position: owner.position,
        })),
        totalOwnership,
        ownerCount: owners.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPoliticallyExposed = async (req, res) => {
  try {
    const organizationId = req.params.organizationId || req.organizationId;
    let owners = await BeneficialOwner.getPoliticallyExposed(organizationId);
    owners = filterRecordsByOwner(req, owners);
    res.json({ success: true, data: owners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
