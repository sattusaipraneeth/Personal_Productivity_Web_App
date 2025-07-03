import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Target, TrendingUp } from 'lucide-react';
import { Habit } from '../../types';
import { getHabits, saveHabits } from '../../utils/storage';
import { generateId, getTodayString } from '../../utils/dates';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';
import GlassCard from '../common/GlassCard';

export default function HabitManager() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const savedHabits = getHabits();
    setHabits(savedHabits);
  }, []);

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: generateId(),
      createdAt: new Date(),
      streak: 0,
      completedDates: [],
    };
    setHabits(prev => [...prev, newHabit]);
    setShowForm(false);
  };

  const updateHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => {
    if (!editingHabit) return;
    
    setHabits(prev => prev.map(habit => 
      habit.id === editingHabit.id 
        ? { ...habit, ...habitData }
        : habit
    ));
    setEditingHabit(null);
    setShowForm(false);
  };

  const toggleHabit = (id: string) => {
    const today = getTodayString();
    
    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit;
      
      const isCompletedToday = habit.completedDates.includes(today);
      let newCompletedDates: string[];
      let newStreak = habit.streak;
      
      if (isCompletedToday) {
        // Remove today's completion
        newCompletedDates = habit.completedDates.filter(date => date !== today);
        // Recalculate streak
        newStreak = calculateStreak(newCompletedDates);
      } else {
        // Add today's completion
        newCompletedDates = [...habit.completedDates, today].sort();
        // Calculate new streak
        newStreak = calculateStreak(newCompletedDates);
      }
      
      return {
        ...habit,
        completedDates: newCompletedDates,
        streak: newStreak,
      };
    }));
  };

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    const sortedDates = completedDates.sort().reverse();
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (date.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         habit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const today = getTodayString();
    const isCompletedToday = habit.completedDates.includes(today);
    
    let matchesFilter = true;
    if (filterStatus === 'completed') {
      matchesFilter = isCompletedToday;
    } else if (filterStatus === 'pending') {
      matchesFilter = !isCompletedToday;
    }
    
    return matchesSearch && matchesFilter;
  });

  const todayStats = {
    total: habits.length,
    completed: habits.filter(habit => habit.completedDates.includes(getTodayString())).length,
    totalStreak: habits.reduce((sum, habit) => sum + habit.streak, 0),
    avgStreak: habits.length > 0 ? Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Habits</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build consistent habits and track your progress
          </p>
        </div>
        <button
          onClick={() => {
            setEditingHabit(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {todayStats.completed}/{todayStats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Today's Progress
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {todayStats.totalStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Streak Days
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {todayStats.avgStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Average Streak
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round((todayStats.completed / Math.max(todayStats.total, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Completion Rate
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters and Search */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Habits</option>
              <option value="completed">Completed Today</option>
              <option value="pending">Pending Today</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Habit Form Modal */}
      {showForm && (
        <HabitForm
          habit={editingHabit}
          onSubmit={editingHabit ? updateHabit : addHabit}
          onCancel={() => {
            setShowForm(false);
            setEditingHabit(null);
          }}
        />
      )}

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500">
            <Target className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {habits.length === 0 ? 'No habits yet' : 'No habits match your filters'}
            </h3>
            <p className="text-sm">
              {habits.length === 0 
                ? 'Create your first habit to start building consistency!'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={toggleHabit}
              onEdit={handleEditHabit}
              onDelete={deleteHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
}