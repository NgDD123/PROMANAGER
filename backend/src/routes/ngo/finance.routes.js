import express from 'express';
import { 
  createFinance, 
  getAllFinances, 
  getFinance, 
  updateFinance, 
  deleteFinance,
  getFinancialSummary,
  getFinancesByProject
} from '../../controllers/ngo/finance.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.post('/', createFinance);
router.get('/', getAllFinances);
router.get('/summary/:organizationId', getFinancialSummary);
router.get('/project/:projectId', getFinancesByProject);
router.get('/:id', getFinance);
router.put('/:id', updateFinance);
router.delete('/:id', deleteFinance);

export default router;
