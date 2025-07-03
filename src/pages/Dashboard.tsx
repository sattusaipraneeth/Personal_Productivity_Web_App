import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Task, Habit } from '../types';
import { getTasks, getHabits } from '../utils/storage';
import { useGamification } from '../hooks/useGamification';
import QuoteWidget from '../components/dashboard/QuoteWidget';
import StatsWidget from '../components/dashboard/StatsWidget';
import TaskSummaryWidget from '../components/dashboard/TaskSummaryWidget';
import HabitStreakWidget from '../components/dashboard/HabitStreakWidget';
import GlassCard from '../components/common/GlassCard';
import GamificationWidget from '../components/common/GamificationWidget';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useGamification();

  useEffect(() => {
    const savedTasks = getTasks();
    const savedHabits = getHabits();
    setTasks(savedTasks);
    setHabits(savedHabits);

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {getGreeting()}, {user?.name || 'Productivity Champion'}! 👋
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Welcome to your Clarity Hub
        </p>
      </div>

      {/* Date & Time Widget */}
      <GlassCard className="p-6 text-center">
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {formatDate(currentTime)}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Widget */}
        <div className="lg:col-span-1">
          <StatsWidget tasks={tasks} habits={habits} />
        </div>

        {/* Quote Widget */}
        <div className="lg:col-span-2">
          <QuoteWidget />
        </div>

        {/* Gamification Widget */}
        <div className="lg:col-span-1">
          <GamificationWidget />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Summary */}
        <TaskSummaryWidget tasks={tasks} />

        {/* Habit Streaks */}
        <HabitStreakWidget habits={habits} />
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {tasks.length === 0 && habits.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">Welcome to Clarity Hub!</p>
              <p className="text-sm">Start by creating your first task or habit to see your activity here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Recent Tasks ({tasks.length})
                </h4>
                {tasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center space-x-2 text-sm py-1">
                    <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{task.title}</span>
                    {task.points > 0 && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">+{task.points}pts</span>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Active Habits ({habits.length})
                </h4>
                {habits.slice(0, 3).map(habit => (
                  <div key={habit.id} className="flex items-center space-x-2 text-sm py-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{habit.name}</span>
                    <span className="text-xs text-gray-500">({habit.streak} day streak)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}