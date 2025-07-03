import React from 'react';
import { Edit2, Trash2, Calendar, BarChart3, Play, Pause, CheckCircle } from 'lucide-react';
import { Project } from '../../types';
import { formatDate } from '../../utils/dates';
import GlassCard from '../common/GlassCard';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}

export default function ProjectCard({ project, onEdit, onDelete, onUpdateProgress }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'completed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'on-hold': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'on-hold': return <Pause className="w-3 h-3" />;
      case 'cancelled': return <Pause className="w-3 h-3" />;
      default: return <BarChart3 className="w-3 h-3" />;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    onUpdateProgress(project.id, newProgress);
  };

  return (
    <GlassCard className="p-6 hover:bg-white/15 dark:hover:bg-black/15 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {project.name}
          </h3>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(project)}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {project.description}
        </p>
      )}

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {getStatusIcon(project.status)}
          <span className="ml-1 capitalize">{project.status.replace('-', ' ')}</span>
        </span>
        
        {project.endDate && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Due {formatDate(new Date(project.endDate))}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {project.progress}%
          </span>
        </div>
        
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: project.color,
              width: `${project.progress}%`
            }}
          />
        </div>

        {/* Progress Slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={project.progress}
          onChange={handleProgressChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${project.color} 0%, ${project.color} ${project.progress}%, #e5e7eb ${project.progress}%, #e5e7eb 100%)`
          }}
        />
      </div>

      {/* Dates */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            <span className="font-medium">Started:</span>
            <span className="ml-1">
              {project.startDate ? formatDate(new Date(project.startDate)) : 'Not set'}
            </span>
          </div>
          <div>
            <span className="font-medium">Created:</span>
            <span className="ml-1">{formatDate(new Date(project.createdAt))}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}