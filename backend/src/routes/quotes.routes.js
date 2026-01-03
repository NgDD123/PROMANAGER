import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getQuotes } from '../controllers/quotes.controller.js';
const router = Router();
router.post(' /api/v1/', requireAuth, getQuotes);
export default router;
