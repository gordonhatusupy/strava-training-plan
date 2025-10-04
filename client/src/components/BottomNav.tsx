import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Settings as SettingsIcon } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center py-3">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
              isActive('/dashboard')
                ? 'text-accent bg-accent/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs font-semibold">Dashboard</span>
          </Link>

          <Link
            to="/workouts"
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
              isActive('/workouts')
                ? 'text-accent bg-accent/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-semibold">Workouts</span>
          </Link>

          <Link
            to="/settings"
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
              isActive('/settings')
                ? 'text-accent bg-accent/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-xs font-semibold">Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
