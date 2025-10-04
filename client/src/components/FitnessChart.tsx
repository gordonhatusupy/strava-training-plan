import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { HistoricalMetric } from '../types';

interface FitnessChartProps {
  data: HistoricalMetric[];
}

const FitnessChart: React.FC<FitnessChartProps> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const date = payload[0]?.payload?.date;
    const ctl = payload.find((p: any) => p.dataKey === 'ctl');
    const atl = payload.find((p: any) => p.dataKey === 'atl');
    const tsb = payload.find((p: any) => p.dataKey === 'tsb');

    return (
      <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
        {date && (
          <p className="text-xs text-gray-400 mb-1">
            {new Date(date).toLocaleDateString()}
          </p>
        )}
        {ctl && (
          <p className="text-sm text-accent">
            CTL (Fitness): <span className="font-bold">{ctl.value}</span>
          </p>
        )}
        {atl && (
          <p className="text-sm text-warning">
            ATL (Fatigue): <span className="font-bold">{atl.value}</span>
          </p>
        )}
        {tsb && (
          <p className="text-sm text-success">
            TSB (Form): <span className="font-bold">{tsb.value}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface rounded-2xl p-6 border border-border">
      <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
        Fitness Progression
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="ctlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />

          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#888888"
            tick={{ fill: '#888888', fontSize: 12 }}
            tickLine={{ stroke: '#2A2A2A' }}
          />

          <YAxis
            stroke="#888888"
            tick={{ fill: '#888888', fontSize: 12 }}
            tickLine={{ stroke: '#2A2A2A' }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* CTL - Area */}
          <Area
            type="monotone"
            dataKey="ctl"
            stroke="#00D9FF"
            strokeWidth={3}
            fill="url(#ctlGradient)"
          />

          {/* ATL - Line */}
          <Line
            type="monotone"
            dataKey="atl"
            stroke="#FFB800"
            strokeWidth={2}
            dot={false}
          />

          {/* TSB - Line */}
          <Line
            type="monotone"
            dataKey="tsb"
            stroke="#00FF88"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-xs text-gray-400">CTL (Fitness)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-xs text-gray-400">ATL (Fatigue)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-gray-400">TSB (Form)</span>
        </div>
      </div>
    </div>
  );
};

export default FitnessChart;
