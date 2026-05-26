import { db } from '../../../utils/firebase.js';

const COLLECTION = 'ngo_users';

function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

export class NGOUser {
  static sanitize(data = {}) {
    const permissions = Array.isArray(data.permissions)
      ? data.permissions
      : typeof data.permissions === 'string' && data.permissions.trim()
        ? data.permissions.split(',').map((item) => item.trim()).filter(Boolean)
        : [];

    return stripUndefined({
      organizationId: data.organizationId,
      staffId: data.staffId || '',
      fullName: data.fullName || data.name || '',
      email: (data.email || '').trim().toLowerCase(),
      phone: data.phone || '',
      jobTitle: data.jobTitle || '',
      departmentId: data.departmentId || '',
      branchId: data.branchId || '',
      roleId: data.roleId || '',
      roleName: data.roleName || '',
      permissions,
      accessScope: data.accessScope || 'Organization',
      accountStatus: data.accountStatus || data.status || 'Invited',
      mfaRequired: Boolean(data.mfaRequired),
      lastLoginAt: data.lastLoginAt ?? null,
      invitedBy: data.invitedBy || '',
      approvedBy: data.approvedBy || '',
      notes: data.notes || '',
      isChurchStaff: data.isChurchStaff !== undefined ? Boolean(data.isChurchStaff) : undefined,
      churchNavigationScopes: Array.isArray(data.churchNavigationScopes)
        ? data.churchNavigationScopes
        : undefined,
      churchInvitedBy: data.churchInvitedBy || '',
      churchMemberId: data.churchMemberId || '',
      branchName: data.branchName || '',
    });
  }

  static toSafe(user) {
    if (!user) return user;
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  static async create(data) {
    const user = this.sanitize(data);
    const docRef = await db().collection(COLLECTION).add({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...user };
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection(COLLECTION);
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (filters.roleId) query = query.where('roleId', '==', filters.roleId);
    if (filters.departmentId) query = query.where('departmentId', '==', filters.departmentId);
    if (filters.branchId) query = query.where('branchId', '==', filters.branchId);
    if (filters.accountStatus) query = query.where('accountStatus', '==', filters.accountStatus);
    if (filters.isChurchStaff === true) query = query.where('isChurchStaff', '==', true);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    await db().collection(COLLECTION).doc(id).update({
      ...this.sanitize(data),
      updatedAt: new Date()
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection(COLLECTION).doc(id).delete();
  }

  static async activate(id, approvedBy = '') {
    await db().collection(COLLECTION).doc(id).update({
      accountStatus: 'Active',
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date()
    });
    return this.getById(id);
  }

  static async suspend(id, suspendedBy = '', reason = '') {
    await db().collection(COLLECTION).doc(id).update({
      accountStatus: 'Suspended',
      suspendedBy,
      suspensionReason: reason,
      suspendedAt: new Date(),
      updatedAt: new Date()
    });
    return this.getById(id);
  }

  static async updatePermissions(id, permissions = []) {
    await db().collection(COLLECTION).doc(id).update({
      permissions,
      updatedAt: new Date()
    });
    return this.getById(id);
  }

  static async updateProfile(id, data = {}) {
    const payload = stripUndefined({
      fullName: data.fullName,
      phone: data.phone,
      jobTitle: data.jobTitle,
    });
    if (!Object.keys(payload).length) {
      const error = new Error('No profile fields to update');
      error.statusCode = 400;
      throw error;
    }
    await db().collection(COLLECTION).doc(id).update({
      ...payload,
      updatedAt: new Date(),
    });
    return this.getById(id);
  }

  static async updatePasswordHash(id, passwordHash) {
    await db().collection(COLLECTION).doc(id).update({
      passwordHash,
      updatedAt: new Date(),
    });
    return this.getById(id);
  }
}
