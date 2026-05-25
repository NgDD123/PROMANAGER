import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../utils/firebase.js';
import { PlatformUser } from '../models/superAdmin/platformUser.model.js';
import { Hospital } from '../models/superAdmin/hospital.model.js';
import { HROrganization } from '../models/superAdmin/hrOrganization.model.js';
import {
  getUserByEmail as getStockUserByEmail,
  comparePassword as compareStockPassword,
  updateUser as updateStockUser,
  ALLOWED_ROLES,
} from '../models/stock/user.model.js';
import {
  getUserByEmail as getGeneralUserByEmail,
  comparePassword as compareGeneralPassword,
} from '../models/user.model.js';
import { setUserStatus } from '../models/status.model.js';
import { isCredentialExpired, credentialExpiryMessage } from '../utils/credentialExpiry.js';
import { normalizeRoleName, isServiceUserRole } from '../config/serviceUserRoles.config.js';
import { getDefaultNgoPath } from '../config/ngoNavigationScopes.config.js';
import {
  getRedirectPathForRole,
  resolveUserRoleName,
  STOCK_ROLES,
} from '../config/loginRedirect.config.js';
import { resolveServiceOrganization } from './serviceContext.service.js';
import { Role } from '../models/ngo/role.model.js';

const signToken = (payload, expiresIn = '8h') =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn });

async function comparePassword(plain, hash) {
  if (!hash) return false;
  try {
    return bcrypt.compare(plain, hash);
  } catch {
    return plain === hash;
  }
}

function authError(message, status = 401) {
  return Object.assign(new Error(message), { status });
}

function inactiveError() {
  return authError('Account is inactive', 403);
}

function expiredError() {
  return authError(credentialExpiryMessage(), 403);
}

function buildResult({ service, token, user, redirectPath, admin, hospital, organization, extra = {} }) {
  const roleName = resolveUserRoleName(user);
  const orgContext = organization || (hospital ? {
    id: hospital.id,
    name: hospital.name,
    serviceId: 'hospital',
    serviceTitle: 'Hospital Management',
    location: hospital.location || '',
    status: hospital.status || 'active',
  } : null);

  return {
    success: true,
    service,
    token,
    user,
    admin: admin ?? user,
    hospital: hospital ?? null,
    organization: orgContext,
    redirectPath: redirectPath || getRedirectPathForRole(roleName, service),
    role: roleName,
    ...extra,
  };
}

async function tryPlatformUser(email, password) {
  const user = await PlatformUser.getByEmail(email);
  if (!user) return null;

  const valid = await PlatformUser.comparePassword(password, user.passwordHash);
  if (!valid) throw authError('Invalid credentials');

  if (user.status !== 'active') throw inactiveError();

  const roleName = user.role?.role_name || '';
  const isSuperAdmin = normalizeRoleName(roleName) === 'SUPER_ADMIN';

  // Let service-specific providers handle non–super-admin accounts (same email may exist in hospitalAdmins, etc.)
  if (!isSuperAdmin) {
    return null;
  }

  const token = signToken(
    { id: user.id, role: 'super_admin', role_name: roleName },
    '8h',
  );
  const publicUser = PlatformUser.toPublicUser(user);
  const sessionUser = { ...publicUser, legacyRole: 'super_admin' };

  return buildResult({
    service: 'superAdmin',
    token,
    user: sessionUser,
    redirectPath: '/super-admin/dashboard',
  });
}

async function tryHospitalUser(email, password) {
  let user = null;
  let userType = null;
  let userDoc = null;

  const adminSnapshot = await db().collection('hospitalAdmins').where('email', '==', email).limit(1).get();
  if (!adminSnapshot.empty) {
    userDoc = adminSnapshot.docs[0];
    user = { ...userDoc.data(), id: userDoc.id };
    userType = 'admin';
  } else {
    const userSnapshot = await db().collection('users').where('email', '==', email).limit(1).get();
    if (!userSnapshot.empty) {
      const data = userSnapshot.docs[0].data();
      if (data.hospitalId) {
        userDoc = userSnapshot.docs[0];
        user = { ...data, id: userDoc.id };
        userType = 'user';
      }
    }
  }

  if (!user) return null;

  const isSuperAdmin = user.role === 'super_admin' || normalizeRoleName(user.role) === 'SUPER_ADMIN';
  if (!isSuperAdmin && user.status !== 'active' && user.isActive !== true) throw inactiveError();
  if (isCredentialExpired(user)) throw expiredError();

  const userPassword = user.password || user.passwordHash;
  const valid = await comparePassword(password, userPassword);
  if (!valid) throw authError('Invalid credentials');

  if (user.isPartialPassword) {
    const partialToken = signToken(
      { id: userDoc.id, hospitalId: user.hospitalId, type: 'partial', userType },
      '15m',
    );
    return {
      success: false,
      service: 'hospital',
      requiresPasswordCompletion: true,
      partialToken,
      message: 'Please complete your password setup',
    };
  }

  if (!user.hospitalId?.trim()) throw authError('User has no hospital assigned', 400);

  const hospital = await Hospital.getById(user.hospitalId);
  if (!hospital) throw authError('Hospital not found', 404);
  if (hospital.status === 'suspended' || hospital.status === 'deleted') {
    throw authError(`Hospital is ${hospital.status}`, 403);
  }

  const userId = userDoc.id;
  const collection = userType === 'admin' ? 'hospitalAdmins' : 'users';
  await db().collection(collection).doc(userId).update({ lastLogin: new Date() }).catch(() => {});

  const tokenRole = userType === 'admin' ? 'hospital_admin' : user.role;
  const token = signToken({ id: userId, hospitalId: hospital.id, role: tokenRole, userType });

  const { password: _, passwordHash: __, ...userResponse } = user;
  userResponse.role = tokenRole;
  userResponse.id = userId;
  userResponse.userType = userType;

  return buildResult({
    service: 'hospital',
    token,
    user: userResponse,
    admin: userResponse,
    hospital: {
      id: hospital.id,
      name: hospital.name,
      location: hospital.location,
      subscriptionPlan: hospital.subscriptionPlan,
    },
  });
}

