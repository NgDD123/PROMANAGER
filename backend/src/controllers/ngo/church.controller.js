import { Church } from '../../models/ngo/church.model.js';
import { Role } from '../../models/ngo/role.model.js';
import { resolveChurchBranchContext } from '../../utils/churchBranchContext.js';
import {
  buildOwnedResourceHandlers,
  filterRecordsByOwner,
  listFilters,
} from './ngoOwnedResource.controller.js';

const handlers = buildOwnedResourceHandlers(Church, 'Church record');

export const createChurchRecord = handlers.create;
export const getChurchRecord = handlers.getById;
export const updateChurchRecord = handlers.update;
export const deleteChurchRecord = handlers.remove;

export const getAllChurchRecords = async (req, res) => {
  try {
    const filters = listFilters(req, {
      domain: req.query.domain,
      recordType: req.query.recordType,
      branchId: req.query.branchId,
    });
    const organizationId = req.organizationId || req.query.organizationId;
    let records = await Church.getAll(organizationId, filters);
    records = filterRecordsByOwner(req, records);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateChurchMemberId = async (req, res) => {
  try {
    const count = await Church.countMembers(req.organizationId);
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(4, '0');
    res.json({
      success: true,
      data: { memberId: `MBR-${year}-${seq}` },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getChurchWorkspace = async (req, res) => {
  try {
    const user = req.ngoUser;
    let branchId = user?.branchId || '';

    if (!branchId && user?.roleId) {
      const role = await Role.getById(user.roleId);
      if (role?.branchId) branchId = role.branchId;
    }

    const { branchId: resolvedId, branchName } = await resolveChurchBranchContext(user, {
      branchId,
    });
    res.json({
      success: true,
      data: {
        branchId: resolvedId,
        branchName,
        workspaceTitle: branchName || 'Church',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getChurchSummary = async (req, res) => {
  try {
    const organizationId = req.organizationId || req.query.organizationId;
    const records = filterRecordsByOwner(
      req,
      await Church.getAll(organizationId, {})
    );

    const byDomain = (domain) => records.filter((r) => r.domain === domain);
    const members = byDomain('members');
    const finance = byDomain('finance');
    const events = byDomain('events');
    const assets = byDomain('assets');

    const income = finance
      .filter((r) => ['tithe', 'offering', 'donation', 'pledge'].includes(r.recordType))
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const expenses = finance
      .filter((r) => r.recordType === 'expense')
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    res.json({
      success: true,
      data: {
        members: members.filter((r) => r.recordType === 'member').length,
        families: members.filter((r) => r.recordType === 'family').length,
        activeMembers: members.filter(
          (r) => r.recordType === 'member' && r.membershipStatus === 'Active'
        ).length,
        financeRecords: finance.length,
        totalIncome: income,
        totalExpenses: expenses,
        events: events.length,
        assets: assets.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
