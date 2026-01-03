import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  create,
  search,
  getById,
  update,
  remove,
  getPrescriptions,
  updatePrescriptionStatus
} from '../controllers/pharmacy.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ----------------------------
// CRUD
// ----------------------------
router.post('/', requireAuth, requireRole('PHARMACY','ADMIN'), upload.single('legalDocument'), create);
router.put('/:id', requireAuth, requireRole('PHARMACY','ADMIN'), upload.single('legalDocument'), update);
router.delete('/:id', requireAuth, requireRole('PHARMACY','ADMIN'), remove);
router.get('/search', search);
router.get('/:id', getById);

// ----------------------------
// PRESCRIPTIONS
// ----------------------------
router.get('/:id/prescriptions', requireAuth, requireRole('PHARMACY','ADMIN'), getPrescriptions);
router.patch('/prescriptions/:id/status', requireAuth, requireRole('PHARMACY','ADMIN'), updatePrescriptionStatus);

export default router;
