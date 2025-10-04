import React from 'react';
import { Heart, Bike, Gauge, Zap, Mountain, Moon, Check } from 'lucide-react';
import { Workout } from '../types';
import { getWorkoutTypeColor } from '../utils/format';

interface WorkoutCardProps {
  workout: Workout;
  onComplete?: (id: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onComplete }) => {
  const getIcon = () => {
    switch (workout.type) {
      case 'recovery':
        return <Heart className="w-5 h-5" />;
      case 'endurance':
        return <Bike className="w-5 h-5" />;
      case 'tempo':
        return <Gauge className="w-5 h-5" />;
      case 'intervals':
        return <Zap className="w-5 h-5" />;
      case 'long':
        return <Mountain className="w-5 h-5" />;
      case 'rest':
        return <Moon className="w-5 h-5" />;
      default:
        return <Bike className="w-5 h-5" />;
    }
  };

  const color = getWorkoutTypeColor(workout.type);
  const isRest = workout.type === 'rest';

  return (
    <div
      className={`bg-surface rounded-xl p-5 border transition-all ${
        workout.completed
          ? 'border-success/50 bg-success/5'
          : 'border-border hover:border-accent/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {getIcon()}
          </div>
          <div>
            <h4 className="text-white font-semibold capitalize">{workout.type}</h4>
            <p className="text-xs text-gray-500">{workout.day}</p>
          </div>
        </div>

        {workout.completed && (
          <div className="bg-success/20 border border-success/50 rounded-full p-2">
            <Check className="w-4 h-4 text-success" />
          </div>
        )}
      </div>

      {!isRest && (
        <div className="flex gap-4 mb-3">
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-semibold text-white">{workout.duration} min</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Target TSS</p>
            <p className="text-sm font-semibold text-accent">{Math.round(workout.targetTSS)}</p>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-300 mb-3">{workout.description}</p>

      {workout.zones.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {workout.zones.map((zone, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {zone}
            </span>
          ))}
        </div>
      )}

      {workout.routeSuggestion && (
        <p className="text-xs text-gray-500 italic">Route: {workout.routeSuggestion}</p>
      )}

      {!workout.completed && onComplete && !isRest && (
        <button
          onClick={() => onComplete(workout.id)}
          className="mt-4 w-full bg-accent/10 border border-accent/30 text-accent font-semibold py-2 rounded-lg hover:bg-accent/20 transition-all"
        >
          Mark as Complete
        </button>
      )}
    </div>
  );
};

export default WorkoutCard;
