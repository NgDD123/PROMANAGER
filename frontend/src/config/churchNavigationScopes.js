import { Users, DollarSign, CalendarDays, Building2 } from 'lucide-react';

/** Permissions assignable to church sub-users (within Church Management). */
export const CHURCH_TAB_SCOPES = [
  { id: 'members', label: 'Member Management', icon: Users },
  { id: 'finance', label: 'Church Finance', icon: DollarSign },
  { id: 'events', label: 'Events Management', icon: CalendarDays },
  { id: 'assets', label: 'Assets Management', icon: Building2 },
];

export const CHURCH_TAB_SCOPE_IDS = CHURCH_TAB_SCOPES.map((s) => s.id);

export function isChurchOnlyStaff(user) {
  return Boolean(user?.isChurchStaff);
}

export function canManageChurchUsers(user) {
  if (!user || user.isChurchStaff) return false;
  if (isNgoAdminForChurch(user)) return true;
  return (user.navigationScopes || []).includes('church');
}

function isNgoAdminForChurch(user) {
  if (!user) return false;
  if (user.roleId || user.isSubRole) return false;
  const roleName = String(user.roleName || user.role || '').trim().toLowerCase();
  if (roleName === 'administrator' || roleName === 'ngo_admin') return true;
  return !user.staffId && !user.invitedBy && !user.branchId && !user.departmentId;
}

export function resolveChurchTabScopes(user) {
  if (!user) return [];
  if (canManageChurchUsers(user)) return [...CHURCH_TAB_SCOPE_IDS];
  if (user.isChurchStaff) {
    return (user.churchNavigationScopes || []).filter((id) =>
      CHURCH_TAB_SCOPE_IDS.includes(id)
    );
  }
  if ((user.navigationScopes || []).includes('church')) return [...CHURCH_TAB_SCOPE_IDS];
  return [];
}

export function churchUserHasTab(user, tabId) {
  return resolveChurchTabScopes(user).includes(tabId);
}

export function formatChurchScopeLabels(scopeIds = []) {
  if (!scopeIds.length) return '—';
  return scopeIds
    .map((id) => CHURCH_TAB_SCOPES.find((s) => s.id === id)?.label || id)
    .join(', ');
}

/** Summary metrics on Church Management, grouped by tab scope. */
export const CHURCH_SUMMARY_CARDS = [
  { scope: 'members', label: 'Members', key: 'members' },
  { scope: 'members', label: 'Families', key: 'families' },
  { scope: 'members', label: 'Active members', key: 'activeMembers' },
  { scope: 'finance', label: 'Finance records', key: 'financeRecords' },
  { scope: 'finance', label: 'Church income', key: 'totalIncome', format: 'currency' },
  { scope: 'events', label: 'Events', key: 'events' },
  { scope: 'assets', label: 'Assets', key: 'assets' },
];

export function getChurchSummaryCardsForScopes(scopeIds = []) {
  const allowed = new Set(scopeIds);
  return CHURCH_SUMMARY_CARDS.filter((card) => allowed.has(card.scope));
}

export function getChurchWorkspaceTitle(user, branchName, workspaceTitle) {
  return (
    workspaceTitle ||
    branchName ||
    user?.branchName ||
    (isChurchOnlyStaff(user) ? 'Church' : 'Church Management')
  );
}

export function getChurchPageSubtitle(scopeIds = []) {
  const labels = scopeIds
    .map((id) => CHURCH_TAB_SCOPES.find((s) => s.id === id)?.label)
    .filter(Boolean);
  if (!labels.length) return 'Church Management';
  if (labels.length === 1) return labels[0];
  return labels.join(' · ');
}
