import jwt from "jsonwebtoken";
import {
  getUserById,
  getUserByEmail,
  createUser,
  hashPassword,
  comparePassword,
} from "../models/user.model.js";
import { db } from "../../utils/firebase.js";
import { setUserStatus } from "../models/status.model.js"; // NEW
import { createPharmacy, getPharmacyById } from "../models/pharmacy.model.js";

/**
 * -----------------------------
 * REGISTER
 * -----------------------------
 */
  export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, pharmacyId, newPharmacyName } = req.body;

    // Check if email already exists
    const existing = await getUserByEmail(email);
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    let user = await createUser({
      name,
      email,
      passwordHash,
      phone,
      role: (role || "PATIENT").toUpperCase(),
      pharmacyId: null, // default
    });

    let assignedPharmacyId = null;

    // If user is PHARMACY, handle pharmacy assignment
    if (user.role === "PHARMACY") {
      if (pharmacyId) {
        // Join existing pharmacy
        const ph = await getPharmacyById(pharmacyId);
        if (!ph) return res.status(400).json({ message: "Selected pharmacy does not exist" });
        assignedPharmacyId = ph.id;
      } else if (newPharmacyName) {
        // Create new pharmacy owned by this user
        const newPharmacy = await createPharmacy({
          owner: user.id,
          name: newPharmacyName,
          email: user.email,
          createdAt: new Date(),
        });
        assignedPharmacyId = newPharmacy.id;
      } else {
        return res.status(400).json({
          message: "Pharmacy user must select an existing pharmacy or provide a new pharmacy name",
        });
      }

      // 🔥 debug logs
      console.log("➡️ Updating user", user.id, "with pharmacyId:", assignedPharmacyId);

      // update user with pharmacyId in Firestore
      await db().collection("users").doc(user.id).update({
        pharmacyId: assignedPharmacyId,
      });

      console.log("✅ Firestore user updated successfully");

      // refresh user object so it includes pharmacyId
      user = await getUserById(user.id);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      token,
      user: {
        ...user,
        role: (user.role || "PATIENT").toUpperCase(),
        pharmacyId: assignedPharmacyId,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * -----------------------------
 * LOGIN
 * -----------------------------
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    console.log("User fetched from Firestore:", user); 
    if (!user){console.log("No user found with this email");
       return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await comparePassword(password, user.passwordHash);
     console.log("Password match result:", match)
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role  }, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
     if (["DOCTOR", "PHARMACY", "CALLCENTER"].includes(user.role)) {
      await setUserStatus(user.id, user.role, true);
    }

    res.json({
      token,
      user: {
        ...user,
        role: (user.role || "PATIENT").toUpperCase(),
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware
    await db().collection("providers").doc(userId).update({
      online: false,
      updatedAt: new Date(),
    });
    res.json({ success: true, message: "Logged out and set offline" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Failed to logout" });
  }
};

/**
 * -----------------------------
 * CURRENT USER (ME)
 * -----------------------------
 */
export const me = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      ...user,
      role: (user.role || "PATIENT").toUpperCase(),
    });
  } catch (err) {
    console.error("Me error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * -----------------------------
 * REFRESH TOKEN
 * -----------------------------
 */
export const refresh = async (req, res) => {
  try {
    const oldToken = req.body.token;
    if (!oldToken) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(oldToken, process.env.JWT_ACCESS_SECRET);
    const user = await getUserById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid user" });

    const newToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });

    res.json({
      token: newToken,
      user: {
        ...user,
        role: (user.role || "PATIENT").toUpperCase(),
      },
    });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};
