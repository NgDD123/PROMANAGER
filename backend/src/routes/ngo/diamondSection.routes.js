import express from 'express';
import {
  createDiamondSection,
  deleteDiamondSection,
  getAllDiamondSections,
  getDiamondSection,
  updateDiamondSection,
} from '../../controllers/ngo/diamondSection.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';
import { requireNgoAdmin, requireNgoScope } from '../../middleware/ngoAuth.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.get('/', requireNgoScope('evaluations'), getAllDiamondSections);
router.get('/:id', requireNgoScope('evaluations'), getDiamondSection);
router.post('/', requireNgoAdmin, createDiamondSection);
router.put('/:id', requireNgoAdmin, updateDiamondSection);
router.delete('/:id', requireNgoAdmin, deleteDiamondSection);

export default router;
