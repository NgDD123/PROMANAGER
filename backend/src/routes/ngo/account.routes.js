import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from '../../controllers/ngo/account.controller.js';
import { ngoAuth, attachNgoUserContext } from '../../middleware/ngoAuth.middleware.js';

const router = express.Router();

router.use(ngoAuth, attachNgoUserContext);

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);
router.patch('/password', changeMyPassword);

export default router;
