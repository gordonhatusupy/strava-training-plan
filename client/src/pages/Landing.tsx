import React from 'react';
import { Bike, TrendingUp, Calendar, Zap } from 'lucide-react';

const Landing: React.FC = () => {
  const handleConnect = () => {
    window.location.href = '/auth/strava';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-purple rounded-2xl flex items-center justify-center">
            <Bike className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Strava Training Plan
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Transform your cycling data into personalized training plans.
          Track fitness, analyze performance, and achieve your goals.
        </p>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          className="bg-gradient-to-r from-accent to-purple text-white font-bold text-lg px-12 py-4 rounded-full hover:shadow-lg hover:shadow-accent/50 transition-all transform hover:scale-105"
        >
          Connect with Strava
        </button>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-surface rounded-2xl p-6 border border-border">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-white font-semibold mb-2">Track Fitness</h3>
            <p className="text-sm text-gray-400">
              Monitor CTL, ATL, and TSB metrics to understand your training load and recovery
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-border">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Calendar className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-white font-semibold mb-2">Smart Plans</h3>
            <p className="text-sm text-gray-400">
              Get AI-generated weekly workout plans tailored to your current fitness level
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-border">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-white font-semibold mb-2">TSS Analysis</h3>
            <p className="text-sm text-gray-400">
              Automatic Training Stress Score calculation for every ride
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
