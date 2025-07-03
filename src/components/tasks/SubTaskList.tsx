import React from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { Task } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SubTaskListProps {
  subtasks: Task[];
  onToggleSubtask: (id: string) => void;
  onDeleteSubtask: (id: string) => void;
  onAddSubtask: (title: string) => void;
}

export default function SubTaskList({ 
  subtasks, 
  onToggleSubtask, 
  onDeleteSubtask, 
  onAddSubtask 
}: SubTaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [showAddForm, setShowAddForm] = React.useState(false);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Subtasks ({subtasks.filter(st => st.completed).length}/{subtasks.length})
        </h4>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddSubtask}
            className="flex space-x-2"
          >
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add subtask..."
              className="flex-1 px-2 py-1 text-sm bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-1">
        <AnimatePresence>
          {subtasks.map((subtask) => (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
            >
              <button
                onClick={() => onToggleSubtask(subtask.id)}
                className={`flex-shrink-0 w-4 h-4 rounded border transition-all duration-200 ${
                  subtask.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                }`}
              >
                {subtask.completed && (
                  <Check className="w-3 h-3 text-white m-0.5" />
                )}
              </button>
              
              <span className={`flex-1 text-sm ${
                subtask.completed 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {subtask.title}
              </span>
              
              <button
                onClick={() => onDeleteSubtask(subtask.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}