async function tryHrUser(email, password) {
  let user = null;
  let userType = null;
  let userDoc = null;

  const adminSnapshot = await db().collection('hrAdmins').where('email', '==', email).limit(1).get();
  if (!adminSnapshot.empty) {
    userDoc = adminSnapshot.docs[0];
    user = { ...userDoc.data(), id: userDoc.id };
    userType = 'admin';
  } else {
    const userSnapshot = await db()
      .collection('users')
      .where('email', '==', email)
      .where('role', '==', 'hr_user')
      .limit(1)
      .get();
    if (!userSnapshot.empty) {
      userDoc = userSnapshot.docs[0];
      user = { ...userDoc.data(), id: userDoc.id };
      userType = 'user';
    }
  }

  if (!user) return null;

  if (user.status !== 'active' && user.isActive !== true) throw inactiveError();
  if (isCredentialExpired(user)) throw expiredError();

  const userPassword = user.password || user.passwordHash;
  const valid = await comparePassword(password, userPassword);
  if (!valid) throw authError('Invalid credentials');

  if (user.isPartialPassword) {
    const partialToken = signToken(
      { id: userDoc.id, organizationId: user.organizationId, type: 'partial', userType },
      '15m',
    );
    return {
      success: false,
      service: 'hr',
      requiresPasswordCompletion: true,
      partialToken,
      message: 'Please complete your password setup',
    };
  }

  if (!user.organizationId?.trim()) throw authError('User has no organization assigned', 400);

  const organization = await HROrganization.getById(user.organizationId);
  if (!organization) throw authError('Organization not found', 404);
  if (organization.status === 'suspended' || organization.status === 'deleted') {
    throw authError(`Organization is ${organization.status}`, 403);
  }

  const userId = userDoc.id;
  const collection = userType === 'admin' ? 'hrAdmins' : 'users';
  await db().collection(collection).doc(userId).update({ lastLogin: new Date() }).catch(() => {});

  const tokenRole = userType === 'admin' ? 'hr_admin' : user.role;
  const token = signToken({ id: userId, organizationId: organization.id, role: tokenRole, userType });

  const { password: _, passwordHash: __, ...userResponse } = user;
  userResponse.role = tokenRole;
  userResponse.id = userId;
  userResponse.userType = userType;

  return buildResult({
    service: 'hr',
    token,
    user: userResponse,
    admin: userResponse,
    organization: {
      id: organization.id,
      name: organization.name,
      location: organization.location,
    },
  });
}

function detectUsersCollectionService(user) {
  const roleName = resolveUserRoleName(user);
  const normalized = normalizeRoleName(roleName);

  if (normalized === 'SUPER_ADMIN' || user.role === 'super_admin') return 'superAdmin';
  if (user.hospitalId && !STOCK_ROLES.has(normalized) && !['PHARMACY', 'DOCTOR', 'PATIENT', 'CALLCENTER'].includes(normalized)) {
    return 'hospital';
  }
  if (normalized === 'HR_USER' || normalized === 'HR_ADMIN' || normalized === 'PAYROLL_ADMIN') return 'hr';
  if (normalized === 'PHARMACY' || normalized === 'PHARMACY_ADMIN') return 'pharmacy';
  if (normalized === 'NGO_ADMIN' || user.organizationId && user.roleName) return 'ngo';
  if (ALLOWED_ROLES.includes(normalized) || STOCK_ROLES.has(normalized)) return 'stock';
  if (isServiceUserRole(normalized)) {
    if (normalized.includes('HOSPITAL')) return 'hospital';
    if (normalized.includes('HR') || normalized.includes('PAYROLL')) return 'hr';
    if (normalized.includes('PHARMACY')) return 'pharmacy';
    if (normalized.includes('STOCK')) return 'stock';
    if (normalized.includes('NGO')) return 'ngo';
    if (normalized.includes('PROPERT')) return 'property';
  }
  return 'general';
}

