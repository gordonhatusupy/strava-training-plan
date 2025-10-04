import { Router } from 'express';
import {
  initiateStravaAuth,
  handleStravaCallback,
  getCurrentUser,
  logout
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/strava', initiateStravaAuth);
router.get('/strava/callback', handleStravaCallback);
router.get('/me', getCurrentUser);
router.post('/logout', requireAuth, logout);

export default router;
