import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, SortAsc, Mic } from 'lucide-react';
import { Task } from '../../types';
import { getTasks, saveTasks } from '../../utils/storage';
import { generateId } from '../../utils/dates';
import { useGamification } from '../../hooks/useGamification';
import { useNotifications } from '../../hooks/useNotifications';
import { useVoice } from '../../hooks/useVoice';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import GlassCard from '../common/GlassCard';
import VoiceControl from '../common/VoiceControl';

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('order');

  const { addPoints } = useGamification();
  const { scheduleTaskReminder } = useNotifications();

  useEffect(() => {
    const savedTasks = getTasks();
    setTasks(savedTasks);
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const generateRecurringTasks = (task: Task) => {
    if (!task.recurring?.enabled) return [];

    const newTasks: Task[] = [];
    const now = new Date();
    const lastGenerated = task.recurring.lastGenerated ? new Date(task.recurring.lastGenerated) : now;
    
    // Generate tasks for the next 30 days
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    let currentDate = new Date(lastGenerated);

    while (currentDate <= endDate) {
      let shouldGenerate = false;
      let nextDate = new Date(currentDate);

      switch (task.recurring.frequency) {
        case 'daily':
          nextDate.setDate(currentDate.getDate() + task.recurring.interval);
          shouldGenerate = true;
          break;
        case 'weekly':
          if (task.recurring.daysOfWeek?.includes(currentDate.getDay())) {
            shouldGenerate = true;
          }
          nextDate.setDate(currentDate.getDate() + 1);
          break;
        case 'monthly':
          if (currentDate.getDate() === (task.recurring.dayOfMonth || 1)) {
            shouldGenerate = true;
          }
          nextDate.setDate(currentDate.getDate() + 1);
          break;
        case 'yearly':
          if (currentDate.getMonth() === lastGenerated.getMonth() && 
              currentDate.getDate() === lastGenerated.getDate()) {
            shouldGenerate = true;
          }
          nextDate.setDate(currentDate.getDate() + 1);
          break;
      }

      if (shouldGenerate && currentDate > lastGenerated) {
        const newTask: Task = {
          ...task,
          id: generateId(),
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: new Date(currentDate),
          recurring: {
            ...task.recurring,
            lastGenerated: new Date()
          }
        };
        newTasks.push(newTask);
      }

      currentDate = nextDate;
    }

    return newTasks;
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      subtasks: [],
      order: tasks.length,
    };

    let tasksToAdd = [newTask];

    // Generate recurring tasks if enabled
    if (newTask.recurring?.enabled) {
      const recurringTasks = generateRecurringTasks(newTask);
      tasksToAdd = [...tasksToAdd, ...recurringTasks];
    }

    setTasks(prev => [...prev, ...tasksToAdd]);
    setShowForm(false);

    // Schedule reminders
    if (newTask.dueDate) {
      scheduleTaskReminder(newTask.id, newTask.title, newTask.dueDate);
    }
  };

  const updateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTask) return;
    
    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...taskData, updatedAt: new Date() }
        : task
    ));
    setEditingTask(null);
    setShowForm(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const wasCompleted = task.completed;
        const newCompleted = !wasCompleted;
        
        // Award points for completing task
        if (newCompleted && !wasCompleted) {
          addPoints(task.points || 10, 'task-completed');
        }
        
        return { ...task, completed: newCompleted, updatedAt: new Date() };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const reorderTasks = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  const addSubtask = (parentId: string, title: string) => {
    const subtask: Task = {
      id: generateId(),
      title,
      description: '',
      completed: false,
      priority: 'medium',
      category: 'Subtask',
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId,
      subtasks: [],
      order: 0,
      points: 5,
    };

    setTasks(prev => prev.map(task => 
      task.id === parentId 
        ? { 
            ...task, 
            subtasks: [...(task.subtasks || []), subtask],
            updatedAt: new Date()
          }
        : task
    ));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks?.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, completed: !subtask.completed, updatedAt: new Date() }
                : subtask
            ),
            updatedAt: new Date()
          }
        : task
    ));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks?.filter(subtask => subtask.id !== subtaskId),
            updatedAt: new Date()
          }
        : task
    ));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleVoiceCommand = (command: any) => {
    if (command.type === 'create-task' && command.data.title) {
      addTask({
        title: command.data.title,
        description: '',
        completed: false,
        priority: 'medium',
        category: 'General',
        subtasks: [],
        order: tasks.length,
        points: 10,
      });
    }
  };

  const filteredAndSortedTasks = tasks
    .filter(task => !task.parentId) // Only show parent tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'order':
        default:
          return (a.order || 0) - (b.order || 0);
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks and projects efficiently
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>

      {/* Filters and Search */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="order">Custom Order</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created">Created Date</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? updateTask : addTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Task List */}
      <TaskList
        tasks={filteredAndSortedTasks}
        onToggle={toggleTask}
        onEdit={handleEditTask}
        onDelete={deleteTask}
        onReorder={reorderTasks}
        onAddSubtask={addSubtask}
        onToggleSubtask={toggleSubtask}
        onDeleteSubtask={deleteSubtask}
      />

      {/* Voice Control */}
      <VoiceControl onVoiceCommand={handleVoiceCommand} />
    </div>
  );
}