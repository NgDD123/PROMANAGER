import express from 'express';
import {
  createFieldSite,
  getAllFieldSites,
  getFieldSite,
  updateFieldSite,
  deleteFieldSite,
  createFieldVisit,
  getAllFieldVisits,
  getFieldVisit,
  updateFieldVisit,
  deleteFieldVisit,
  getGpsLocations,
} from '../../controllers/ngo/gis.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';

const router = express.Router();

router.use(...ngoProtected);

router.get('/gps-locations', getGpsLocations);
router.post('/field-sites', createFieldSite);
router.get('/field-sites', getAllFieldSites);
router.get('/field-sites/:id', getFieldSite);
router.put('/field-sites/:id', updateFieldSite);
router.delete('/field-sites/:id', deleteFieldSite);

router.post('/field-visits', createFieldVisit);
router.get('/field-visits', getAllFieldVisits);
router.get('/field-visits/:id', getFieldVisit);
router.put('/field-visits/:id', updateFieldVisit);
router.delete('/field-visits/:id', deleteFieldVisit);

export default router;
