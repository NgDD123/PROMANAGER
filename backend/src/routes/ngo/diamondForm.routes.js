import express from 'express';
import {
  createDiamondForm,
  deleteDiamondForm,
  getAllDiamondForms,
  getDiamondForm,
  updateDiamondForm,
} from '../../controllers/ngo/diamondForm.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';
import { requireNgoAdmin, requireNgoScope } from '../../middleware/ngoAuth.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.get('/', requireNgoScope('evaluations'), getAllDiamondForms);
router.get('/:id', requireNgoScope('evaluations'), getDiamondForm);
router.post('/', requireNgoAdmin, createDiamondForm);
router.put('/:id', requireNgoAdmin, updateDiamondForm);
router.delete('/:id', requireNgoAdmin, deleteDiamondForm);

export default router;
