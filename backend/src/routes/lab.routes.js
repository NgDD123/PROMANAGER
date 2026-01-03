import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createLab, searchLabs } from '../controllers/lab.controller.js';
const router = Router();
router.post(' /api/v1/', requireAuth, requireRole('LAB','ADMIN','PHARMACY'), createLab);
router.get(' /api/v1/search', searchLabs);
export default router;
