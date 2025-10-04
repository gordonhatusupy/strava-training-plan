import React from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  subtext: string;
  trend?: string;
  color?: string;
  status?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  trend,
  color = 'accent',
  status
}) => {
  const colorMap: Record<string, string> = {
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    purple: 'text-purple'
  };

  const bgColorMap: Record<string, string> = {
    accent: 'from-accent/20',
    success: 'from-success/20',
    warning: 'from-warning/20',
    danger: 'from-danger/20',
    purple: 'from-purple/20'
  };

  return (
    <div className="bg-surface rounded-2xl p-6 border border-border relative overflow-hidden">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColorMap[color]} to-transparent opacity-50`} />

      <div className="relative z-10">
        {/* Label */}
        <div className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-2">
          {label}
        </div>

        {/* Value */}
        <div className={`text-5xl font-bold ${colorMap[color]} mb-1`}>
          {value}
        </div>

        {/* Subtext */}
        <div className="text-sm text-gray-500 mb-2">
          {subtext}
        </div>

        {/* Trend or Status */}
        {trend && (
          <div className="text-xs text-gray-400">
            {trend}
          </div>
        )}

        {status && (
          <div className={`text-xs font-semibold ${colorMap[color]}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
