import { db } from '../../utils/firebase.js';
import bcrypt from 'bcryptjs';
import { PlatformRole, SUPER_ADMIN_ROLE_NAME } from '../models/superAdmin/platformRole.model.js';
import { PlatformUser } from '../models/superAdmin/platformUser.model.js';

const SUPER_ADMIN_EMAIL = 'superadmin@madsmart.com';
const SUPER_ADMIN_PASSWORD = 'SuperAdmin123!';

export const GBMA_SEED_PASSWORD = 'GbmaAdmin123!';

/** Platform role users for @gbma.tech — resolved by role_name in Firestore. */
export const GBMA_PLATFORM_ROLE_USERS = [
  { role_name: 'HOSPITAL_ADMIN', email: 'hospital.admin@gbma.tech', name: 'GBMA Hospital Admin' },
  { role_name: 'HR_ADMIN', email: 'hr.admin@gbma.tech', name: 'GBMA HR Admin' },
  { role_name: 'NGO_ADMIN', email: 'ngo.admin@gbma.tech', name: 'GBMA NGO Admin' },
  { role_name: 'PAYROLL_ADMIN', email: 'payroll.admin@gbma.tech', name: 'GBMA Payroll Admin' },
  { role_name: 'PHARMACY_ADMIN', email: 'pharmacy.admin@gbma.tech', name: 'GBMA Pharmacy Admin' },
  { role_name: 'PROPERT_ADMIN', email: 'property.admin@gbma.tech', name: 'GBMA Property Admin' },
  { role_name: 'STOCK_ADMIN', email: 'stock.admin@gbma.tech', name: 'GBMA Stock Admin' },
];

async function resolvePlatformRole(entry) {
  if (entry.role_id) {
    const byId = await PlatformRole.getById(entry.role_id);
    if (byId) return byId;
  }
  const byName = await PlatformRole.getByName(entry.role_name);
  if (byName) return byName;
  return null;
}

export async function seedSuperAdminRoleAndUser() {
  const superAdminRole = await PlatformRole.ensureSuperAdminRole();

  const roleAssignment = {
    role_id: superAdminRole.id,
    role_name: SUPER_ADMIN_ROLE_NAME,
    sub_roles: [],
  };

  const legacySnapshot = await db()
    .collection('users')
    .where('email', '==', SUPER_ADMIN_EMAIL)
    .limit(1)
    .get();

  if (!legacySnapshot.empty) {
    const doc = legacySnapshot.docs[0];
    const passwordHash =
      doc.data().passwordHash || (await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10));

    await doc.ref.update({
      name: doc.data().name || 'Super Administrator',
      role: roleAssignment,
      legacyRole: doc.data().role || 'super_admin',
      passwordHash,
      status: 'active',
      updatedAt: new Date(),
    });

    return { role: superAdminRole, userId: doc.id, collection: 'users' };
  }

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  const docRef = await db().collection('users').add({
    name: 'Super Administrator',
    email: SUPER_ADMIN_EMAIL,
    passwordHash,
    role: roleAssignment,
    legacyRole: 'super_admin',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { role: superAdminRole, userId: docRef.id, collection: 'users' };
}

export function resolveUserRoleName(user) {
  if (user?.role?.role_name) return user.role.role_name;
  if (typeof user?.role === 'string') return user.role.toUpperCase();
  return null;
}

export function isSuperAdminUser(user) {
  const roleName = resolveUserRoleName(user);
  return roleName === SUPER_ADMIN_ROLE_NAME || user?.role === 'super_admin' || user?.legacyRole === 'super_admin';
}

export function userCreatedBySuperAdmin(user) {
  return user?.role?.created_by?.role_name === SUPER_ADMIN_ROLE_NAME;
}

function buildRoleAssignment({ role_id, role_name }) {
  return {
    role_id,
    role_name,
    sub_roles: [],
  };
}

export async function seedGbmaPlatformRoleUsers({
  password = GBMA_SEED_PASSWORD,
} = {}) {
  const passwordHash = await bcrypt.hash(password, 10);
  const results = [];

  for (const entry of GBMA_PLATFORM_ROLE_USERS) {
    const role = await resolvePlatformRole(entry);
    if (!role) {
      throw new Error(
        `Platform role not found: ${entry.role_name}. Create it in super admin first.`,
      );
    }

    const roleAssignment = buildRoleAssignment({
      role_id: role.id,
      role_name: role.role_name,
    });

    const existing = await PlatformUser.getByEmail(entry.email);
    if (existing) {
      await PlatformUser.update(existing.id, {
        name: entry.name,
        role: roleAssignment,
        status: 'active',
      });
      await db().collection('platform_users').doc(existing.id).update({ passwordHash });
      results.push({
        action: 'updated',
        email: entry.email,
        role_name: role.role_name,
        userId: existing.id,
      });
      continue;
    }

    const docRef = await db().collection('platform_users').add({
      name: entry.name,
      email: entry.email.trim().toLowerCase(),
      passwordHash,
      role: roleAssignment,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    results.push({
      action: 'created',
      email: entry.email,
      role_name: role.role_name,
      userId: docRef.id,
    });
  }

  return { password, results };
}
