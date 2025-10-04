export interface User {
  id: string;
  stravaId: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
  ftp?: number;
  createdAt: string;
}

export interface Activity {
  id: number;
  name: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  totalElevationGain: number;
  type: string;
  sportType: string;
  startDate: string;
  averageHeartrate?: number;
  maxHeartrate?: number;
  averageWatts?: number;
  weightedAverageWatts?: number;
  kilojoules?: number;
  hasHeartrate: boolean;
  deviceWatts: boolean;
  calculatedTSS?: number;
  polyline?: string;
}

export interface FitnessMetrics {
  ctl: number;
  atl: number;
  tsb: number;
  currentWeekTSS: number;
  targetWeeklyTSS: number;
  weekProgress: number;
}

export interface HistoricalMetric {
  date: string;
  ctl: number;
  atl: number;
  tsb: number;
}

export interface Workout {
  id: string;
  day: string;
  date: string;
  type: 'recovery' | 'endurance' | 'tempo' | 'intervals' | 'long' | 'rest';
  targetTSS: number;
  duration: number;
  description: string;
  zones: string[];
  routeSuggestion?: string;
  completed: boolean;
}

export interface WorkoutPlan {
  weekStart: string;
  currentMetrics: {
    ctl: number;
    atl: number;
    tsb: number;
  };
  workouts: Workout[];
}
