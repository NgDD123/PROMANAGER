// backend/src/routes/stock/StockAdmin.routes.js
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/stock/auth.js";
import { getAuditLogs, getCommissions } from "../../controllers/stock/admin.controller.js";

const router = Router();

// Admin & Super Admin only routes
router.get("/audit", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), getAuditLogs);
router.get("/commissions", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), getCommissions);

export default router;
