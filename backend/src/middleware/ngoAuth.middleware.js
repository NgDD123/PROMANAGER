import jwt from 'jsonwebtoken';
import { NGOUser } from '../models/ngo/user.model.js';
import { Role } from '../models/ngo/role.model.js';
import { isNgoAdminUser, ngoUserHasScope } from '../config/ngoNavigationScopes.config.js';
import {
  canManageChurchUsers,
  resolveChurchNavigationScopes,
} from '../config/churchNavigationScopes.config.js';

export function ngoAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Authorization required' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!decoded.organizationId) {
      return res.status(403).json({ success: false, error: 'No organization assigned to this account' });
    }

    req.ngoUserId = decoded.id;
    req.organizationId = decoded.organizationId;
    req.userRole = decoded.role || 'ngo_admin';
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ success: false, error: message });
  }
}

/** Reject access when the route targets a different organization than the signed-in admin. */
export function assertNgoOrgAccess(req, res, next) {
  const targetId = req.params.organizationId || req.params.id;
  if (targetId && targetId !== req.organizationId) {
    return res.status(403).json({ success: false, error: 'Access denied for this organization' });
  }
  next();
}

/** Force list/create payloads to the tenant organization from the JWT. */
export function bindNgoTenant(req, _res, next) {
  req.query.organizationId = req.organizationId;
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    req.body.organizationId = req.organizationId;
  }
  next();
}

export function denyForeignNgoResource(req, res, resource) {
  if (!resource) {
    res.status(404).json({ success: false, error: 'Not found' });
    return true;
  }
  if (resource.organizationId && resource.organizationId !== req.organizationId) {
    res.status(403).json({ success: false, error: 'Access denied for this organization' });
    return true;
  }
  return false;
}

/** Load NGO user record and role scopes after JWT auth. */
export async function attachNgoUserContext(req, res, next) {
  try {
    const user = await NGOUser.getById(req.ngoUserId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    let navigationScopes = [];
    let isSubRole = false;

    if (user.roleId) {
      const role = await Role.getById(user.roleId);
      if (role) {
        isSubRole = Boolean(role.isSubRole);
        navigationScopes = role.navigationScopes || [];
      }
    }

    const ngoUser = {
      ...user,
      isSubRole,
      navigationScopes,
    };

    req.ngoUser = ngoUser;
    req.isNgoAdmin = isNgoAdminUser(ngoUser);
    req.navigationScopes = navigationScopes;
    req.churchNavigationScopes = resolveChurchNavigationScopes(ngoUser, navigationScopes);
    req.canManageChurchUsers = canManageChurchUsers(ngoUser);
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function requireNgoAdmin(req, res, next) {
  if (req.isNgoAdmin) return next();
  return res.status(403).json({ success: false, error: 'Administrator access required' });
}

export function requireNgoScope(...scopeIds) {
  return (req, res, next) => {
    if (req.isNgoAdmin) return next();
    const allowed = scopeIds.some((scopeId) => ngoUserHasScope(req.ngoUser, scopeId));
    if (allowed) return next();
    return res.status(403).json({ success: false, error: 'You do not have access to this module' });
  };
}
