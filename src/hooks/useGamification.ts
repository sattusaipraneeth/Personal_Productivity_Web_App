import { useState, useEffect } from 'react';
import { Achievement, User } from '../types';

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-task',
    title: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    points: 10,
    category: 'tasks'
  },
  {
    id: 'task-master',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '🏆',
    points: 50,
    category: 'tasks'
  },
  {
    id: 'streak-starter',
    title: 'Streak Starter',
    description: 'Maintain a 7-day habit streak',
    icon: '🔥',
    points: 30,
    category: 'streaks'
  },
  {
    id: 'habit-hero',
    title: 'Habit Hero',
    description: 'Complete 30 habit sessions',
    icon: '💪',
    points: 100,
    category: 'habits'
  },
  {
    id: 'time-warrior',
    title: 'Time Warrior',
    description: 'Complete 10 Pomodoro sessions',
    icon: '⏰',
    points: 75,
    category: 'time'
  },
  {
    id: 'productivity-guru',
    title: 'Productivity Guru',
    description: 'Reach level 10',
    icon: '🧙‍♂️',
    points: 200,
    category: 'special'
  }
];

export function useGamification() {
  const [user, setUser] = useState<Partial<User>>({
    level: 1,
    totalPoints: 0,
    achievements: []
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('clarity-hub-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const saveUser = (userData: Partial<User>) => {
    setUser(userData);
    localStorage.setItem('clarity-hub-user', JSON.stringify(userData));
  };

  const addPoints = (points: number, reason: string) => {
    const newPoints = (user.totalPoints || 0) + points;
    const newLevel = Math.floor(newPoints / 100) + 1;
    
    const updatedUser = {
      ...user,
      totalPoints: newPoints,
      level: newLevel
    };

    saveUser(updatedUser);

    // Check for new achievements
    checkAchievements(updatedUser, reason);

    return { points: newPoints, level: newLevel, leveledUp: newLevel > (user.level || 1) };
  };

  const checkAchievements = (userData: Partial<User>, context: string) => {
    const unlockedAchievements = userData.achievements || [];
    const newAchievements: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedAchievements.find(a => a.id === achievement.id)) return;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first-task':
          shouldUnlock = context === 'task-completed';
          break;
        case 'task-master':
          const completedTasks = JSON.parse(localStorage.getItem('clarity-hub-tasks') || '[]')
            .filter((task: any) => task.completed).length;
          shouldUnlock = completedTasks >= 10;
          break;
        case 'streak-starter':
          const habits = JSON.parse(localStorage.getItem('clarity-hub-habits') || '[]');
          shouldUnlock = habits.some((habit: any) => habit.streak >= 7);
          break;
        case 'habit-hero':
          const totalHabitCompletions = JSON.parse(localStorage.getItem('clarity-hub-habits') || '[]')
            .reduce((total: number, habit: any) => total + habit.totalCompletions, 0);
          shouldUnlock = totalHabitCompletions >= 30;
          break;
        case 'time-warrior':
          const pomodoroSessions = JSON.parse(localStorage.getItem('pomodoro-sessions') || '[]');
          shouldUnlock = pomodoroSessions.filter((session: any) => session.completed).length >= 10;
          break;
        case 'productivity-guru':
          shouldUnlock = (userData.level || 1) >= 10;
          break;
      }

      if (shouldUnlock) {
        const unlockedAchievement = { ...achievement, unlockedAt: new Date() };
        newAchievements.push(unlockedAchievement);
      }
    });

    if (newAchievements.length > 0) {
      const updatedAchievements = [...unlockedAchievements, ...newAchievements];
      const bonusPoints = newAchievements.reduce((total, achievement) => total + achievement.points, 0);
      
      const finalUser = {
        ...userData,
        achievements: updatedAchievements,
        totalPoints: (userData.totalPoints || 0) + bonusPoints
      };

      saveUser(finalUser);

      // Show achievement notification
      newAchievements.forEach(achievement => {
        showAchievementNotification(achievement);
      });
    }
  };

  const showAchievementNotification = (achievement: Achievement) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🎉 Achievement Unlocked!`, {
        body: `${achievement.icon} ${achievement.title}: ${achievement.description}`,
        icon: '/favicon.ico'
      });
    }

    // Trigger confetti or celebration animation
    const event = new CustomEvent('achievement-unlocked', { detail: achievement });
    window.dispatchEvent(event);
  };

  const getNextLevelProgress = () => {
    const currentLevelPoints = ((user.level || 1) - 1) * 100;
    const nextLevelPoints = (user.level || 1) * 100;
    const progress = ((user.totalPoints || 0) - currentLevelPoints) / (nextLevelPoints - currentLevelPoints) * 100;
    return Math.min(progress, 100);
  };

  return {
    user,
    addPoints,
    checkAchievements,
    getNextLevelProgress,
    achievements: ACHIEVEMENTS
  };
}