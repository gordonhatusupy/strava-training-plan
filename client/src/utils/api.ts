import axios from 'axios';
import { User, Activity, FitnessMetrics, HistoricalMetric, WorkoutPlan, Workout } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

// Auth
export const authAPI = {
  getCurrentUser: () => api.get<User>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Activities
export const activitiesAPI = {
  getActivities: (limit?: number) =>
    api.get<Activity[]>('/api/activities', { params: { limit } }),
  syncActivities: (days?: number) =>
    api.post('/api/activities/sync', {}, { params: { days } }),
  getActivity: (id: number) =>
    api.get<Activity>(`/api/activities/${id}`),
};

// Metrics
export const metricsAPI = {
  getCurrentMetrics: () =>
    api.get<FitnessMetrics>('/api/metrics/current'),
  getHistoricalMetrics: (days?: number) =>
    api.get<HistoricalMetric[]>('/api/metrics/history', { params: { days } }),
};

// Workouts
export const workoutsAPI = {
  generateWorkoutPlan: (weekStart?: string) =>
    api.post<WorkoutPlan>('/api/workouts/generate', { weekStart }),
  getWeekWorkouts: (date: string) =>
    api.get<Workout[]>(`/api/workouts/week/${date}`),
  completeWorkout: (id: string) =>
    api.patch<Workout>(`/api/workouts/${id}/complete`),
};

// User
export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateSettings: (data: { ftp?: number }) =>
    api.patch('/api/user/settings', data),
};

export default api;
