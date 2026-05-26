import express from 'express';
import {
  createStorage,
  getAllStorages,
  getStorage,
  updateStorage,
  deleteStorage,
} from '../../controllers/ngo/storage.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.post('/', createStorage);
router.get('/', getAllStorages);
router.get('/:id', getStorage);
router.put('/:id', updateStorage);
router.delete('/:id', deleteStorage);

export default router;
