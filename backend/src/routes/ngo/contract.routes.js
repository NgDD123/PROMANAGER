import express from 'express';
import { createContract, getAllContracts, getContract, updateContract, deleteContract, getContractAnalytics } from '../../controllers/ngo/contract.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.post('/', createContract);
router.get('/', getAllContracts);
router.get('/analytics/summary', getContractAnalytics);
router.get('/:id', getContract);
router.put('/:id', updateContract);
router.patch('/:id', updateContract);
router.delete('/:id', deleteContract);

export default router;
