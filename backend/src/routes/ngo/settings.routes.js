import express from 'express';
import {
  createSettingsRecord,
  getAllSettingsRecords,
  getSettingsRecord,
  updateSettingsRecord,
  deleteSettingsRecord,
} from '../../controllers/ngo/settingsRecord.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.post('/permissions', createSettingsRecord);
router.get('/permissions', getAllSettingsRecords);
router.get('/permissions/:id', getSettingsRecord);
router.put('/permissions/:id', updateSettingsRecord);
router.delete('/permissions/:id', deleteSettingsRecord);

router.post('/documents', createSettingsRecord);
router.get('/documents', getAllSettingsRecords);
router.get('/documents/:id', getSettingsRecord);
router.put('/documents/:id', updateSettingsRecord);
router.delete('/documents/:id', deleteSettingsRecord);

export default router;
