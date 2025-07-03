import React from 'react';
import { Edit2, Trash2, Calendar, AlertCircle, Clock, Plus, Star } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Task } from '../../types';
import { formatDate } from '../../utils/dates';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import SubTaskList from './SubTaskList';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (tasks: Task[]) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export default function TaskList({ 
  tasks, 
  onToggle, 
  onEdit, 
  onDelete, 
  onReorder,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask
}: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = React.useState<Set<string>>(new Set());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }  
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const reorderedTasks = items.map((task, index) => ({
      ...task,
      order: index
    }));

    onReorder(reorderedTasks);
  };

  if (tasks.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <div className="text-gray-400 dark:text-gray-500">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-sm">Create a new task to get started with your productivity journey!</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard 
                      className={`p-4 transition-all duration-200 ${
                        snapshot.isDragging 
                          ? 'shadow-2xl scale-105 rotate-2' 
                          : 'hover:bg-white/15 dark:hover:bg-black/15'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing"
                        >
                          <div className="w-2 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex flex-col justify-center space-y-1 px-0.5">
                            <div className="w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                          </div>
                        </div>

                        {/* Checkbox */}
                        <button
                          onClick={() => onToggle(task.id)}
                          className={`flex-shrink-0 w-5 h-5 rounded border-2 mt-1 transition-all duration-200 ${
                            task.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                          }`}
                        >
                          {task.completed && (
                            <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className={`font-medium ${
                                  task.completed 
                                    ? 'text-gray-500 dark:text-gray-400 line-through' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {task.title}
                                </h3>
                                
                                {task.points > 0 && (
                                  <div className="flex items-center space-x-1 text-yellow-500">
                                    <Star className="w-3 h-3" />
                                    <span className="text-xs font-medium">{task.points}</span>
                                  </div>
                                )}

                                {task.recurring?.enabled && (
                                  <div className="text-blue-500" title="Recurring task">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {task.description && (
                                <p className={`text-sm mt-1 ${
                                  task.completed 
                                    ? 'text-gray-400 dark:text-gray-500' 
                                    : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                  {task.description}
                                </p>
                              )}
                              
                              {/* Task metadata */}
                              <div className="flex items-center space-x-4 mt-2 text-xs">
                                {/* Priority */}
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                  <span className={`${getPriorityTextColor(task.priority)} font-medium capitalize`}>
                                    {task.priority}
                                  </span>
                                </div>
                                
                                {/* Estimated time */}
                                {task.estimatedTime && (
                                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.estimatedTime}m</span>
                                  </div>
                                )}
                                
                                {/* Due date */}
                                {task.dueDate && (
                                  <div className={`flex items-center space-x-1 ${
                                    isOverdue(task.dueDate) 
                                      ? 'text-red-600 dark:text-red-400' 
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(new Date(task.dueDate))}</span>
                                    {isOverdue(task.dueDate) && <AlertCircle className="w-3 h-3" />}
                                  </div>
                                )}
                                
                                {/* Category */}
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">
                                  {task.category}
                                </span>

                                {/* Subtasks indicator */}
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <button
                                    onClick={() => toggleExpanded(task.id)}
                                    className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors"
                                  >
                                    <Plus className={`w-3 h-3 transition-transform ${
                                      expandedTasks.has(task.id) ? 'rotate-45' : ''
                                    }`} />
                                    <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => onEdit(task)}
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDelete(task.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Subtasks */}
                          {task.subtasks && task.subtasks.length > 0 && expandedTasks.has(task.id) && (
                            <SubTaskList
                              subtasks={task.subtasks}
                              onToggleSubtask={(subtaskId) => onToggleSubtask(task.id, subtaskId)}
                              onDeleteSubtask={(subtaskId) => onDeleteSubtask(task.id, subtaskId)}
                              onAddSubtask={(title) => onAddSubtask(task.id, title)}
                            />
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}