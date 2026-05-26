export const NGO_ADMIN_ONLY_PATHS = [
  '/ngo/organizations',
  '/ngo/branches',
  '/ngo/departments',
  '/ngo/roles',
  '/ngo/staff',
];

export const NGO_SCOPE_ROUTE_MAP = {
  projects: 'projects',
  contracts: 'contracts',
  gis: 'gis',
  finance: 'finances',
  impact: 'impacts',
  audit: 'audits',
  'beneficial-owners': 'beneficial-owners',
  'service-control': 'operations',
  settings: 'organizations',
};

export function isNgoStaffMember(user) {
  if (!user) return false;
  if (user.isChurchStaff) return true;
  if (user.roleId || user.isSubRole) return true;

  const roleName = String(user.roleName || user.role || '').trim().toLowerCase();
  if (roleName === 'administrator' || roleName === 'ngo_admin') return false;

  return Boolean(user.staffId || user.invitedBy || user.branchId || user.departmentId);
}

export function isNgoAdminUser(user) {
  if (!user) return false;
  return !isNgoStaffMember(user);
}

export function getNgoNavigationScopes(user) {
  if (!user || isNgoAdminUser(user)) return null;
  return Array.isArray(user.navigationScopes) ? user.navigationScopes : [];
}

export function getDefaultNgoPath(user) {
  if (isNgoAdminUser(user)) return '/ngo/dashboard';
  if (user?.isChurchStaff) return '/ngo/church';

  const scopes = getNgoNavigationScopes(user) || [];
  const scopeToPath = {
    projects: '/ngo/projects',
    contracts: '/ngo/contracts',
    gis: '/ngo/gis',
    finance: '/ngo/finance',
    impact: '/ngo/impact',
    audit: '/ngo/audit',
    'beneficial-owners': '/ngo/beneficial-owners',
    'service-control': '/ngo/service-control',
    settings: '/ngo/settings',
    church: '/ngo/church',
  };

  const firstScope = scopes.find((scope) => scopeToPath[scope]);
  if (firstScope) return scopeToPath[firstScope];
  return '/ngo/access-pending';
}

export function ngoUserHasScope(user, scopeId) {
  if (isNgoAdminUser(user)) return true;
  return (getNgoNavigationScopes(user) || []).includes(scopeId);
}
