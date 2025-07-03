import React, { useState } from 'react';
import { Calendar, Link, Unlink, FolderSync as Sync, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCalendarSync } from '../../hooks/useCalendarSync';
import GlassCard from '../common/GlassCard';

export default function CalendarSync() {
  const { 
    isConnected, 
    events, 
    loading, 
    error, 
    connectToGoogle, 
    disconnectFromGoogle, 
    loadCalendarEvents 
  } = useCalendarSync();

  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await loadCalendarEvents();
    setSyncing(false);
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Google Calendar Sync
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sync your tasks and habits with Google Calendar
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {!isConnected ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={connectToGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Link className="w-5 h-5 mr-2" />
                Connect to Google Calendar
              </>
            )}
          </motion.button>
        ) : (
          <div className="space-y-3">
            <div className="flex space-x-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {syncing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sync className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </button>
              
              <button
                onClick={disconnectFromGoogle}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </button>
            </div>

            {events.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upcoming Events ({events.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center space-x-2 text-sm">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <span className="flex-1 text-gray-700 dark:text-gray-300 truncate">
                        {event.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {event.start.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sync Features
          </h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-blue-500 rounded-full" />
              <span>Tasks with due dates → Calendar events</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-green-500 rounded-full" />
              <span>Habit reminders → Calendar events</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-red-500 rounded-full" />
              <span>Pomodoro sessions → Time blocks</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}