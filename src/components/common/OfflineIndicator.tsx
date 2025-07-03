import React from 'react';
import { WifiOff, Wifi, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';

export default function OfflineIndicator() {
  const { isOnline, pendingActions, syncPendingActions } = useOfflineStorage();

  return (
    <AnimatePresence>
      {(!isOnline || pendingActions > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
            isOnline 
              ? 'bg-yellow-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {isOnline ? (
              <>
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {pendingActions} changes pending sync
                </span>
                <button
                  onClick={syncPendingActions}
                  className="ml-2 px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30 transition-colors"
                >
                  Sync Now
                </button>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">
                  You're offline - changes saved locally
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}