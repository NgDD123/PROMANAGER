import { Router } from 'express';
import { createBranding, listBrandings } from '../controllers/branding.controller.js';
const router = Router();
router.post(' /api/v1/', createBranding);
router.get(' /api/v1/', listBrandings);
export default router;
