// models/user.model.js
import { db } from "../../../utils/firebase.js";
import bcrypt from "bcryptjs";

const USERS = "users";
const PASSWORD_RESETS = "passwordResets";

export const ALLOWED_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "DIRECTOR_MANAGER",
  "PRODUCTION_MANAGER",
  "FINANCE_MANAGER",
  "SALE_MANAGER",
  "MARKETTING_MANAGER",
  "FINANCE_MANAGER",
  "ACCOUNTANT",
  "STOCK_KEEPER",
  "PROCUREMENT",
  "PRODUCTION_MANAGER",
  "SALES",
  "GUEST",
];

function removeUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}

export const coll = () => db().collection(USERS);

export const createUser = async ({
  name,
  email,
  passwordHash,
  phone,
  role = "GUEST",
  department = null,
  extra = {},
}) => {
  const normalizedRole = (role || "GUEST").toUpperCase();
  const userData = removeUndefined({
    name,
    email,
    passwordHash,
    phone: phone ?? null,
    role: ALLOWED_ROLES.includes(normalizedRole) ? normalizedRole : "GUEST",
    department,
    status: "OFFLINE",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...extra,
  });

  const docRef = await coll().add(userData);
  return {
    id: docRef.id,
    ...userData,
    phone: userData.phone ?? null,
  };
};

export const getUserByEmail = async (email) => {
  const snap = await coll().where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data(), phone: doc.data().phone ?? null };
};

export const getUserById = async (id) => {
  const doc = await coll().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data(), phone: doc.data().phone ?? null };
};

export const updateUser = async (id, updates) => {
  const cleaned = removeUndefined({ ...updates, updatedAt: new Date() });
  await coll().doc(id).update(cleaned);
  return getUserById(id);
};

export const hashPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pwd, salt);
};

export const comparePassword = async (pwd, hash) => {
  return bcrypt.compare(pwd, hash);
};

/**
 * Password reset tokens collection helpers
 */

export const createPasswordResetToken = async (userId, token, ttlMinutes = 60) => {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  const doc = await db().collection(PASSWORD_RESETS).add({
    userId,
    token,
    used: false,
    createdAt: new Date(),
    expiresAt,
  });
  return { id: doc.id, userId, token, expiresAt };
};

export const getPasswordResetByToken = async (token) => {
  const snap = await db().collection(PASSWORD_RESETS).where("token", "==", token).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
};

export const markPasswordResetUsed = async (id) => {
  await db().collection(PASSWORD_RESETS).doc(id).update({ used: true, usedAt: new Date() });
};
