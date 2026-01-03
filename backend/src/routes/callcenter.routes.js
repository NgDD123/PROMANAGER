import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  requestCall,
  getActiveCalls,
  acceptCall,
  endCall,
  acceptCallByCallCenter,
  getProvidersForCall,
} from "../controllers/callcenter.controller.js";

const router = Router();

// Create a call
router.post(
  "/request",
  requireAuth,
  requireRole("PATIENT", "DOCTOR", "PHARMACY"),
  requestCall
);

// List active calls
router.get(
  "/active",
  requireAuth,
  requireRole("CALLCENTER", "ADMIN", "PHARMACY", "DOCTOR"), // add PHARMACY & DOCTOR
  getActiveCalls
);


// Doctor/Pharmacy accepts call
router.patch(
  "/:id/accept",
  requireAuth,
  requireRole("DOCTOR", "PHARMACY", "ADMIN"),
  acceptCall
);

// Call Center accepts / assigns a call
router.patch(
  "/:id/accept-callcenter",
  requireAuth,
  requireRole("CALLCENTER", "ADMIN"),
  acceptCallByCallCenter
);

// End call
router.patch(
  "/:id/end",
  requireAuth,
  requireRole("CALLCENTER", "DOCTOR", "PHARMACY", "ADMIN"),
  endCall
);

// Get online providers for selection
router.get(
  "/providers",
  requireAuth,
  requireRole("CALLCENTER", "ADMIN"),
  getProvidersForCall
);

export default router;
