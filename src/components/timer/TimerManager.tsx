import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Clock, Coffee, Target } from 'lucide-react';
import { PomodoroSession } from '../../types';
import { generateId } from '../../utils/dates';
import GlassCard from '../common/GlassCard';

interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

export default function TimerManager() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setTimeLeft(parsed.workDuration * 60);
    }

    const savedSessions = localStorage.getItem('pomodoro-sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    // Create session record
    const session: PomodoroSession = {
      id: generateId(),
      duration: getCurrentDuration() * 60,
      type: currentSession,
      startTime: new Date(Date.now() - getCurrentDuration() * 60 * 1000),
      endTime: new Date(),
      completed: true,
    };
    
    setSessions(prev => [session, ...prev]);

    // Play notification sound (if supported)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${currentSession === 'work' ? 'Work' : 'Break'} session completed!`, {
        body: 'Time for the next session.',
        icon: '/favicon.ico'
      });
    }

    // Auto-start next session
    if (currentSession === 'work') {
      setCompletedSessions(prev => prev + 1);
      const nextSession = (completedSessions + 1) % settings.sessionsUntilLongBreak === 0 
        ? 'long-break' 
        : 'short-break';
      startSession(nextSession);
    } else {
      startSession('work');
    }
  };

  const getCurrentDuration = () => {
    switch (currentSession) {
      case 'work': return settings.workDuration;
      case 'short-break': return settings.shortBreakDuration;
      case 'long-break': return settings.longBreakDuration;
    }
  };

  const startSession = (type: 'work' | 'short-break' | 'long-break') => {
    setCurrentSession(type);
    const duration = type === 'work' 
      ? settings.workDuration 
      : type === 'short-break' 
      ? settings.shortBreakDuration 
      : settings.longBreakDuration;
    setTimeLeft(duration * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getCurrentDuration() * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'work': return <Target className="w-8 h-8" />;
      case 'short-break': return <Coffee className="w-8 h-8" />;
      case 'long-break': return <Coffee className="w-8 h-8" />;
    }
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work': return 'text-red-500';
      case 'short-break': return 'text-green-500';
      case 'long-break': return 'text-blue-500';
    }
  };

  const getSessionBg = () => {
    switch (currentSession) {
      case 'work': return 'from-red-500 to-orange-500';
      case 'short-break': return 'from-green-500 to-teal-500';
      case 'long-break': return 'from-blue-500 to-purple-500';
    }
  };

  const progress = ((getCurrentDuration() * 60 - timeLeft) / (getCurrentDuration() * 60)) * 100;

  const todaySessions = sessions.filter(session => {
    const today = new Date().toDateString();
    return new Date(session.startTime).toDateString() === today;
  });

  const todayWorkSessions = todaySessions.filter(s => s.type === 'work').length;
  const todayTotalTime = todaySessions.reduce((total, session) => total + session.duration, 0);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pomodoro Timer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Focus with the Pomodoro Technique
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Target className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {todayWorkSessions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Work Sessions Today
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(todayTotalTime / 60)}m
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Focus Time
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Coffee className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedSessions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sessions Completed
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8 text-center">
            {/* Session Type */}
            <div className={`flex items-center justify-center space-x-2 mb-6 ${getSessionColor()}`}>
              {getSessionIcon()}
              <h2 className="text-2xl font-bold capitalize">
                {currentSession.replace('-', ' ')} Session
              </h2>
            </div>

            {/* Timer Display */}
            <div className="relative mb-8">
              <div className="w-64 h-64 mx-auto relative">
                {/* Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-in-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" className={`stop-color-red-500 ${currentSession === 'work' ? '' : 'stop-color-green-500'}`} />
                      <stop offset="100%" className={`stop-color-orange-500 ${currentSession === 'work' ? '' : 'stop-color-blue-500'}`} />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Time Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(progress)}% Complete
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={toggleTimer}
                className={`flex items-center px-8 py-3 bg-gradient-to-r ${getSessionBg()} text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </button>
              
              <button
                onClick={resetTimer}
                className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </button>
            </div>

            {/* Session Selector */}
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={() => startSession('work')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentSession === 'work'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Work
              </button>
              <button
                onClick={() => startSession('short-break')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentSession === 'short-break'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Short Break
              </button>
              <button
                onClick={() => startSession('long-break')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentSession === 'long-break'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Long Break
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Settings & History */}
        <div className="space-y-6">
          {/* Settings Panel */}
          {showSettings && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Timer Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workDuration}
                    onChange={(e) => {
                      const newSettings = { ...settings, workDuration: parseInt(e.target.value) || 25 };
                      setSettings(newSettings);
                      localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
                      if (currentSession === 'work' && !isRunning) {
                        setTimeLeft(newSettings.workDuration * 60);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreakDuration}
                    onChange={(e) => {
                      const newSettings = { ...settings, shortBreakDuration: parseInt(e.target.value) || 5 };
                      setSettings(newSettings);
                      localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
                    }}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreakDuration}
                    onChange={(e) => {
                      const newSettings = { ...settings, longBreakDuration: parseInt(e.target.value) || 15 };
                      setSettings(newSettings);
                      localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
                    }}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sessions until Long Break
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={settings.sessionsUntilLongBreak}
                    onChange={(e) => {
                      const newSettings = { ...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4 };
                      setSettings(newSettings);
                      localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
                    }}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {/* Recent Sessions */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Sessions
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded ${
                      session.type === 'work' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>
                      {session.type === 'work' ? <Target className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {session.type.replace('-', ' ')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(session.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(session.duration / 60)}m
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">No sessions yet</p>
                  <p className="text-xs">Start your first Pomodoro!</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}