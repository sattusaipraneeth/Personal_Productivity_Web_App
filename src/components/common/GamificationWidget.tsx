import React from 'react';
import { Trophy, Star, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGamification } from '../../hooks/useGamification';
import GlassCard from './GlassCard';

export default function GamificationWidget() {
  const { user, getNextLevelProgress } = useGamification();

  const progress = getNextLevelProgress();
  const pointsToNextLevel = (user.level || 1) * 100 - (user.totalPoints || 0);

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Your Progress
        </h3>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Level {user.level || 1}
          </span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Level Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {pointsToNextLevel} points to next level
          </span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Zap className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {user.totalPoints || 0}
            </span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Total Points
          </span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Target className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {user.achievements?.length || 0}
            </span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Achievements
          </span>
        </div>
      </div>

      {/* Recent Achievement */}
      {user.achievements && user.achievements.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Latest Achievement
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {user.achievements[user.achievements.length - 1].icon}
            </span>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {user.achievements[user.achievements.length - 1].title}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                +{user.achievements[user.achievements.length - 1].points} points
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}