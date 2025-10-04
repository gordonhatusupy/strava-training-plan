import { Workout, UserPreferences } from '../types';

/**
 * Generate a weekly workout plan based on current fitness metrics
 */
export function generateWeeklyPlan(
  currentCTL: number,
  currentATL: number,
  currentTSB: number,
  userPreferences?: UserPreferences
): Workout[] {
  const targetWeeklyTSS = Math.round(currentCTL * 7 * 0.9); // Aim for ~90% of CTL-equivalent
  const plan: Workout[] = [];

  // Determine if user is fatigued (needs more recovery)
  const isFatigued = currentTSB < -10;
  const isVeryFresh = currentTSB > 25;

  // Monday: Recovery
  plan.push({
    day: 'Monday',
    type: 'recovery',
    targetTSS: Math.round(currentCTL * 0.5),
    duration: 60,
    description: '60 min easy spin in Zone 2. Focus on smooth pedaling and recovery from weekend training.',
    zones: ['Zone 2'],
    routeSuggestion: 'Flat, familiar route'
  });

  // Tuesday: Endurance
  const tuesdayIntensity = isFatigued ? 0.8 : 1.0;
  plan.push({
    day: 'Tuesday',
    type: 'endurance',
    targetTSS: Math.round(currentCTL * tuesdayIntensity),
    duration: isFatigued ? 75 : 90,
    description: isFatigued
      ? '75 min easy endurance. Keep it light, stay in Zone 2.'
      : '90 min steady ride. Stay in Zone 2-3, build aerobic base.',
    zones: ['Zone 2', 'Zone 3'],
  });

  // Wednesday: Intervals (or recovery if very fatigued)
  if (isFatigued) {
    plan.push({
      day: 'Wednesday',
      type: 'recovery',
      targetTSS: Math.round(currentCTL * 0.4),
      duration: 45,
      description: '45 min very easy spin. Recovery is important!',
      zones: ['Zone 1', 'Zone 2'],
    });
  } else {
    plan.push({
      day: 'Wednesday',
      type: 'intervals',
      targetTSS: Math.round(currentCTL * 1.2),
      duration: 75,
      description: 'Warmup 15min, then 4x5min @ Zone 4 with 3min recovery between intervals, cooldown 15min.',
      zones: ['Zone 4'],
    });
  }

  // Thursday: Recovery or Rest
  if (currentTSB < -15) {
    plan.push({
      day: 'Thursday',
      type: 'rest',
      targetTSS: 0,
      duration: 0,
      description: 'Complete rest day. Your body needs recovery.',
      zones: [],
    });
  } else {
    plan.push({
      day: 'Thursday',
      type: 'recovery',
      targetTSS: Math.round(currentCTL * 0.4),
      duration: 45,
      description: '45 min very easy spin, or yoga/stretching session.',
      zones: ['Zone 1', 'Zone 2'],
    });
  }

  // Friday: Tempo
  const fridayIntensity = isFatigued ? 0.8 : 1.0;
  plan.push({
    day: 'Friday',
    type: 'tempo',
    targetTSS: Math.round(currentCTL * fridayIntensity),
    duration: 75,
    description: isFatigued
      ? 'Warmup 15min, 20min @ tempo (Zone 3), cooldown 15min. Keep it controlled.'
      : 'Warmup 15min, 30min @ tempo (Zone 3-4), cooldown 15min.',
    zones: ['Zone 3', 'Zone 4'],
  });

  // Saturday: Long Ride (main workout of the week)
  const saturdayMultiplier = isVeryFresh ? 1.8 : isFatigued ? 1.2 : 1.5;
  plan.push({
    day: 'Saturday',
    type: 'long',
    targetTSS: Math.round(currentCTL * saturdayMultiplier),
    duration: isVeryFresh ? 180 : isFatigued ? 120 : 150,
    description: isVeryFresh
      ? '3+ hours Zone 2 endurance with some Zone 3 efforts. Push the distance!'
      : isFatigued
      ? '2 hours easy Zone 2. Keep it comfortable and enjoyable.'
      : '2.5-3 hours Zone 2 endurance with some rolling hills. Enjoy the scenery!',
    zones: ['Zone 2'],
    routeSuggestion: isFatigued ? 'Moderate route' : 'Hilly scenic route'
  });

  // Sunday: Active Recovery or Rest
  plan.push({
    day: 'Sunday',
    type: 'recovery',
    targetTSS: Math.round(currentCTL * 0.5),
    duration: 60,
    description: isFatigued
      ? 'Complete rest or very light activity. Recover for next week.'
      : '60 min easy spin or complete rest. Listen to your body.',
    zones: ['Zone 1', 'Zone 2'],
  });

  return plan;
}

/**
 * Get workout type color for UI
 */
export function getWorkoutTypeColor(type: Workout['type']): string {
  switch (type) {
    case 'recovery':
      return '#00FF88'; // Green
    case 'endurance':
      return '#00D9FF'; // Blue
    case 'tempo':
      return '#FFB800'; // Orange
    case 'intervals':
      return '#FF3366'; // Red
    case 'long':
      return '#9D4EDD'; // Purple
    case 'rest':
      return '#888888'; // Gray
    default:
      return '#FFFFFF';
  }
}

/**
 * Get workout type icon name for UI
 */
export function getWorkoutTypeIcon(type: Workout['type']): string {
  switch (type) {
    case 'recovery':
      return 'heart';
    case 'endurance':
      return 'bike';
    case 'tempo':
      return 'gauge';
    case 'intervals':
      return 'zap';
    case 'long':
      return 'mountain';
    case 'rest':
      return 'moon';
    default:
      return 'activity';
  }
}
