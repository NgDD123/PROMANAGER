import {
  Briefcase,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Church,
} from 'lucide-react';

/** Temporarily hidden NGO modules (sidebar + direct URL access). */
export const NGO_HIDDEN_MODULE_PATHS = [
  '/ngo/gis',
  '/ngo/audit',
  '/ngo/beneficial-owners',
  '/ngo/service-control',
];

export function isNgoHiddenModulePath(pathname) {
  return NGO_HIDDEN_MODULE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/** Sidebar modules assignable to branch sub-roles (multi-select). */
export const NGO_SUBROLE_NAV_SCOPES = [
  { id: 'projects', path: '/ngo/projects', label: 'Projects & Tenders', icon: Briefcase },
  { id: 'contracts', path: '/ngo/contracts', label: 'Contracts & Storage', icon: FileText },
  { id: 'finance', path: '/ngo/finance', label: 'Finance', icon: DollarSign },
  { id: 'impact', path: '/ngo/impact', label: 'Organization Report', icon: BarChart3 },
  { id: 'church', path: '/ngo/church', label: 'Church Management', icon: Church },
  { id: 'settings', path: '/ngo/settings', label: 'Settings', icon: Settings },
];

export const NGO_SUBROLE_SCOPE_IDS = NGO_SUBROLE_NAV_SCOPES.map((s) => s.id);

export const NGO_ADMIN_ONLY_PATHS = [
  '/ngo/organizations',
  '/ngo/branches',
  '/ngo/departments',
  '/ngo/roles',
  '/ngo/staff',
];

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

export function isNgoSubRoleUser(user) {
  return isNgoStaffMember(user);
}

/** NGO-invited staff with no full admin shell (church staff or church-only access). */
export function shouldUseNgoMinimalLayout(user) {
  if (!user || isNgoAdminUser(user)) return false;
  if (user.isChurchStaff) return true;
  const allowed = getAllowedNgoPaths(user) || [];
  return allowed.length === 1 && allowed[0] === '/ngo/church';
}

export function getNgoNavigationScopes(user) {
  if (!user || isNgoAdminUser(user)) return null;
  return Array.isArray(user.navigationScopes) ? user.navigationScopes : [];
}

export function getAllowedNgoPaths(user) {
  if (isNgoAdminUser(user)) return null;

  if (user.isChurchStaff) {
    return ['/ngo/church'];
  }

  return NGO_SUBROLE_NAV_SCOPES
    .filter((scope) => (user.navigationScopes || []).includes(scope.id))
    .map((scope) => scope.path);
}

export function getDefaultNgoPath(user) {
  if (isNgoAdminUser(user)) return '/ngo/dashboard';
  if (user?.isChurchStaff) return '/ngo/church';

  const allowed = getAllowedNgoPaths(user) || [];
  if (allowed.length > 0) return allowed[0];
  return '/ngo/access-pending';
}

export function isNgoPathAllowed(pathname, user) {
  if (isNgoHiddenModulePath(pathname)) return false;

  if (isNgoAdminUser(user)) return true;

  if (pathname === '/ngo/access-pending') {
    const allowed = getAllowedNgoPaths(user) || [];
    return allowed.length === 0;
  }

  if (pathname === '/ngo/dashboard' || pathname.startsWith('/ngo/dashboard/')) {
    return false;
  }

  if (NGO_ADMIN_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return false;
  }

  const allowed = getAllowedNgoPaths(user) || [];
  if (allowed.length === 0) return false;

  return allowed.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function filterNgoMenuItems(menuItems, user) {
  if (isNgoAdminUser(user)) return menuItems;

  if (user.isChurchStaff) {
    return menuItems.filter((item) => item.path === '/ngo/church');
  }

  const allowedIds = new Set(user.navigationScopes || []);
  return menuItems.filter((item) => {
    const segment = item.path.replace('/ngo/', '');
    if (segment === 'dashboard') return false;
    return allowedIds.has(segment);
  });
}

export function formatNavigationScopeLabels(scopeIds = []) {
  if (!scopeIds.length) return '—';
  return scopeIds
    .map((id) => NGO_SUBROLE_NAV_SCOPES.find((s) => s.id === id)?.label || id)
    .join(', ');
}
