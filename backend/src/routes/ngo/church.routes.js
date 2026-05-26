import express from 'express';
import multer from 'multer';
import {
  createChurchRecord,
  deleteChurchRecord,
  generateChurchMemberId,
  getAllChurchRecords,
  getChurchRecord,
  getChurchSummary,
  getChurchWorkspace,
  updateChurchRecord,
} from '../../controllers/ngo/church.controller.js';
import {
  createChurchUser,
  deleteChurchUser,
  getChurchUser,
  getChurchUsers,
  resendChurchUserCredentials,
  updateChurchUser,
} from '../../controllers/ngo/churchUser.controller.js';
import { uploadChurchMemberPhoto } from '../../controllers/ngo/churchUpload.controller.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';
import {
  attachChurchAccessContext,
  requireChurchManager,
  requireChurchModuleAccess,
  requireChurchTab,
  requireChurchTabFromBody,
  requireChurchTabFromQuery,
} from '../../middleware/churchAccess.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const churchProtected = [...ngoProtected, attachChurchAccessContext, requireChurchModuleAccess];

router.post(
  '/upload-photo',
  ...churchProtected,
  requireChurchTab('members'),
  upload.single('photo'),
  uploadChurchMemberPhoto
);

router.get('/users', ...churchProtected, requireChurchManager, getChurchUsers);
router.post('/users', ...churchProtected, requireChurchManager, createChurchUser);
router.get('/users/:id', ...churchProtected, requireChurchManager, getChurchUser);
router.put('/users/:id', ...churchProtected, requireChurchManager, updateChurchUser);
router.delete('/users/:id', ...churchProtected, requireChurchManager, deleteChurchUser);
router.post(
  '/users/:id/resend-credentials',
  ...churchProtected,
  requireChurchManager,
  resendChurchUserCredentials
);

router.get('/workspace', ...churchProtected, getChurchWorkspace);
router.get('/summary', ...churchProtected, getChurchSummary);
router.get('/members/next-id', ...churchProtected, requireChurchTab('members'), generateChurchMemberId);
router.post('/', ...churchProtected, requireChurchTabFromBody, createChurchRecord);
router.get('/', ...churchProtected, requireChurchTabFromQuery, getAllChurchRecords);
router.get('/:id', ...churchProtected, getChurchRecord);
router.put('/:id', ...churchProtected, requireChurchTabFromBody, updateChurchRecord);
router.delete('/:id', ...churchProtected, deleteChurchRecord);

export default router;
