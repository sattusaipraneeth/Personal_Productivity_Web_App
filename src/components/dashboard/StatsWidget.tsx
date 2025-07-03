import React from 'react';
import { CheckCircle, Circle, Target, TrendingUp } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { Task, Habit } from '../../types';

interface StatsWidgetProps {
  tasks: Task[];
  habits: Habit[];
}

export default function StatsWidget({ tasks, habits }: StatsWidgetProps) {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const todayString = new Date().toISOString().split('T')[0];
  const completedHabitsToday = habits.filter(habit => 
    habit.completedDates.includes(todayString)
  ).length;
  const totalHabits = habits.length;

  const stats = [
    {
      label: 'Tasks Completed',
      value: completedTasks,
      total: totalTasks,
      icon: CheckCircle,
      color: 'text-accent-green',
      bgColor: 'bg-accent-green/10'
    },
    {
      label: 'Habits Today',
      value: completedHabitsToday,
      total: totalHabits,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Completion Rate',
      value: completionRate,
      unit: '%',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <GlassCard className="p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Today's Progress
      </h3>
      
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stat.value}
                </span>
                {stat.total && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    / {stat.total}
                  </span>
                )}
                {stat.unit && (
                  <span className="text-lg text-gray-600 dark:text-gray-300">
                    {stat.unit}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}