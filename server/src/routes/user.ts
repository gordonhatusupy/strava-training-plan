import { Router } from 'express';
import { getProfile, updateSettings } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/profile', getProfile);
router.patch('/settings', updateSettings);

export default router;
