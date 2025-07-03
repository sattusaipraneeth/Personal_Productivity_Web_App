import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../../hooks/usePWA';
import GlassCard from './GlassCard';

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show install prompt after 30 seconds if app is installable and not dismissed
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled && !dismissed) {
        const lastDismissed = localStorage.getItem('pwa-install-dismissed');
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        
        if (!lastDismissed || parseInt(lastDismissed) < oneDayAgo) {
          setShowPrompt(true);
        }
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-50"
      >
        <GlassCard className="p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Download className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Install Clarity Hub
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get the full app experience
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Smartphone className="w-4 h-4" />
              <span>Works offline</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Monitor className="w-4 h-4" />
              <span>Native app experience</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Download className="w-4 h-4" />
              <span>Push notifications</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
            >
              Later
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}