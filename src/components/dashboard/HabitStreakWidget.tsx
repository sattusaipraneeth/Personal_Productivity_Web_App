import React from 'react';
import { Flame, Target, Calendar } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { Habit } from '../../types';

interface HabitStreakWidgetProps {
  habits: Habit[];
}

export default function HabitStreakWidget({ habits }: HabitStreakWidgetProps) {
  const todayString = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(habit => 
    habit.completedDates.includes(todayString)
  ).length;

  const topStreaks = habits
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-red-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '✨';
    return '🌟';
  };

  return (
    <GlassCard className="p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <Flame className="w-5 h-5 mr-2 text-orange-500" />
        Habit Streaks
      </h3>
      
      <div className="space-y-4">
        {/* Today's Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Today's Habits
              </span>
            </div>
            <div className="text-lg font-bold text-gray-800 dark:text-white">
              {completedToday}/{habits.length}
            </div>
          </div>
          {habits.length > 0 && (
            <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedToday / habits.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Top Streaks */}
        {topStreaks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Top Streaks
            </h4>
            <div className="space-y-2">
              {topStreaks.map((habit, index) => (
                <div key={habit.id} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{getStreakBadge(habit.streak)}</span>
                    <span className={`text-lg font-bold ${getStreakColor(habit.streak)}`}>
                      {habit.streak}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {habit.name}
                    </div>
                  </div>
                  {index === 0 && habit.streak > 0 && (
                    <div className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                      Best
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {habits.length === 0 && (
          <div className="text-center py-6">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No habits tracked yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Start building consistent habits!
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}