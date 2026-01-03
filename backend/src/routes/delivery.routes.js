import { Router } from 'express';
import { registerPartner, listPartners } from '../controllers/delivery.controller.js';
const router = Router();
router.post(' /api/v1/', registerPartner);
router.get(' /api/v1/', listPartners);
export default router;
