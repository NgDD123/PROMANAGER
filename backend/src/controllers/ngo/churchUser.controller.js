import { NGOUser } from '../../models/ngo/user.model.js';
import { Church } from '../../models/ngo/church.model.js';
import {
  canManageChurchUsers,
  normalizeChurchNavigationScopes,
} from '../../config/churchNavigationScopes.config.js';
import { provisionNgoStaffCredentials } from '../../services/ngoStaffProvisioning.service.js';
import { resolveChurchBranchContext } from '../../utils/churchBranchContext.js';

function memberDisplayName(member) {
  return (
    [member.firstName, member.lastName].filter(Boolean).join(' ').trim() ||
    (member.name || '').trim()
  );
}

async function churchUserPayloadFromMember(req, body) {
  const memberId = (body.churchMemberId || '').trim();
  if (!memberId) {
    const error = new Error('Select a church member');
    error.statusCode = 400;
    throw error;
  }

  const member = await Church.getById(memberId);
  if (
    !member ||
    member.organizationId !== req.organizationId ||
    member.recordType !== 'member'
  ) {
    const error = new Error('Church member not found');
    error.statusCode = 404;
    throw error;
  }

  const email = (member.email || '').trim().toLowerCase();
  if (!email) {
    const error = new Error(
      'Selected member must have an email on their registration before they can receive login credentials'
    );
    error.statusCode = 400;
    throw error;
  }

  const fullName = memberDisplayName(member);
  if (!fullName) {
    const error = new Error('Selected member must have a name on their registration');
    error.statusCode = 400;
    throw error;
  }

  const scopes = normalizeChurchNavigationScopes(body.churchNavigationScopes);
  if (!scopes.length) {
    const error = new Error('Select at least one church module for this user');
    error.statusCode = 400;
    throw error;
  }

  const existingStaff = await NGOUser.getAll(req.organizationId, { isChurchStaff: true });
  const duplicate = existingStaff.find(
    (u) => u.churchMemberId === memberId || (u.email || '').toLowerCase() === email
  );
  if (duplicate) {
    const error = new Error('This member already has a church user account');
    error.statusCode = 409;
    throw error;
  }

  const branchId = member.branchId || body.branchId || '';
  const draft = {
    organizationId: req.organizationId,
    branchId,
    fullName,
    email,
    phone: (member.phone || '').trim(),
    jobTitle: (body.jobTitle || member.ministry || 'Church Staff').trim(),
    roleName: 'Church Staff',
    accessScope: 'Church',
    accountStatus: 'Invited',
    isChurchStaff: true,
    churchNavigationScopes: scopes,
    churchMemberId: memberId,
    churchInvitedBy: req.ngoUserId,
    invitedBy: req.ngoUserId,
    notes: (body.notes || '').trim(),
  };

  const branchCtx = await resolveChurchBranchContext(draft);
  return {
    ...draft,
    branchId: branchCtx.branchId || branchId,
    branchName: branchCtx.branchName || '',
  };
}

function assertCanManage(req) {
  if (req.canManageChurchUsers || canManageChurchUsers(req.ngoUser)) return;
  const error = new Error('Church user management requires manager access');
  error.statusCode = 403;
  throw error;
}


export const getChurchUsers = async (req, res) => {
  try {
    assertCanManage(req);
    const users = await NGOUser.getAll(req.organizationId, { isChurchStaff: true });
    const visible = req.isNgoAdmin
      ? users
      : users.filter((u) => u.churchInvitedBy === req.ngoUserId);
    res.json({ success: true, data: visible.map(NGOUser.toSafe) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const getChurchUser = async (req, res) => {
  try {
    assertCanManage(req);
    const user = await NGOUser.getById(req.params.id);
    if (!user || user.organizationId !== req.organizationId || !user.isChurchStaff) {
      return res.status(404).json({ success: false, error: 'Church user not found' });
    }
    if (!req.isNgoAdmin && user.churchInvitedBy !== req.ngoUserId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    res.json({ success: true, data: NGOUser.toSafe(user) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const createChurchUser = async (req, res) => {
  try {
    assertCanManage(req);
    const payload = await churchUserPayloadFromMember(req, req.body);
    const user = await NGOUser.create(payload);
    const { user: provisioned, emailSent, emailError } = await provisionNgoStaffCredentials(user.id);
    res.status(201).json({
      success: true,
      data: { ...NGOUser.toSafe(provisioned), emailSent, emailError: emailError || null },
      emailSent,
      emailError: emailError || null,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const updateChurchUser = async (req, res) => {
  try {
    assertCanManage(req);
    const existing = await NGOUser.getById(req.params.id);
    if (!existing || existing.organizationId !== req.organizationId || !existing.isChurchStaff) {
      return res.status(404).json({ success: false, error: 'Church user not found' });
    }
    if (!req.isNgoAdmin && existing.churchInvitedBy !== req.ngoUserId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const scopes = normalizeChurchNavigationScopes(req.body.churchNavigationScopes);
    if (!scopes.length) {
      return res.status(400).json({ success: false, error: 'Select at least one church module' });
    }

    const user = await NGOUser.update(req.params.id, {
      jobTitle: (req.body.jobTitle ?? existing.jobTitle) || 'Church Staff',
      churchNavigationScopes: scopes,
      notes: (req.body.notes ?? existing.notes) || '',
      organizationId: req.organizationId,
    });

    res.json({ success: true, data: NGOUser.toSafe(user) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const deleteChurchUser = async (req, res) => {
  try {
    assertCanManage(req);
    const existing = await NGOUser.getById(req.params.id);
    if (!existing || existing.organizationId !== req.organizationId || !existing.isChurchStaff) {
      return res.status(404).json({ success: false, error: 'Church user not found' });
    }
    if (!req.isNgoAdmin && existing.churchInvitedBy !== req.ngoUserId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    await NGOUser.delete(req.params.id);
    res.json({ success: true, message: 'Church user removed' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const resendChurchUserCredentials = async (req, res) => {
  try {
    assertCanManage(req);
    const existing = await NGOUser.getById(req.params.id);
    if (!existing || existing.organizationId !== req.organizationId || !existing.isChurchStaff) {
      return res.status(404).json({ success: false, error: 'Church user not found' });
    }
    if (!req.isNgoAdmin && existing.churchInvitedBy !== req.ngoUserId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const { user, emailSent, emailError } = await provisionNgoStaffCredentials(req.params.id);
    res.json({
      success: true,
      data: { ...NGOUser.toSafe(user), emailSent, emailError: emailError || null },
      emailSent,
      emailError: emailError || null,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};
