import express from 'express';
import { createEvaluation, getAllEvaluations, getEvaluation, updateEvaluation, deleteEvaluation } from '../../controllers/ngo/evaluation.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.post('/', createEvaluation);
router.get('/', getAllEvaluations);
router.get('/:id', getEvaluation);
router.put('/:id', updateEvaluation);
router.delete('/:id', deleteEvaluation);

export default router;
