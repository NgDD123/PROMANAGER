import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getAuditLogs, getCommissions } from '../controllers/admin.controller.js';
const router = Router();
router.get(' /api/v1/audit', requireAuth, requireRole('ADMIN'), getAuditLogs);
router.get(' /api/v1/commissions', requireAuth, requireRole('ADMIN'), getCommissions);
export default router;
