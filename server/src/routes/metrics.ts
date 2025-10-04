import { Router } from 'express';
import {
  getCurrentMetrics,
  getHistoricalMetrics
} from '../controllers/metricsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/current', getCurrentMetrics);
router.get('/history', getHistoricalMetrics);

export default router;
