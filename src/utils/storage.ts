import { Task, Habit, Note, UserSettings } from '../types';

const STORAGE_KEYS = {
  tasks: 'clarity-hub-tasks',
  habits: 'clarity-hub-habits',
  notes: 'clarity-hub-notes',
  settings: 'clarity-hub-settings',
} as const;

// Task storage functions
export const getTasks = (): Task[] => {
  try {
    const tasks = localStorage.getItem(STORAGE_KEYS.tasks);
    return tasks ? JSON.parse(tasks) : [];
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
};

// Habit storage functions
export const getHabits = (): Habit[] => {
  try {
    const habits = localStorage.getItem(STORAGE_KEYS.habits);
    return habits ? JSON.parse(habits) : [];
  } catch {
    return [];
  }
};

export const saveHabits = (habits: Habit[]): void => {
  localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
};

// Note storage functions
export const getNotes = (): Note[] => {
  try {
    const notes = localStorage.getItem(STORAGE_KEYS.notes);
    return notes ? JSON.parse(notes) : [];
  } catch {
    return [];
  }
};

export const saveNotes = (notes: Note[]): void => {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
};

// Settings storage functions
export const getSettings = (): Partial<UserSettings> => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.settings);
    return settings ? JSON.parse(settings) : {};
  } catch {
    return {};
  }
};

export const saveSettings = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
};