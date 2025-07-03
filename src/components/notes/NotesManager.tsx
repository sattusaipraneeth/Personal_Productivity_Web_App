import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, BookOpen, Pin, Hash, SortAsc } from 'lucide-react';
import { Note } from '../../types';
import { getNotes, saveNotes } from '../../utils/storage';
import { generateId } from '../../utils/dates';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';
import GlassCard from '../common/GlassCard';

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  useEffect(() => {
    const savedNotes = getNotes();
    setNotes(savedNotes);
  }, []);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
    setShowForm(false);
  };

  const updateNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingNote) return;
    
    setNotes(prev => prev.map(note => 
      note.id === editingNote.id 
        ? { ...note, ...noteData, updatedAt: new Date() }
        : note
    ));
    setEditingNote(null);
    setShowForm(false);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, pinned: !note.pinned, updatedAt: new Date() }
        : note
    ));
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const categories = Array.from(new Set(notes.map(note => note.category)));
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  const filteredAndSortedNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
      const matchesPinned = !showPinnedOnly || note.pinned;
      return matchesSearch && matchesCategory && matchesPinned;
    })
    .sort((a, b) => {
      // Always show pinned notes first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      switch (sortBy) {
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const stats = {
    total: notes.length,
    pinned: notes.filter(note => note.pinned).length,
    categories: categories.length,
    tags: allTags.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Capture your thoughts and ideas with rich formatting
          </p>
        </div>
        <button
          onClick={() => {
            setEditingNote(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Notes
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Pin className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pinned}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Pinned Notes
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Filter className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.categories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Categories
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Hash className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.tags}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Unique Tags
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters and Search */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
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
                <option value="updated">Last Updated</option>
                <option value="created">Date Created</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>

            {/* Pinned Filter */}
            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                showPinnedOnly
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  : 'bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-black/30'
              }`}
            >
              <Pin className="w-4 h-4 mr-1" />
              Pinned Only
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Note Form Modal */}
      {showForm && (
        <NoteForm
          note={editingNote}
          onSubmit={editingNote ? updateNote : addNote}
          onCancel={() => {
            setShowForm(false);
            setEditingNote(null);
          }}
        />
      )}

      {/* Notes Grid */}
      {filteredAndSortedNotes.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {notes.length === 0 ? 'No notes yet' : 'No notes match your filters'}
            </h3>
            <p className="text-sm">
              {notes.length === 0 
                ? 'Create your first note to start capturing your thoughts!'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={deleteNote}
              onTogglePin={togglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
}