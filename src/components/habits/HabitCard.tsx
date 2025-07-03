import React from 'react';
import { Edit2, Trash2, Flame, Calendar, Target } from 'lucide-react';
import { Habit } from '../../types';
import { getTodayString } from '../../utils/dates';
import GlassCard from '../common/GlassCard';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const today = getTodayString();
  const isCompletedToday = habit.completedDates.includes(today);
  
  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return '💎';
    if (streak >= 50) return '🏆';
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '✨';
    return '🌟';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-red-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-500';
    return 'text-blue-500';
  };

  return (
    <GlassCard className="p-6 hover:bg-white/15 dark:hover:bg-black/15 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {habit.name}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(habit)}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {habit.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {habit.description}
        </p>
      )}

      {/* Streak Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className={`text-lg font-bold ${getStreakColor(habit.streak)}`}>
            {habit.streak}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">day streak</span>
          <span className="text-lg">{getStreakEmoji(habit.streak)}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <Target className="w-4 h-4" />
          <span>Target: {habit.target}/day</span>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Today's Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isCompletedToday ? habit.target : 0} / {habit.target}
          </span>
        </div>
        
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: habit.color,
              width: `${isCompletedToday ? 100 : 0}%`
            }}
          />
        </div>

        {/* Complete Button */}
        <button
          onClick={() => onToggle(habit.id)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            isCompletedToday
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-black/30'
          }`}
        >
          {isCompletedToday ? '✅ Completed Today' : 'Mark as Complete'}
        </button>
      </div>

      {/* Recent Activity */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>Last 7 days:</span>
        </div>
        <div className="flex space-x-1 mt-2">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateString = date.toISOString().split('T')[0];
            const isCompleted = habit.completedDates.includes(dateString);
            
            return (
              <div
                key={i}
                className={`w-6 h-6 rounded-sm ${
                  isCompleted 
                    ? 'opacity-100' 
                    : 'bg-gray-200 dark:bg-gray-700 opacity-30'
                }`}
                style={{ 
                  backgroundColor: isCompleted ? habit.color : undefined
                }}
                title={date.toLocaleDateString()}
              />
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}