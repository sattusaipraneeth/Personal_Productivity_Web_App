export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  projectId?: string;
  parentId?: string; // For sub-tasks
  subtasks?: Task[];
  recurring?: RecurringConfig;
  order: number;
  points: number;
  estimatedTime?: number; // in minutes
}

export interface RecurringConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every X days/weeks/months
  daysOfWeek?: number[]; // for weekly (0 = Sunday, 1 = Monday, etc.)
  dayOfMonth?: number; // for monthly
  endDate?: Date;
  lastGenerated?: Date;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  streak: number;
  completedDates: string[];
  createdAt: Date;
  target: number;
  userId?: string;
  points: number;
  level: number;
  totalCompletions: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  userId?: string;
  voiceNote?: boolean;
  audioUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  tasks?: Task[];
  points: number;
}

export interface Widget {
  id: string;
  type: 'tasks' | 'habits' | 'calendar' | 'quote' | 'analytics' | 'weather';
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  name: string;
  avatar?: string;
  dashboardLayout: Widget[];
  notifications: {
    email: boolean;
    desktop: boolean;
    reminders: boolean;
    sound: boolean;
  };
  gamification: {
    enabled: boolean;
    showPoints: boolean;
    showLevel: boolean;
    celebrateAchievements: boolean;
  };
  voice: {
    enabled: boolean;
    language: string;
  };
}

export interface PomodoroSession {
  id: string;
  duration: number;
  type: 'work' | 'short-break' | 'long-break';
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  userId?: string;
  taskId?: string;
  points: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  level: number;
  totalPoints: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
  category: 'tasks' | 'habits' | 'streaks' | 'time' | 'special';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'streak' | 'deadline';
  scheduledFor: Date;
  completed: boolean;
  taskId?: string;
  habitId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'task' | 'habit' | 'pomodoro' | 'external';
  color: string;
  description?: string;
}