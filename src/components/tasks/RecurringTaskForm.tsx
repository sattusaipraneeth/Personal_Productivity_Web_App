import React from 'react';
import { RecurringConfig } from '../../types';

interface RecurringTaskFormProps {
  recurring: RecurringConfig;
  onChange: (recurring: RecurringConfig) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export default function RecurringTaskForm({ recurring, onChange }: RecurringTaskFormProps) {
  const updateRecurring = (updates: Partial<RecurringConfig>) => {
    onChange({ ...recurring, ...updates });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="recurring-enabled"
          checked={recurring.enabled}
          onChange={(e) => updateRecurring({ enabled: e.target.checked })}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label htmlFor="recurring-enabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Make this a recurring task
        </label>
      </div>

      {recurring.enabled && (
        <div className="space-y-4 pl-6 border-l-2 border-blue-200 dark:border-blue-800">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <select
              value={recurring.frequency}
              onChange={(e) => updateRecurring({ frequency: e.target.value as any })}
              className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Every {recurring.interval} {recurring.frequency.slice(0, -2)}(s)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={recurring.interval}
              onChange={(e) => updateRecurring({ interval: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Days of week (for weekly) */}
          {recurring.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Days of the week
              </label>
              <div className="flex space-x-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      const currentDays = recurring.daysOfWeek || [];
                      const newDays = currentDays.includes(day.value)
                        ? currentDays.filter(d => d !== day.value)
                        : [...currentDays, day.value];
                      updateRecurring({ daysOfWeek: newDays });
                    }}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      (recurring.daysOfWeek || []).includes(day.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of month (for monthly) */}
          {recurring.frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Day of the month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={recurring.dayOfMonth || 1}
                onChange={(e) => updateRecurring({ dayOfMonth: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* End date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End date (optional)
            </label>
            <input
              type="date"
              value={recurring.endDate ? new Date(recurring.endDate).toISOString().split('T')[0] : ''}
              onChange={(e) => updateRecurring({ 
                endDate: e.target.value ? new Date(e.target.value) : undefined 
              })}
              className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}