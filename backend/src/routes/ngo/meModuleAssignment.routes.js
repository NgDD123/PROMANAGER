import express from 'express';
import {
  getMeModuleAssignments,
  upsertMeModuleAssignments,
} from '../../controllers/ngo/meModuleAssignment.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';
import { requireNgoAdmin } from '../../middleware/ngoAuth.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.get('/', getMeModuleAssignments);
router.put('/', requireNgoAdmin, upsertMeModuleAssignments);

export default router;
