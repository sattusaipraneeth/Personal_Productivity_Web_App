import { useState, useEffect } from 'react';
import { useOfflineStorage } from './useOfflineStorage';

interface AnalyticsData {
  date: string;
  tasksCompleted: number;
  tasksCreated: number;
  habitsCompleted: number;
  pomodoroSessions: number;
  totalFocusTime: number; // in minutes
  productivityScore: number;
  streakDays: number;
  categoriesWorked: string[];
}

interface WeeklyReport {
  week: string;
  totalTasks: number;
  completionRate: number;
  topCategory: string;
  totalFocusTime: number;
  averageProductivity: number;
}

export function useLocalAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const { saveAnalyticsData, getAnalyticsData } = useOfflineStorage();

  useEffect(() => {
    loadAnalyticsData();
    
    // Update analytics daily
    const interval = setInterval(updateDailyAnalytics, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const data = await getAnalyticsData(
        thirtyDaysAgo.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
      
      setAnalyticsData(data);
      generateWeeklyReports(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDailyAnalytics = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Get data from localStorage
      const tasks = JSON.parse(localStorage.getItem('clarity-hub-tasks') || '[]');
      const habits = JSON.parse(localStorage.getItem('clarity-hub-habits') || '[]');
      const pomodoroSessions = JSON.parse(localStorage.getItem('pomodoro-sessions') || '[]');
      
      // Calculate today's metrics
      const todayTasks = tasks.filter((task: any) => 
        new Date(task.updatedAt).toDateString() === new Date().toDateString()
      );
      
      const completedTasks = todayTasks.filter((task: any) => task.completed);
      const createdTasks = tasks.filter((task: any) => 
        new Date(task.createdAt).toDateString() === new Date().toDateString()
      );
      
      const todayHabits = habits.filter((habit: any) => 
        habit.completedDates.includes(today)
      );
      
      const todayPomodoros = pomodoroSessions.filter((session: any) => 
        new Date(session.startTime).toDateString() === new Date().toDateString() &&
        session.completed
      );
      
      const totalFocusTime = todayPomodoros.reduce((total: number, session: any) => 
        total + (session.duration / 60), 0
      );
      
      const categoriesWorked = Array.from(new Set(
        completedTasks.map((task: any) => task.category)
      ));
      
      // Calculate productivity score (0-100)
      const taskScore = Math.min((completedTasks.length / Math.max(createdTasks.length, 1)) * 40, 40);
      const habitScore = Math.min((todayHabits.length / Math.max(habits.length, 1)) * 30, 30);
      const focusScore = Math.min((totalFocusTime / 120) * 30, 30); // 2 hours = max score
      const productivityScore = Math.round(taskScore + habitScore + focusScore);
      
      // Calculate current streak
      const streakDays = calculateCurrentStreak(habits);
      
      const dailyData: AnalyticsData = {
        date: today,
        tasksCompleted: completedTasks.length,
        tasksCreated: createdTasks.length,
        habitsCompleted: todayHabits.length,
        pomodoroSessions: todayPomodoros.length,
        totalFocusTime,
        productivityScore,
        streakDays,
        categoriesWorked
      };
      
      await saveAnalyticsData(today, dailyData);
      await loadAnalyticsData(); // Refresh data
      
    } catch (error) {
      console.error('Error updating daily analytics:', error);
    }
  };

  const calculateCurrentStreak = (habits: any[]) => {
    if (habits.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      const completedHabits = habits.filter(habit => 
        habit.completedDates.includes(dateString)
      );
      
      if (completedHabits.length > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const generateWeeklyReports = (data: AnalyticsData[]) => {
    const weeks: { [key: string]: AnalyticsData[] } = {};
    
    data.forEach(day => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(day);
    });
    
    const reports: WeeklyReport[] = Object.entries(weeks).map(([weekStart, weekData]) => {
      const totalTasks = weekData.reduce((sum, day) => sum + day.tasksCompleted, 0);
      const totalCreated = weekData.reduce((sum, day) => sum + day.tasksCreated, 0);
      const completionRate = totalCreated > 0 ? Math.round((totalTasks / totalCreated) * 100) : 0;
      
      const allCategories = weekData.flatMap(day => day.categoriesWorked);
      const categoryCount: { [key: string]: number } = {};
      allCategories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      
      const topCategory = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
      
      const totalFocusTime = weekData.reduce((sum, day) => sum + day.totalFocusTime, 0);
      const averageProductivity = Math.round(
        weekData.reduce((sum, day) => sum + day.productivityScore, 0) / weekData.length
      );
      
      return {
        week: weekStart,
        totalTasks,
        completionRate,
        topCategory,
        totalFocusTime,
        averageProductivity
      };
    });
    
    setWeeklyReports(reports.sort((a, b) => b.week.localeCompare(a.week)));
  };

  const getProductivityTrend = (days: number = 7) => {
    const recentData = analyticsData.slice(-days);
    if (recentData.length < 2) return 0;
    
    const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
    const secondHalf = recentData.slice(Math.floor(recentData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, day) => sum + day.productivityScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.productivityScore, 0) / secondHalf.length;
    
    return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  };

  const getBestPerformanceDay = () => {
    if (analyticsData.length === 0) return null;
    
    return analyticsData.reduce((best, current) => 
      current.productivityScore > best.productivityScore ? current : best
    );
  };

  const getInsights = () => {
    const insights: string[] = [];
    const trend = getProductivityTrend();
    const bestDay = getBestPerformanceDay();
    const avgFocusTime = analyticsData.reduce((sum, day) => sum + day.totalFocusTime, 0) / analyticsData.length;
    
    if (trend > 10) {
      insights.push("📈 Your productivity is trending upward! Keep up the great work.");
    } else if (trend < -10) {
      insights.push("📉 Your productivity has dipped recently. Consider reviewing your goals.");
    }
    
    if (avgFocusTime > 120) {
      insights.push("🎯 Excellent focus time! You're averaging over 2 hours of deep work daily.");
    } else if (avgFocusTime < 60) {
      insights.push("⏰ Try to increase your focus time. Aim for at least 1 hour of deep work daily.");
    }
    
    if (bestDay) {
      const bestDayName = new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'long' });
      insights.push(`⭐ ${bestDayName}s seem to be your most productive days!`);
    }
    
    return insights;
  };

  const exportAnalyticsData = () => {
    const exportData = {
      analyticsData,
      weeklyReports,
      insights: getInsights(),
      exportDate: new Date().toISOString(),
      summary: {
        totalDays: analyticsData.length,
        averageProductivity: Math.round(
          analyticsData.reduce((sum, day) => sum + day.productivityScore, 0) / analyticsData.length
        ),
        totalFocusTime: analyticsData.reduce((sum, day) => sum + day.totalFocusTime, 0),
        totalTasksCompleted: analyticsData.reduce((sum, day) => sum + day.tasksCompleted, 0)
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarity-hub-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    analyticsData,
    weeklyReports,
    loading,
    updateDailyAnalytics,
    getProductivityTrend,
    getBestPerformanceDay,
    getInsights,
    exportAnalyticsData
  };
}