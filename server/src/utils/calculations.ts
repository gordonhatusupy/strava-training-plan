import { Activity } from '@prisma/client';
import { StravaActivity } from '../types';

/**
 * Calculate Training Stress Score (TSS) for an activity
 * TSS = (duration_hours × Intensity_Factor² × 100)
 */
export function calculateTSS(activity: StravaActivity, ftp: number): number {
  // Power-based TSS (most accurate)
  if (activity.average_watts && activity.device_watts) {
    const normalizedPower = activity.weighted_average_watts || activity.average_watts;
    const intensityFactor = normalizedPower / ftp;
    const durationHours = activity.moving_time / 3600;
    const tss = durationHours * intensityFactor * intensityFactor * 100;
    return Math.round(tss);
  }

  // HR-based TSS estimate (TRIMP method simplified)
  if (activity.average_heartrate) {
    // Estimate based on HR zones (simplified)
    // Assume average HR of 140 = moderate intensity (IF ~0.75)
    const estimatedIF = (activity.average_heartrate - 60) / 80; // Rough estimate
    const durationHours = activity.moving_time / 3600;
    const tss = durationHours * estimatedIF * estimatedIF * 100;
    return Math.round(Math.max(tss, 0));
  }

  // Fallback: estimate from duration and elevation
  const durationHours = activity.moving_time / 3600;
  const elevationFactor = 1 + (activity.total_elevation_gain / 1000) * 0.1;
  const baseTSS = durationHours * 60; // Assume moderate intensity
  return Math.round(baseTSS * elevationFactor);
}

/**
 * Calculate Chronic Training Load (CTL) - 42-day exponential moving average
 * CTL represents long-term fitness
 */
export function calculateCTL(dailyTSS: number[], currentCTL: number = 0): number {
  const timeConstant = 42;
  let ctl = currentCTL;

  dailyTSS.forEach(tss => {
    ctl = ctl + (tss - ctl) / timeConstant;
  });

  return Math.round(ctl);
}

/**
 * Calculate Acute Training Load (ATL) - 7-day exponential moving average
 * ATL represents recent fatigue
 */
export function calculateATL(recentTSS: number[], currentATL: number = 0): number {
  const timeConstant = 7;
  let atl = currentATL;

  recentTSS.forEach(tss => {
    atl = atl + (tss - atl) / timeConstant;
  });

  return Math.round(atl);
}

/**
 * Calculate Training Stress Balance (TSB) - Form
 * TSB = CTL - ATL
 * Positive TSB = fresh/recovered
 * Negative TSB = fatigued
 */
export function calculateTSB(ctl: number, atl: number): number {
  return ctl - atl;
}

/**
 * Estimate FTP from activities
 * Looks for best 20+ minute power and multiplies by 0.95
 */
export function estimateFTP(activities: Activity[]): number {
  const powerActivities = activities.filter(
    a => a.averageWatts && a.deviceWatts && a.movingTime >= 1200 // 20 min
  );

  if (powerActivities.length === 0) {
    return 200; // Default fallback
  }

  const bestPower = Math.max(
    ...powerActivities.map(a => a.averageWatts || 0)
  );

  return Math.round(bestPower * 0.95);
}

/**
 * Get daily TSS array from activities
 * Returns array of TSS values for each day in date range
 */
export function getDailyTSSArray(
  activities: Activity[],
  startDate: Date,
  endDate: Date
): number[] {
  const dailyTSS: number[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayActivities = activities.filter(a => {
      const activityDate = new Date(a.startDate);
      return (
        activityDate.toDateString() === currentDate.toDateString()
      );
    });

    const dayTSS = dayActivities.reduce(
      (sum, a) => sum + (a.calculatedTSS || 0),
      0
    );
    dailyTSS.push(dayTSS);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dailyTSS;
}

/**
 * Calculate fitness metrics for historical data
 * Returns array of { date, ctl, atl, tsb } objects
 */
export function calculateHistoricalMetrics(
  activities: Activity[],
  days: number = 90
): Array<{ date: string; ctl: number; atl: number; tsb: number }> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dailyTSS = getDailyTSSArray(activities, startDate, endDate);
  const metrics: Array<{ date: string; ctl: number; atl: number; tsb: number }> = [];

  let ctl = 0;
  let atl = 0;

  dailyTSS.forEach((tss, index) => {
    ctl = ctl + (tss - ctl) / 42;
    atl = atl + (tss - atl) / 7;
    const tsb = ctl - atl;

    const date = new Date(startDate);
    date.setDate(date.getDate() + index);

    metrics.push({
      date: date.toISOString().split('T')[0],
      ctl: Math.round(ctl),
      atl: Math.round(atl),
      tsb: Math.round(tsb)
    });
  });

  return metrics;
}
