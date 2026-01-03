import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createClinic, searchClinics } from '../controllers/clinic.controller.js';
const router = Router();
router.post(' /api/v1/', requireAuth, requireRole('CLINIC','ADMIN','PHARMACY'), createClinic);
router.get(' /api/v1/search', searchClinics);
export default router;
