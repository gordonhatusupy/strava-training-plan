export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  device_watts?: boolean;
  has_heartrate: boolean;
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  profile: string;
}

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface FitnessMetrics {
  ctl: number;
  atl: number;
  tsb: number;
  currentWeekTSS: number;
  targetWeeklyTSS: number;
}

export interface Workout {
  day: string;
  type: 'recovery' | 'endurance' | 'tempo' | 'intervals' | 'long' | 'rest';
  targetTSS: number;
  duration: number;
  description: string;
  zones: string[];
  routeSuggestion?: string;
}

export interface UserPreferences {
  availableDays?: string[];
  weeklyHours?: number;
  ctlTarget?: number;
}
