import { resolveUserRoleName } from '../config/loginRedirect.js';

/** Roles that see every item in stock sidebar sections (matches StockAuthContext.hasRole). */
const FULL_MENU_ROLES = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'DIRECTOR_MANAGER',
  'STOCK_ADMIN',
]);

export function hasFullStockMenuAccess(user) {
  const role = (resolveUserRoleName(user) || '').toUpperCase();
  return FULL_MENU_ROLES.has(role);
}

export function filterStockMenuLinks(links, user) {
  if (!user) return [];
  if (hasFullStockMenuAccess(user)) return links;
  const role = (resolveUserRoleName(user) || '').toUpperCase();
  return links.filter((link) =>
    (link.roles || []).some((r) => (r || '').toUpperCase() === role),
  );
}
