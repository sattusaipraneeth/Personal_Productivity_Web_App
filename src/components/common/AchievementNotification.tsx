import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, X } from 'lucide-react';
import { Achievement } from '../../types';

export default function AchievementNotification() {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleAchievement = (event: CustomEvent<Achievement>) => {
      setAchievement(event.detail);
      setShowConfetti(true);
      
      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Hide notification after 5 seconds
      setTimeout(() => setAchievement(null), 5000);
    };

    window.addEventListener('achievement-unlocked', handleAchievement as EventListener);
    
    return () => {
      window.removeEventListener('achievement-unlocked', handleAchievement as EventListener);
    };
  }, []);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      <AnimatePresence>
        {achievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed top-6 right-6 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl shadow-2xl max-w-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                  </div>
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm opacity-90">{achievement.description}</p>
                  <div className="mt-2 text-sm font-medium">
                    +{achievement.points} points
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAchievement(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}