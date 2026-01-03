import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createOrder, getOrder } from '../controllers/order.controller.js';
const router = Router();
router.post(' /api/v1/', requireAuth, createOrder);
router.get(' /api/v1/:id', requireAuth, getOrder);
export default router;
