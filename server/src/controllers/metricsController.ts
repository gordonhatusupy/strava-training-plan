import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  calculateCTL,
  calculateATL,
  calculateTSB,
  getDailyTSSArray,
  calculateHistoricalMetrics
} from '../utils/calculations';

const prisma = new PrismaClient();

/**
 * Get current fitness metrics (CTL, ATL, TSB)
 */
export async function getCurrentMetrics(req: Request, res: Response) {
  try {
    const userId = req.session.userId!;

    // Get activities from last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startDate: { gte: ninetyDaysAgo }
      },
      orderBy: { startDate: 'asc' }
    });

    // Calculate daily TSS array
    const endDate = new Date();
    const dailyTSS = getDailyTSSArray(activities, ninetyDaysAgo, endDate);

    // Calculate metrics
    const ctl = calculateCTL(dailyTSS);
    const recentTSS = dailyTSS.slice(-7); // Last 7 days
    const atl = calculateATL(recentTSS);
    const tsb = calculateTSB(ctl, atl);

    // Calculate current week TSS
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekActivities = await prisma.activity.findMany({
      where: {
        userId,
        startDate: { gte: weekStart }
      }
    });

    const currentWeekTSS = weekActivities.reduce(
      (sum, a) => sum + (a.calculatedTSS || 0),
      0
    );

    const targetWeeklyTSS = Math.round(ctl * 7 * 0.9);

    res.json({
      ctl,
      atl,
      tsb,
      currentWeekTSS: Math.round(currentWeekTSS),
      targetWeeklyTSS,
      weekProgress: targetWeeklyTSS > 0 ? (currentWeekTSS / targetWeeklyTSS) * 100 : 0
    });
  } catch (error) {
    console.error('Get current metrics error:', error);
    res.status(500).json({ error: 'Failed to calculate metrics' });
  }
}

/**
 * Get historical fitness metrics
 */
export async function getHistoricalMetrics(req: Request, res: Response) {
  try {
    const userId = req.session.userId!;
    const days = parseInt(req.query.days as string) || 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startDate: { gte: startDate }
      },
      orderBy: { startDate: 'asc' }
    });

    const historicalMetrics = calculateHistoricalMetrics(activities, days);

    res.json(historicalMetrics);
  } catch (error) {
    console.error('Get historical metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch historical metrics' });
  }
}
