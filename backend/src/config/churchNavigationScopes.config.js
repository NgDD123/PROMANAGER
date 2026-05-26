/** Church Management main tabs (sub-permissions within /ngo/church). */
export const CHURCH_TAB_SCOPE_IDS = ['members', 'finance', 'events', 'assets'];

export const CHURCH_TAB_LABELS = {
  members: 'Member Management',
  finance: 'Church Finance',
  events: 'Events Management',
  assets: 'Assets Management',
  users: 'User Management',
};

export function normalizeChurchNavigationScopes(scopes = []) {
  if (!Array.isArray(scopes)) return [];
  return scopes.filter((id) => CHURCH_TAB_SCOPE_IDS.includes(id));
}

export function getFullChurchNavigationScopes() {
  return [...CHURCH_TAB_SCOPE_IDS];
}

export function canManageChurchUsers(user) {
  if (!user || user.isChurchStaff) return false;
  if (user.roleId || user.isSubRole) {
    return Array.isArray(user.navigationScopes) && user.navigationScopes.includes('church');
  }
  const roleName = String(user.roleName || user.role || '').trim().toLowerCase();
  if (roleName === 'administrator' || roleName === 'ngo_admin') return true;
  return !user.staffId && !user.invitedBy && !user.branchId && !user.departmentId;
}

export function resolveChurchNavigationScopes(user, navigationScopes = []) {
  if (!user) return [];
  if (canManageChurchUsers(user)) return getFullChurchNavigationScopes();
  if (user.isChurchStaff) {
    return normalizeChurchNavigationScopes(user.churchNavigationScopes);
  }
  if (Array.isArray(navigationScopes) && navigationScopes.includes('church')) {
    return getFullChurchNavigationScopes();
  }
  return [];
}

export function churchUserHasTab(user, tabId, navigationScopes = []) {
  const allowed = resolveChurchNavigationScopes(user, navigationScopes);
  return allowed.includes(tabId);
}
