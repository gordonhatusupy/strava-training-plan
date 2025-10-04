import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import FitnessChart from '../components/FitnessChart';
import ActivityCard from '../components/ActivityCard';
import { Activity, FitnessMetrics, HistoricalMetric } from '../types';
import { activitiesAPI, metricsAPI } from '../utils/api';
import { getTSBStatus, getTSBColor } from '../utils/format';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FitnessMetrics | null>(null);
  const [history, setHistory] = useState<HistoricalMetric[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('Dashboard: Starting to load data...');
    try {
      setError(null);
      const [metricsRes, historyRes, activitiesRes] = await Promise.all([
        metricsAPI.getCurrentMetrics(),
        metricsAPI.getHistoricalMetrics(90),
        activitiesAPI.getActivities(10)
      ]);

      console.log('Dashboard: Data loaded successfully', { metricsRes, historyRes, activitiesRes });
      setMetrics(metricsRes.data);
      setHistory(historyRes.data);
      setActivities(activitiesRes.data);
      setMounted(true);
    } catch (error) {
      console.error('Dashboard: Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Make sure you are connected to Strava.');
      setMounted(true);
    } finally {
      console.log('Dashboard: Loading complete, mounted:', mounted, 'loading:', loading);
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await activitiesAPI.syncActivities(90);
      await loadData();
    } catch (error) {
      console.error('Failed to sync activities:', error);
    } finally {
      setSyncing(false);
    }
  };

  console.log('Dashboard render:', { loading, mounted, error, hasMetrics: !!metrics });

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-accent text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-surface border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent px-4 py-2 rounded-lg hover:bg-accent/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-semibold">Sync</span>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-surface rounded-2xl p-8 border border-border text-center">
            <p className="text-danger text-lg mb-4">{error}</p>
            <button
              onClick={loadData}
              className="bg-accent/10 border border-accent/30 text-accent px-6 py-2 rounded-lg hover:bg-accent/20 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tsbColor = metrics ? getTSBColor(metrics.tsb) : 'accent';
  const tsbStatus = metrics ? getTSBStatus(metrics.tsb) : '';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent px-4 py-2 rounded-lg hover:bg-accent/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-semibold">Sync</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Metrics Row */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              label="FITNESS"
              value={metrics.ctl}
              subtext="CTL"
              trend={`${metrics.ctl > 50 ? 'Strong' : 'Building'} base`}
              color="accent"
            />
            <MetricCard
              label="FATIGUE"
              value={metrics.atl}
              subtext="ATL"
              trend={`${metrics.atl > metrics.ctl ? 'High' : 'Manageable'} load`}
              color="warning"
            />
            <MetricCard
              label="FORM"
              value={metrics.tsb}
              subtext="TSB"
              status={tsbStatus}
              color={tsbColor === '#00FF88' ? 'success' : tsbColor === '#FFB800' ? 'warning' : 'danger'}
            />
          </div>
        )}

        {/* Fitness Chart */}
        {history.length > 0 && (
          <div className="mb-8">
            <FitnessChart data={history} />
          </div>
        )}

        {/* Weekly Summary */}
        {metrics && (
          <div className="bg-surface rounded-2xl p-6 border border-border mb-8">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              This Week's Training
            </h3>
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-4xl font-bold text-white">
                  {metrics.currentWeekTSS}
                  <span className="text-xl text-gray-500"> / {metrics.targetWeeklyTSS}</span>
                </p>
                <p className="text-sm text-gray-400">Total TSS</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent">{Math.round(metrics.weekProgress)}%</p>
                <p className="text-xs text-gray-500">Week Progress</p>
              </div>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-gradient-to-r from-accent to-purple h-2 rounded-full transition-all"
                style={{ width: `${Math.min(metrics.weekProgress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
            Recent Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.length > 0 ? (
              activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="col-span-2 bg-surface rounded-xl p-8 border border-border text-center">
                <p className="text-gray-400">
                  No activities yet. Click Sync to import from Strava.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
