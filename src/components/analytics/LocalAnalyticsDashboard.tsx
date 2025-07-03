import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Target, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { useLocalAnalytics } from '../../hooks/useLocalAnalytics';
import GlassCard from '../common/GlassCard';

export default function LocalAnalyticsDashboard() {
  const { 
    analyticsData, 
    weeklyReports, 
    loading, 
    getProductivityTrend, 
    getBestPerformanceDay, 
    getInsights,
    exportAnalyticsData 
  } = useLocalAnalytics();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month'>('week');

  const trend = getProductivityTrend();
  const bestDay = getBestPerformanceDay();
  const insights = getInsights();

  const displayData = selectedTimeframe === 'week' 
    ? analyticsData.slice(-7)
    : analyticsData.slice(-30);

  const totalStats = analyticsData.reduce((acc, day) => ({
    totalTasks: acc.totalTasks + day.tasksCompleted,
    totalFocusTime: acc.totalFocusTime + day.totalFocusTime,
    totalPomodoros: acc.totalPomodoros + day.pomodoroSessions,
    avgProductivity: acc.avgProductivity + day.productivityScore
  }), { totalTasks: 0, totalFocusTime: 0, totalPomodoros: 0, avgProductivity: 0 });

  if (analyticsData.length > 0) {
    totalStats.avgProductivity = Math.round(totalStats.avgProductivity / analyticsData.length);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Local Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your productivity insights stored locally
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month')}
            className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          
          <button
            onClick={exportAnalyticsData}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalStats.totalTasks}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tasks Completed
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(totalStats.totalFocusTime)}m
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Focus Time
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalStats.avgProductivity}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Productivity
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {trend > 0 ? '+' : ''}{trend}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Trend (7 days)
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Productivity Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="productivityScore" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Productivity Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Daily Activity */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                <Bar dataKey="tasksCompleted" fill="#10B981" name="Tasks" />
                <Bar dataKey="habitsCompleted" fill="#3B82F6" name="Habits" />
                <Bar dataKey="pomodoroSessions" fill="#EF4444" name="Pomodoros" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Weekly Reports */}
      {weeklyReports.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Reports
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Week</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Tasks</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Completion</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Top Category</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Focus Time</th>
                  <th className="text-left py-2 text-gray-600 dark:text-gray-400">Productivity</th>
                </tr>
              </thead>
              <tbody>
                {weeklyReports.slice(0, 4).map((report) => (
                  <tr key={report.week} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 text-gray-900 dark:text-white">
                      {new Date(report.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{report.totalTasks}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{report.completionRate}%</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{report.topCategory}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{Math.round(report.totalFocusTime)}m</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{report.averageProductivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Productivity Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <p className="text-sm text-blue-800 dark:text-blue-300">{insight}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}