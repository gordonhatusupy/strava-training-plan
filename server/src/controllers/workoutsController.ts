import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateWeeklyPlan } from '../utils/workoutGenerator';
import { calculateCTL, calculateATL, calculateTSB, getDailyTSSArray } from '../utils/calculations';

const prisma = new PrismaClient();

/**
 * Generate workout plan for a week
 */
export async function generateWorkoutPlan(req: Request, res: Response) {
  try {
    const userId = req.session.userId!;
    const { weekStart } = req.body;

    const weekStartDate = weekStart ? new Date(weekStart) : new Date();
    weekStartDate.setHours(0, 0, 0, 0);
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay()); // Start of week (Sunday)

    // Get activities from last 90 days to calculate current fitness
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startDate: { gte: ninetyDaysAgo }
      },
      orderBy: { startDate: 'asc' }
    });

    // Calculate current fitness metrics
    const dailyTSS = getDailyTSSArray(activities, ninetyDaysAgo, new Date());
    const ctl = calculateCTL(dailyTSS);
    const atl = calculateATL(dailyTSS.slice(-7));
    const tsb = calculateTSB(ctl, atl);

    // Generate workout plan
    const workoutPlan = generateWeeklyPlan(ctl, atl, tsb);

    // Save workouts to database
    const savedWorkouts = [];
    for (const workout of workoutPlan) {
      const workoutDate = new Date(weekStartDate);
      const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(workout.day);
      workoutDate.setDate(workoutDate.getDate() + dayIndex);

      const saved = await prisma.workout.upsert({
        where: {
          userId_date: {
            userId,
            date: workoutDate
          }
        },
        update: {
          type: workout.type,
          targetTSS: workout.targetTSS,
          duration: workout.duration,
          description: workout.description,
          zones: workout.zones,
          routeSuggestion: workout.routeSuggestion
        },
        create: {
          userId,
          day: workout.day,
          date: workoutDate,
          type: workout.type,
          targetTSS: workout.targetTSS,
          duration: workout.duration,
          description: workout.description,
          zones: workout.zones,
          routeSuggestion: workout.routeSuggestion
        }
      });

      savedWorkouts.push(saved);
    }

    res.json({
      weekStart: weekStartDate.toISOString(),
      currentMetrics: { ctl, atl, tsb },
      workouts: savedWorkouts
    });
  } catch (error) {
    console.error('Generate workout plan error:', error);
    res.status(500).json({ error: 'Failed to generate workout plan' });
  }
}

/**
 * Get workouts for a specific week
 */
export async function getWeekWorkouts(req: Request, res: Response) {
  try {
    const userId = req.session.userId!;
    const { date } = req.params;

    const weekStartDate = new Date(date);
    weekStartDate.setHours(0, 0, 0, 0);
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        date: {
          gte: weekStartDate,
          lt: weekEndDate
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(workouts);
  } catch (error) {
    console.error('Get week workouts error:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
}

/**
 * Mark workout as complete
 */
export async function completeWorkout(req: Request, res: Response) {
  try {
    const userId = req.session.userId!;
    const { id } = req.params;

    const workout = await prisma.workout.findFirst({
      where: { id, userId }
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const updated = await prisma.workout.update({
      where: { id },
      data: { completed: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ error: 'Failed to complete workout' });
  }
}
