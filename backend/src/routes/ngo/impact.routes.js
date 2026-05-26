import express from 'express';
import { createImpact, getAllImpacts, getImpact, updateImpact, deleteImpact } from '../../controllers/ngo/impact.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.post('/', createImpact);
router.get('/', getAllImpacts);
router.get('/:id', getImpact);
router.put('/:id', updateImpact);
router.delete('/:id', deleteImpact);

export default router;
