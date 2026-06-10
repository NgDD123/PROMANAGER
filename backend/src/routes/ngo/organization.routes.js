import express from 'express';
import {
  createOrganization,
  getAllOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
} from '../../controllers/ngo/organization.controller.js';
import {
  ngoAuth,
  attachNgoUserContext,
  requireNgoAdmin,
  requireNgoSuperAdmin,
} from '../../middleware/ngoAuth.middleware.js';

const router = express.Router();

router.use(ngoAuth, attachNgoUserContext, requireNgoAdmin);

router.post('/', requireNgoSuperAdmin, createOrganization);
router.get('/', getAllOrganizations);
router.get('/:id/stats', getOrganizationStats);
router.get('/:id', getOrganization);
router.put('/:id', requireNgoSuperAdmin, updateOrganization);
router.delete('/:id', requireNgoSuperAdmin, deleteOrganization);

export default router;
