import { Router } from 'express';
import { createIntent, webhook } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.post(' /api/v1/intent', requireAuth, createIntent);
router.post(' /api/v1/webhook', webhook);
export default router;
