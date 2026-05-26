import {
  canManageChurchUsers,
  churchUserHasTab,
  resolveChurchNavigationScopes,
} from '../config/churchNavigationScopes.config.js';

export function attachChurchAccessContext(req, _res, next) {
  const user = req.ngoUser || {};
  req.churchNavigationScopes = resolveChurchNavigationScopes(
    user,
    req.navigationScopes || user.navigationScopes || []
  );
  req.canManageChurchUsers = req.isNgoAdmin || canManageChurchUsers(user);
  next();
}

export function requireChurchTabFromBody(req, res, next) {
  const domain = req.body?.domain;
  if (!domain) return next();
  return requireChurchTab(domain)(req, res, next);
}

export function requireChurchModuleAccess(req, res, next) {
  const user = req.ngoUser || {};
  if (req.isNgoAdmin) return next();
  if (canManageChurchUsers(user)) return next();
  if (user.isChurchStaff && (req.churchNavigationScopes || []).length) return next();
  if ((req.navigationScopes || []).includes('church')) return next();
  return res.status(403).json({
    success: false,
    error: 'You do not have access to Church Management',
  });
}

export function requireChurchManager(req, res, next) {
  if (req.canManageChurchUsers) return next();
  return res.status(403).json({
    success: false,
    error: 'Church user management requires church manager access',
  });
}

export function requireChurchTab(tabId) {
  return (req, res, next) => {
    if (req.isNgoAdmin) return next();
    const user = req.ngoUser || {};
    if (churchUserHasTab(user, tabId, req.navigationScopes)) return next();
    return res.status(403).json({
      success: false,
      error: `You do not have access to ${tabId} in Church Management`,
    });
  };
}

export function requireChurchTabFromQuery(req, res, next) {
  const domain = req.query.domain || req.body?.domain;
  if (!domain) return next();
  return requireChurchTab(domain)(req, res, next);
}