async function tryUsersCollection(email, password) {
  const stockUser = await getStockUserByEmail(email);
  const user = stockUser || (await getGeneralUserByEmail(email));
  if (!user) return null;

  if (user.accountDisabled === true || user.isActive === false || user.status === 'inactive') {
    throw inactiveError();
  }
  if (isCredentialExpired(user)) throw expiredError();

  const compareFn = stockUser ? compareStockPassword : compareGeneralPassword;
  const valid = await compareFn(password, user.passwordHash);
  if (!valid) throw authError('Invalid credentials');

  const service = detectUsersCollectionService(user);
  const roleName = resolveUserRoleName(user);
  const normalizedRole = normalizeRoleName(roleName || user.role);

  if (service === 'superAdmin') {
    const token = signToken(
      { id: user.id, role: 'super_admin', role_name: user.role?.role_name || 'SUPER_ADMIN' },
      '8h',
    );
    await setUserStatus(user.id, 'super_admin', true).catch(() => {});
    return buildResult({
      service: 'superAdmin',
      token,
      user: {
        ...user,
        role: user.role?.role_name ? user.role : { role_name: 'SUPER_ADMIN', role_id: user.role?.role_id || null, sub_roles: [] },
        legacyRole: 'super_admin',
      },
      redirectPath: '/super-admin/dashboard',
    });
  }

  if (service === 'stock') {
    const token = signToken({ id: user.id, role: user.role });
    await updateStockUser(user.id, { status: 'ONLINE' }).catch(() => {});
    const organization = await resolveServiceOrganization('stock', user);
    return buildResult({
      service: 'stock',
      token,
      user: { ...user, role: user.role },
      organization,
    });
  }

  if (service === 'pharmacy') {
    const token = signToken({ id: user.id, role: user.role, pharmacyId: user.pharmacyId || null });
    await setUserStatus(user.id, user.role, true).catch(() => {});
    const organization = await resolveServiceOrganization('pharmacy', user);
    return buildResult({
      service: 'pharmacy',
      token,
      user: { ...user, role: normalizedRole || user.role },
      organization,
    });
  }

  const token = signToken({ id: user.id, role: user.role });
  if (['DOCTOR', 'PHARMACY', 'CALLCENTER'].includes(normalizedRole)) {
    await setUserStatus(user.id, normalizedRole, true).catch(() => {});
  }

  const resolvedService = service === 'general' ? 'stock' : service;
  const organization = await resolveServiceOrganization(resolvedService, user);

  return buildResult({
    service: resolvedService,
    token,
    user: { ...user, role: normalizedRole || user.role },
    organization,
  });
}

async function tryNgoUser(email, password) {
  const snapshot = await db().collection('ngo_users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;

  const userDoc = snapshot.docs[0];
  const user = { id: userDoc.id, ...userDoc.data() };

  if (user.accountStatus && user.accountStatus !== 'Active') throw inactiveError();
  if (isCredentialExpired(user)) throw expiredError();

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw authError('Invalid credentials');

  const token = signToken({ id: user.id, organizationId: user.organizationId, role: 'ngo_admin' });
  await db().collection('ngo_users').doc(user.id).update({ lastLoginAt: new Date() }).catch(() => {});

  const { passwordHash: _, ...userResponse } = user;
  const organization = await resolveServiceOrganization('ngo', user);

  let roleContext = {};
  if (user.roleId) {
    const role = await Role.getById(user.roleId);
    if (role) {
      roleContext = {
        isSubRole: Boolean(role.isSubRole),
        navigationScopes: role.navigationScopes || [],
        branchId: role.branchId || user.branchId || '',
      };
    }
  }

  return buildResult({
    service: 'ngo',
    token,
    user: {
      ...userResponse,
      role: user.roleName || 'NGO_ADMIN',
      ...roleContext,
    },
    organization,
    redirectPath: getDefaultNgoPath({
      ...userResponse,
      ...roleContext,
    }),
  });
}

async function tryPropertyUser(email, password) {
  const snapshot = await db().collection('propertyStaff').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;

  const userDoc = snapshot.docs[0];
  const user = { id: userDoc.id, ...userDoc.data() };

  if (user.status !== 'active' && user.isActive !== true) throw inactiveError();
  if (isCredentialExpired(user)) throw expiredError();

  const valid = await comparePassword(password, user.passwordHash || user.password);
  if (!valid) throw authError('Invalid credentials');

  const token = signToken({ id: user.id, organizationId: user.organizationId, role: 'property_admin' });
  const { passwordHash: _, password: __, ...userResponse } = user;
  const organization = await resolveServiceOrganization('property', user);

  return buildResult({
    service: 'property',
    token,
    user: { ...userResponse, role: 'PROPERTY_ADMIN' },
    organization,
  });
}

const AUTH_PROVIDERS = [
  tryPlatformUser,
  tryHospitalUser,
  tryHrUser,
  tryUsersCollection,
  tryNgoUser,
  tryPropertyUser,
];

export async function unifiedLogin(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw authError('Email and password are required', 400);
  }

  let lastError = null;

  for (const provider of AUTH_PROVIDERS) {
    try {
      const result = await provider(normalizedEmail, password);
      if (result) return result;
    } catch (err) {
      if (err.status === 401) throw err;
      if (err.status === 403 || err.status === 400 || err.status === 404) throw err;
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  throw authError('Invalid credentials');
}
