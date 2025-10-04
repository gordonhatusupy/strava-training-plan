import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import WorkoutCard from '../components/WorkoutCard';
import { Workout } from '../types';
import { workoutsAPI } from '../utils/api';

const Workouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }

  useEffect(() => {
    loadWorkouts();
  }, [weekStart]);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const res = await workoutsAPI.getWeekWorkouts(weekStart.toISOString());
      setWorkouts(res.data);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await workoutsAPI.generateWorkoutPlan(weekStart.toISOString());
      setWorkouts(res.data.workouts);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await workoutsAPI.completeWorkout(id);
      await loadWorkouts();
    } catch (error) {
      console.error('Failed to complete workout:', error);
    }
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setWeekStart(newDate);
  };

  const formatWeekRange = (start: Date): string => {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">Workout Plan</h1>

          {/* Week Navigator */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-border rounded-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>

            <div className="text-center">
              <p className="text-white font-semibold">{formatWeekRange(weekStart)}</p>
              <p className="text-xs text-gray-500">
                {weekStart.getFullYear()}
              </p>
            </div>

            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-border rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Generate Plan Button */}
        {workouts.length === 0 && !loading && (
          <div className="bg-surface rounded-2xl p-8 border border-border text-center mb-8">
            <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">No Plan for This Week</h3>
            <p className="text-gray-400 mb-6">Generate a personalized training plan based on your current fitness</p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-gradient-to-r from-accent to-purple text-white font-semibold px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-accent/50 transition-all disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        )}

        {workouts.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-400">
                {workouts.filter(w => w.completed).length} of {workouts.length} workouts completed
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="text-sm text-accent hover:text-accent/80 transition-all disabled:opacity-50"
              >
                Regenerate Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workouts
                .sort((a, b) => {
                  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
                })
                .map(workout => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onComplete={handleComplete}
                  />
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Workouts;
