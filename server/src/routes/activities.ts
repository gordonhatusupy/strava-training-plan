import { Router } from 'express';
import {
  getActivities,
  syncActivities,
  getActivity
} from '../controllers/activitiesController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getActivities);
router.post('/sync', syncActivities);
router.get('/:id', getActivity);

export default router;
