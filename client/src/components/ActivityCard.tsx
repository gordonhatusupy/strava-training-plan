import React from 'react';
import { Bike, Mountain, Clock, TrendingUp } from 'lucide-react';
import { Activity } from '../types';
import { formatDistance, formatElevation, formatDuration, formatDate } from '../utils/format';

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  return (
    <div className="bg-surface rounded-xl p-4 border border-border hover:border-accent/50 transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-1">{activity.name}</h4>
          <p className="text-xs text-gray-500">{formatDate(activity.startDate)}</p>
        </div>
        {activity.calculatedTSS && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-1">
            <span className="text-xs text-gray-400">TSS</span>
            <p className="text-lg font-bold text-accent">{Math.round(activity.calculatedTSS)}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Bike className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Distance</p>
            <p className="text-sm font-semibold text-white">{formatDistance(activity.distance)} km</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Time</p>
            <p className="text-sm font-semibold text-white">{formatDuration(activity.movingTime)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Elevation</p>
            <p className="text-sm font-semibold text-white">{formatElevation(activity.totalElevationGain)} m</p>
          </div>
        </div>
      </div>

      {activity.averageWatts && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <TrendingUp className="w-3 h-3" />
            <span>Avg Power: <span className="text-white font-semibold">{Math.round(activity.averageWatts)}W</span></span>
            {activity.averageHeartrate && (
              <span className="ml-4">Avg HR: <span className="text-white font-semibold">{Math.round(activity.averageHeartrate)} bpm</span></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
