import { db } from '../../../utils/firebase.js';

const COLLECTION = 'ngo_roles';

const SCOPE_VALUES = ['organization', 'branches', 'department', 'all'];

export const NAVIGATION_SCOPE_VALUES = [
  'projects',
  'contracts',
  'evaluations',
  'gis',
  'finance',
  'impact',
  'church',
  'audit',
  'beneficial-owners',
  'service-control',
  'settings',
];

function stripUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );
}

function normalizeNavigationScopes(scopes) {
  if (!Array.isArray(scopes)) return [];
  return [...new Set(scopes.filter((s) => NAVIGATION_SCOPE_VALUES.includes(s)))];
}

export class Role {
  static sanitize(data = {}) {
    const scope = String(data.scope || 'organization').toLowerCase();
    const normalizedScope = SCOPE_VALUES.includes(scope) ? scope : 'organization';
    const isSubRole = data.isSubRole !== undefined ? Boolean(data.isSubRole) : undefined;
    const navigationScopes = normalizeNavigationScopes(data.navigationScopes);

    return stripUndefined({
      organizationId: data.organizationId,
      branchId: data.branchId || undefined,
      name: (data.name || '').trim(),
      description: (data.description || '').trim(),
      scope: isSubRole ? 'branches' : normalizedScope,
      isSubRole,
      navigationScopes: isSubRole ? navigationScopes : undefined,
      code: data.code?.trim() || undefined,
      level: data.level != null ? Number(data.level) : undefined,
      permissions: Array.isArray(data.permissions) ? data.permissions : undefined,
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : undefined,
      reportingTo: data.reportingTo || undefined,
      departmentId: data.departmentId || undefined,
      isSystemRole: data.isSystemRole !== undefined ? Boolean(data.isSystemRole) : undefined,
      status: data.status || undefined
    });
  }

  static async create(data) {
    const role = this.sanitize({
      ...data,
      status: data.status || 'active',
      permissions: data.permissions || [],
      responsibilities: data.responsibilities || [],
      isSystemRole: data.isSystemRole || false,
      isSubRole: data.isSubRole ?? false,
      level: data.level || 1
    });

    if (role.isSubRole) {
      if (!role.branchId) throw new Error('Branch is required for sub-roles');
      if (!role.navigationScopes?.length) {
        throw new Error('Select at least one navigation scope for sub-roles');
      }
    }

    const docRef = await db().collection(COLLECTION).add({
      ...role,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...role };
  }

  static async getAll(organizationId, filters = {}) {
    let query = db().collection(COLLECTION);
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (filters.departmentId) query = query.where('departmentId', '==', filters.departmentId);
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.scope) query = query.where('scope', '==', filters.scope);
    if (filters.isSystemRole !== undefined) query = query.where('isSystemRole', '==', filters.isSystemRole);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await db().collection(COLLECTION).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Role not found');

    const updates = this.sanitize(data);
    const merged = { ...existing, ...updates };

    if (merged.isSubRole) {
      if (!merged.branchId) throw new Error('Branch is required for sub-roles');
      if (!merged.navigationScopes?.length) {
        throw new Error('Select at least one navigation scope for sub-roles');
      }
    }

    await db().collection(COLLECTION).doc(id).update({
      ...updates,
      updatedAt: new Date()
    });
    return this.getById(id);
  }

  static async delete(id) {
    await db().collection(COLLECTION).doc(id).delete();
  }

  static async assignPermissions(roleId, permissions) {
    await db().collection(COLLECTION).doc(roleId).update({
      permissions,
      updatedAt: new Date()
    });
    return this.getById(roleId);
  }

  static async getByDepartment(departmentId) {
    const snapshot = await db().collection(COLLECTION)
      .where('departmentId', '==', departmentId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getRoleHierarchy(organizationId) {
    const roles = await this.getAll(organizationId);
    return roles.sort((a, b) => (b.level || 0) - (a.level || 0));
  }
}

export { SCOPE_VALUES };
