import React, { useEffect, useState } from 'react';
import { LogOut, Save } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { userAPI, authAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [ftp, setFtp] = useState<number>(200);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.ftp) {
      setFtp(user.ftp);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updateSettings({ ftp });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile */}
        <div className="bg-surface rounded-2xl p-6 border border-border mb-6">
          <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
            Profile
          </h3>

          <div className="flex items-center gap-4 mb-6">
            {user?.profilePhoto && (
              <img
                src={user.profilePhoto}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full border-2 border-accent"
              />
            )}
            <div>
              <p className="text-white font-semibold text-lg">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="bg-background/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Strava ID</p>
            <p className="text-white font-mono">{user?.stravaId}</p>
          </div>
        </div>

        {/* Training Settings */}
        <div className="bg-surface rounded-2xl p-6 border border-border mb-6">
          <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
            Training Settings
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Functional Threshold Power (FTP)
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Your FTP is used to calculate Training Stress Score (TSS) for workouts. Update this as your fitness improves.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={ftp}
                onChange={(e) => setFtp(parseInt(e.target.value))}
                className="flex-1 bg-background border border-border text-white px-4 py-3 rounded-lg focus:outline-none focus:border-accent"
                min="50"
                max="500"
              />
              <span className="text-gray-400 font-semibold">watts</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-accent/10 border border-accent/30 text-accent font-semibold py-3 rounded-lg hover:bg-accent/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Disconnect */}
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
            Account
          </h3>

          <button
            onClick={handleLogout}
            className="w-full bg-danger/10 border border-danger/30 text-danger font-semibold py-3 rounded-lg hover:bg-danger/20 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Disconnect from Strava
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
