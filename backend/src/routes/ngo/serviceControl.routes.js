import express from 'express';
import {
  createServiceControl,
  getAllServiceControls,
  getServiceControl,
  updateServiceControl,
  deleteServiceControl,
} from '../../controllers/ngo/serviceControl.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.post('/', createServiceControl);
router.get('/', getAllServiceControls);
router.get('/:id', getServiceControl);
router.put('/:id', updateServiceControl);
router.delete('/:id', deleteServiceControl);

export default router;
