import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createRx, getPharmacyRx, updateRxStatus,setPrescriptionPrice, markPrescriptionPaid } from "../controllers/rx.controller.js";

const router = Router();

// Doctor/Admin create prescriptions
router.post("/", requireAuth, requireRole("DOCTOR", "ADMIN", "PATIENT" ), createRx);

// Pharmacy/Admin view their prescriptions
router.get("/pharmacy/mine", requireAuth, requireRole("PHARMACY", "ADMIN"), getPharmacyRx);

// Pharmacy/Admin update prescription status
router.patch("/:id/status", requireAuth, requireRole("PHARMACY", "ADMIN"), updateRxStatus);

// 🔹 New routes
router.patch('/:id/price', requireAuth, setPrescriptionPrice);
router.patch('/:id/paid', requireAuth, markPrescriptionPaid);

export default router;
