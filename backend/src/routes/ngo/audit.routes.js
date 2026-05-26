import express from 'express';
import { 
  createAudit, 
  getAllAudits, 
  getAudit, 
  updateAudit, 
  deleteAudit,
  addAuditFinding,
  getAuditTrail,
  getComplianceStatus
} from '../../controllers/ngo/audit.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.post('/', createAudit);
router.get('/', getAllAudits);
router.get('/trail/history', getAuditTrail);
router.get('/compliance/:organizationId', getComplianceStatus);
router.get('/:id', getAudit);
router.post('/:id/findings', addAuditFinding);
router.put('/:id', updateAudit);
router.delete('/:id', deleteAudit);

export default router;
