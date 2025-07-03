import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { Task } from '../../types';

interface TaskSummaryWidgetProps {
  tasks: Task[];
}

export default function TaskSummaryWidget({ tasks }: TaskSummaryWidgetProps) {
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const urgentTasks = tasks.filter(task => task.priority === 'urgent' && !task.completed);
  
  const todayTasks = tasks.filter(task => {
    if (task.dueDate) {
      const taskDate = new Date(task.dueDate).toDateString();
      const today = new Date().toDateString();
      return taskDate === today && !task.completed;
    }
    return false;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <GlassCard className="p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Task Overview
      </h3>
      
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {pendingTasks.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pending
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-green">
              {completedTasks.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completed
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        {todayTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Due Today
            </h4>
            <div className="space-y-2">
              {todayTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center space-x-2 text-sm">
                  <Circle className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-gray-700 dark:text-gray-300 truncate">
                    {task.title}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
              {todayTasks.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                  +{todayTasks.length - 3} more tasks
                </div>
              )}
            </div>
          </div>
        )}

        {/* Urgent Tasks Alert */}
        {urgentTasks.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {urgentTasks.length} urgent task{urgentTasks.length > 1 ? 's' : ''} pending
              </span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}