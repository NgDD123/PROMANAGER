import express from 'express';
import { 
  createBeneficialOwner, 
  getAllBeneficialOwners, 
  getBeneficialOwner, 
  updateBeneficialOwner, 
  deleteBeneficialOwner,
  verifyBeneficialOwner,
  getOwnershipStructure,
  getPoliticallyExposed
} from '../../controllers/ngo/beneficialOwner.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.post('/', createBeneficialOwner);
router.get('/', getAllBeneficialOwners);
router.get('/structure/:organizationId', getOwnershipStructure);
router.get('/pep/:organizationId', getPoliticallyExposed);
router.get('/:id', getBeneficialOwner);
router.put('/:id/verify', verifyBeneficialOwner);
router.put('/:id', updateBeneficialOwner);
router.delete('/:id', deleteBeneficialOwner);

export default router;
