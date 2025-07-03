import React, { useState, useEffect } from 'react';
import { User, Palette, Bell, Download, Upload, Trash2, Save, Moon, Sun, Calendar, Smartphone } from 'lucide-react';
import { UserSettings } from '../../types';
import { getSettings, saveSettings } from '../../utils/storage';
import { useTheme } from '../../hooks/useTheme';
import { usePWA } from '../../hooks/usePWA';
import GlassCard from '../common/GlassCard';
import CalendarSync from '../calendar/CalendarSync';
import LocalAnalyticsDashboard from '../analytics/LocalAnalyticsDashboard';

export default function SettingsManager() {
  const { theme, toggleTheme } = useTheme();
  const { isInstalled, installApp, requestNotificationPermission, subscribeToPushNotifications } = usePWA();
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    name: 'SaiPraneeth',
    notifications: {
      email: true,
      desktop: true,
      reminders: true,
      sound: true,
    },
    gamification: {
      enabled: true,
      showPoints: true,
      showLevel: true,
      celebrateAchievements: true,
    },
    voice: {
      enabled: true,
      language: 'en-US',
    },
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'data' | 'calendar' | 'analytics' | 'pwa'>('profile');

  useEffect(() => {
    const savedSettings = getSettings();
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...savedSettings }));
    }
  }, []);

  const handleSaveSettings = () => {
    const fullSettings: UserSettings = {
      theme: theme,
      name: settings.name || 'SaiPraneeth',
      dashboardLayout: [],
      notifications: settings.notifications || {
        email: true,
        desktop: true,
        reminders: true,
        sound: true,
      },
      gamification: settings.gamification || {
        enabled: true,
        showPoints: true,
        showLevel: true,
        celebrateAchievements: true,
      },
      voice: settings.voice || {
        enabled: true,
        language: 'en-US',
      },
    };
    saveSettings(fullSettings);
    
    // Show success message
    const button = document.getElementById('save-button');
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Saved!';
      button.classList.add('bg-green-500');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-500');
      }, 2000);
    }
  };

  const exportData = () => {
    const data = {
      tasks: JSON.parse(localStorage.getItem('clarity-hub-tasks') || '[]'),
      habits: JSON.parse(localStorage.getItem('clarity-hub-habits') || '[]'),
      notes: JSON.parse(localStorage.getItem('clarity-hub-notes') || '[]'),
      settings: JSON.parse(localStorage.getItem('clarity-hub-settings') || '{}'),
      pomodoroSessions: JSON.parse(localStorage.getItem('pomodoro-sessions') || '[]'),
      user: JSON.parse(localStorage.getItem('clarity-hub-user') || '{}'),
      notifications: JSON.parse(localStorage.getItem('clarity-hub-notifications') || '[]'),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarity-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.tasks) localStorage.setItem('clarity-hub-tasks', JSON.stringify(data.tasks));
        if (data.habits) localStorage.setItem('clarity-hub-habits', JSON.stringify(data.habits));
        if (data.notes) localStorage.setItem('clarity-hub-notes', JSON.stringify(data.notes));
        if (data.settings) localStorage.setItem('clarity-hub-settings', JSON.stringify(data.settings));
        if (data.pomodoroSessions) localStorage.setItem('pomodoro-sessions', JSON.stringify(data.pomodoroSessions));
        if (data.user) localStorage.setItem('clarity-hub-user', JSON.stringify(data.user));
        if (data.notifications) localStorage.setItem('clarity-hub-notifications', JSON.stringify(data.notifications));
        
        alert('Data imported successfully! Please refresh the page to see changes.');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('clarity-hub-tasks');
      localStorage.removeItem('clarity-hub-habits');
      localStorage.removeItem('clarity-hub-notes');
      localStorage.removeItem('clarity-hub-settings');
      localStorage.removeItem('pomodoro-sessions');
      localStorage.removeItem('pomodoro-settings');
      localStorage.removeItem('clarity-hub-user');
      localStorage.removeItem('clarity-hub-notifications');
      alert('All data cleared successfully! Please refresh the page.');
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await subscribeToPushNotifications();
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          desktop: true,
        }
      }));
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'analytics', name: 'Analytics', icon: Download },
    { id: 'pwa', name: 'App Features', icon: Smartphone },
    { id: 'data', name: 'Data', icon: Download },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize your Clarity Hub experience
          </p>
        </div>
        <button
          id="save-button"
          onClick={handleSaveSettings}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <GlassCard className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </GlassCard>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.name || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {(settings.name || 'SP').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Avatar customization coming soon!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gamification Settings */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Gamification
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Enable gamification</span>
                      <input
                        type="checkbox"
                        checked={settings.gamification?.enabled || false}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          gamification: {
                            ...prev.gamification,
                            enabled: e.target.checked,
                            showPoints: prev.gamification?.showPoints || false,
                            showLevel: prev.gamification?.showLevel || false,
                            celebrateAchievements: prev.gamification?.celebrateAchievements || false,
                          }
                        }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Show points</span>
                      <input
                        type="checkbox"
                        checked={settings.gamification?.showPoints || false}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          gamification: {
                            ...prev.gamification,
                            showPoints: e.target.checked,
                            enabled: prev.gamification?.enabled || false,
                            showLevel: prev.gamification?.showLevel || false,
                            celebrateAchievements: prev.gamification?.celebrateAchievements || false,
                          }
                        }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Celebrate achievements</span>
                      <input
                        type="checkbox"
                        checked={settings.gamification?.celebrateAchievements || false}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          gamification: {
                            ...prev.gamification,
                            celebrateAchievements: e.target.checked,
                            enabled: prev.gamification?.enabled || false,
                            showPoints: prev.gamification?.showPoints || false,
                            showLevel: prev.gamification?.showLevel || false,
                          }
                        }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'appearance' && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Appearance Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Theme
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={toggleTheme}
                      className={`flex items-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Sun className="w-5 h-5 mr-2" />
                      Light Mode
                    </button>
                    
                    <button
                      onClick={toggleTheme}
                      className={`flex items-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Moon className="w-5 h-5 mr-2" />
                      Dark Mode
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'notifications' && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Desktop Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified about task reminders and achievements
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.notifications?.desktop || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleEnableNotifications();
                        } else {
                          setSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              desktop: false,
                              email: prev.notifications?.email || false,
                              reminders: prev.notifications?.reminders || false,
                              sound: prev.notifications?.sound || false,
                            }
                          }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <button
                      onClick={handleEnableNotifications}
                      className="text-sm text-blue-500 hover:text-blue-600"
                    >
                      Enable
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Sound Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Play sounds for notifications
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications?.sound || false}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        sound: e.target.checked,
                        email: prev.notifications?.email || false,
                        desktop: prev.notifications?.desktop || false,
                        reminders: prev.notifications?.reminders || false,
                      }
                    }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Task Reminders</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Remind you about upcoming task deadlines
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications?.reminders || false}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        reminders: e.target.checked,
                        email: prev.notifications?.email || false,
                        desktop: prev.notifications?.desktop || false,
                        sound: prev.notifications?.sound || false,
                      }
                    }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'calendar' && <CalendarSync />}

          {activeTab === 'analytics' && <LocalAnalyticsDashboard />}

          {activeTab === 'pwa' && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">App Features</h2>
              
              <div className="space-y-6">
                {/* PWA Status */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-blue-800 dark:text-blue-300">
                      Progressive Web App
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isInstalled 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {isInstalled ? 'Installed' : 'Not Installed'}
                    </div>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                    Install Clarity Hub as a native app for the best experience
                  </p>
                  {!isInstalled && (
                    <button
                      onClick={installApp}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </button>
                  )}
                </div>

                {/* Voice Control */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">Voice Control</h3>
                    <input
                      type="checkbox"
                      checked={settings.voice?.enabled || false}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        voice: {
                          ...prev.voice,
                          enabled: e.target.checked,
                          language: prev.voice?.language || 'en-US',
                        }
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Use voice commands to create tasks, navigate, and control the app
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Try: "Create task", "Go to dashboard", "Start timer"
                  </div>
                </div>

                {/* Offline Features */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">
                    Offline Support
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                    Your data is automatically saved locally and synced when online
                  </p>
                  <div className="space-y-1 text-xs text-green-600 dark:text-green-400">
                    <div>✓ Offline task management</div>
                    <div>✓ Local data storage</div>
                    <div>✓ Background sync</div>
                    <div>✓ Offline analytics</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {activeTab === 'data' && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Data Management</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Export Data</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                    Download all your tasks, habits, notes, and settings as a JSON file
                  </p>
                  <button
                    onClick={exportData}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">Import Data</h3>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                    Restore your data from a previously exported JSON file
                  </p>
                  <label className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">Clear All Data</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    Permanently delete all your tasks, habits, notes, and settings
                  </p>
                  <button
                    onClick={clearAllData}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium text-gray-800 dark:text-gray-300 mb-2">Storage Usage</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Tasks:</span>
                      <span>{JSON.parse(localStorage.getItem('clarity-hub-tasks') || '[]').length} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Habits:</span>
                      <span>{JSON.parse(localStorage.getItem('clarity-hub-habits') || '[]').length} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notes:</span>
                      <span>{JSON.parse(localStorage.getItem('clarity-hub-notes') || '[]').length} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pomodoro Sessions:</span>
                      <span>{JSON.parse(localStorage.getItem('pomodoro-sessions') || '[]').length} items</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}