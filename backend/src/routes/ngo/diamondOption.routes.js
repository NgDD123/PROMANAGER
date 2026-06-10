import express from 'express';
import {
  createDiamondOption,
  deleteDiamondOption,
  getAllDiamondOptions,
  getDiamondOption,
  updateDiamondOption,
} from '../../controllers/ngo/diamondOption.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';
import { requireNgoAdmin, requireNgoScope } from '../../middleware/ngoAuth.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.get('/', requireNgoScope('evaluations'), getAllDiamondOptions);
router.get('/:id', requireNgoScope('evaluations'), getDiamondOption);
router.post('/', requireNgoAdmin, createDiamondOption);
router.put('/:id', requireNgoAdmin, updateDiamondOption);
router.delete('/:id', requireNgoAdmin, deleteDiamondOption);

export default router;
