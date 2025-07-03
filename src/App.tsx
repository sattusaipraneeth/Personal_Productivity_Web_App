import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { usePWA } from './hooks/usePWA';
import Sidebar from './components/common/Sidebar';
import AuthForm from './components/auth/AuthForm';
import Dashboard from './pages/Dashboard';
import TaskManager from './components/tasks/TaskManager';
import ProjectManager from './components/projects/ProjectManager';
import HabitManager from './components/habits/HabitManager';
import NotesManager from './components/notes/NotesManager';
import AnalyticsManager from './components/analytics/AnalyticsManager';
import TimerManager from './components/timer/TimerManager';
import SettingsManager from './components/settings/SettingsManager';
import AchievementNotification from './components/common/AchievementNotification';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import OfflineIndicator from './components/common/OfflineIndicator';

function AppContent() {
  const { user, loading } = useAuth();
  const { registerServiceWorker, requestNotificationPermission } = usePWA();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    // Initialize PWA features
    registerServiceWorker();
    
    // Request notification permission after user interaction
    const requestPermissions = async () => {
      await requestNotificationPermission();
    };
    
    // Delay permission request to avoid blocking initial load
    setTimeout(requestPermissions, 5000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading Clarity Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
      />
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <Sidebar />
        <main className="ml-64 min-h-screen">
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskManager />} />
              <Route path="/projects" element={<ProjectManager />} />
              <Route path="/habits" element={<HabitManager />} />
              <Route path="/notes" element={<NotesManager />} />
              <Route path="/analytics" element={<AnalyticsManager />} />
              <Route path="/timer" element={<TimerManager />} />
              <Route path="/settings" element={<SettingsManager />} />
            </Routes>
          </div>
        </main>
        
        {/* PWA Components */}
        <AchievementNotification />
        <PWAInstallPrompt />
        <OfflineIndicator />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;