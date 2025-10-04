import { Router } from 'express';
import {
  generateWorkoutPlan,
  getWeekWorkouts,
  completeWorkout
} from '../controllers/workoutsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/generate', generateWorkoutPlan);
router.get('/week/:date', getWeekWorkouts);
router.patch('/:id/complete', completeWorkout);

export default router;
