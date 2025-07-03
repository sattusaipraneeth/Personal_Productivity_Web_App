import React from 'react';
import { Edit2, Trash2, Pin, Hash, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Note } from '../../types';
import { formatDate } from '../../utils/dates';
import GlassCard from '../common/GlassCard';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  const getPreview = (content: string, maxLength: number = 150) => {
    const plainText = content.replace(/[#*`_\[\]()]/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Work': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'Personal': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'Ideas': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'Learning': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      'Projects': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      'Meeting Notes': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
      'Research': 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300',
      'General': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  return (
    <GlassCard className="p-6 hover:bg-white/15 dark:hover:bg-black/15 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {note.pinned && (
            <Pin className="w-4 h-4 text-yellow-500 fill-current" />
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">
            {note.title}
          </h3>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePin(note.id)}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              note.pinned 
                ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        {note.content ? (
          <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
              {getPreview(note.content)}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-sm italic">
            No content
          </p>
        )}
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
            >
              <Hash className="w-2 h-2 mr-1" />
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
              +{note.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(note.category)}`}>
            {note.category}
          </span>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(note.updatedAt)}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}