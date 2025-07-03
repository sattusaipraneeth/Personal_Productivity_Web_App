import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Task, Habit } from '../../types';
import { getTasks, getHabits } from '../../utils/storage';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import GlassCard from '../common/GlassCard';

export default function AnalyticsManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const savedTasks = getTasks();
    const savedHabits = getHabits();
    setTasks(savedTasks);
    setHabits(savedHabits);
  }, []);

  // Task Analytics
  const getTaskCompletionData = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      const completedTasks = tasks.filter(task => 
        task.completed && 
        format(new Date(task.updatedAt), 'yyyy-MM-dd') === dateString
      ).length;
      
      const createdTasks = tasks.filter(task => 
        format(new Date(task.createdAt), 'yyyy-MM-dd') === dateString
      ).length;
      
      data.push({
        date: format(date, timeRange === 'week' ? 'EEE' : 'MMM dd'),
        completed: completedTasks,
        created: createdTasks,
      });
    }
    
    return data;
  };

  // Habit Analytics
  const getHabitCompletionData = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      const completedHabits = habits.filter(habit => 
        habit.completedDates.includes(dateString)
      ).length;
      
      data.push({
        date: format(date, timeRange === 'week' ? 'EEE' : 'MMM dd'),
        completed: completedHabits,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0,
      });
    }
    
    return data;
  };

  // Priority Distribution
  const getPriorityDistribution = () => {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
    
    return priorities.map((priority, index) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: tasks.filter(task => task.priority === priority).length,
      color: colors[index],
    }));
  };

  // Category Distribution
  const getCategoryDistribution = () => {
    const categories = Array.from(new Set(tasks.map(task => task.category)));
    const colors = ['#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899'];
    
    return categories.map((category, index) => ({
      name: category,
      value: tasks.filter(task => task.category === category).length,
      color: colors[index % colors.length],
    }));
  };

  const taskCompletionData = getTaskCompletionData();
  const habitCompletionData = getHabitCompletionData();
  const priorityData = getPriorityDistribution();
  const categoryData = getCategoryDistribution();

  // Summary Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalHabits = habits.length;
  const todayString = format(new Date(), 'yyyy-MM-dd');
  const completedHabitsToday = habits.filter(habit => 
    habit.completedDates.includes(todayString)
  ).length;
  const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 0;
  
  const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const avgStreak = totalHabits > 0 ? Math.round(totalStreak / totalHabits) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your productivity patterns and insights
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {completionRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Task Completion Rate
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {completedTasks}/{totalTasks} tasks
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {habitCompletionRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Today's Habits
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {completedHabitsToday}/{totalHabits} habits
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Streak Days
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Avg: {avgStreak} days
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {tasks.filter(task => !task.completed).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Pending Tasks
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Active workload
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trend */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Task Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="created" fill="#3B82F6" name="Created" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Habit Completion Trend */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Habit Consistency
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={habitCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Completion %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Priority Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            Task Priority Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {priorityData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Category Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-500" />
            Task Categories
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Insights */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Productivity Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              Task Performance
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {completionRate >= 80 
                ? "Excellent! You're completing most of your tasks."
                : completionRate >= 60
                ? "Good progress! Try to complete a few more tasks."
                : "Focus on completing more tasks to improve productivity."
              }
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
              Habit Consistency
            </h4>
            <p className="text-sm text-green-600 dark:text-green-400">
              {avgStreak >= 14 
                ? "Amazing streak! Your habits are well established."
                : avgStreak >= 7
                ? "Good consistency! Keep building those habits."
                : "Focus on daily consistency to build stronger habits."
              }
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
              Workload Balance
            </h4>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {tasks.filter(task => !task.completed).length <= 5
                ? "Great! Your workload is manageable."
                : "Consider breaking down large tasks or prioritizing better."
              }
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}