import { db } from "../../utils/firebase.js";
import bcrypt from "bcryptjs";

const coll = () => db().collection("users");

/**
 * Helper: Remove undefined values (Firestore does not allow them)
 */
function removeUndefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

/**
 * Create a new user
 */
export const createUser = async ({
  name,
  email,
  passwordHash,
  phone,
  role = "PATIENT",
}) => {
  const userData = removeUndefined({
    name,
    email,
    passwordHash,
    phone,
    role,
     status: "OFFLINE", // NEW: track online/offline for call center
    createdAt: new Date(),
  });

  const doc = await coll().add(userData);

  return {
    id: doc.id,
    name,
    email,
    phone: phone ?? null, // always return phone field
    role,status: "OFFLINE", // default status

  };
};

/**
 * Find user by email
 */
export const getUserByEmail = async (email) => {
  const snap = await coll().where("email", "==", email).limit(1).get();
  if (snap.empty) return null;

  const data = snap.docs[0].data();
  return {
    id: snap.docs[0].id,
    ...data,
    phone: data.phone ?? null, // normalize phone field
  };
};

/**
 * Find user by ID
 */
export const getUserById = async (id) => {
  const doc = await coll().doc(id).get();
  if (!doc.exists) return null;

  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    phone: data.phone ?? null,
  };
};

/**
 * Hash password
 */
export const hashPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pwd, salt);
};

/**
 * Compare password
 */
export const comparePassword = async (pwd, hash) => {
  return bcrypt.compare(pwd, hash);
};
