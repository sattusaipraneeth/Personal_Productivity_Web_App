import { useState, useEffect } from 'react';
import { Task, Habit, Note, Project } from '../types';

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'habit' | 'note' | 'project';
  data: any;
  timestamp: Date;
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    initializeIndexedDB();
    
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeIndexedDB = () => {
    const request = indexedDB.open('ClarityHubDB', 1);

    request.onerror = () => {
      console.error('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      setDb(database);
      loadPendingActions();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains('tasks')) {
        database.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('habits')) {
        database.createObjectStore('habits', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('notes')) {
        database.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('projects')) {
        database.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('pending-actions')) {
        database.createObjectStore('pending-actions', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('analytics')) {
        database.createObjectStore('analytics', { keyPath: 'date' });
      }
    };
  };

  const loadPendingActions = async () => {
    if (!db) return;

    try {
      const transaction = db.transaction(['pending-actions'], 'readonly');
      const store = transaction.objectStore('pending-actions');
      const request = store.getAll();

      request.onsuccess = () => {
        setPendingActions(request.result);
      };
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  };

  const addPendingAction = async (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    if (!db) return;

    const fullAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    try {
      const transaction = db.transaction(['pending-actions'], 'readwrite');
      const store = transaction.objectStore('pending-actions');
      await store.add(fullAction);
      
      setPendingActions(prev => [...prev, fullAction]);
    } catch (error) {
      console.error('Error adding pending action:', error);
    }
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    console.log('Syncing pending actions:', pendingActions);

    // Register background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-offline-actions');
      } catch (error) {
        console.error('Error registering background sync:', error);
      }
    }

    // Clear pending actions after successful sync
    // This would be implemented based on your sync strategy
    clearPendingActions();
  };

  const clearPendingActions = async () => {
    if (!db) return;

    try {
      const transaction = db.transaction(['pending-actions'], 'readwrite');
      const store = transaction.objectStore('pending-actions');
      await store.clear();
      setPendingActions([]);
    } catch (error) {
      console.error('Error clearing pending actions:', error);
    }
  };

  // Offline CRUD operations
  const saveOfflineTask = async (task: Task) => {
    if (!db) return;

    try {
      const transaction = db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      await store.put(task);

      if (!isOnline) {
        await addPendingAction({
          type: 'create',
          entity: 'task',
          data: task
        });
      }
    } catch (error) {
      console.error('Error saving offline task:', error);
    }
  };

  const saveOfflineHabit = async (habit: Habit) => {
    if (!db) return;

    try {
      const transaction = db.transaction(['habits'], 'readwrite');
      const store = transaction.objectStore('habits');
      await store.put(habit);

      if (!isOnline) {
        await addPendingAction({
          type: 'create',
          entity: 'habit',
          data: habit
        });
      }
    } catch (error) {
      console.error('Error saving offline habit:', error);
    }
  };

  const saveOfflineNote = async (note: Note) => {
    if (!db) return;

    try {
      const transaction = db.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      await store.put(note);

      if (!isOnline) {
        await addPendingAction({
          type: 'create',
          entity: 'note',
          data: note
        });
      }
    } catch (error) {
      console.error('Error saving offline note:', error);
    }
  };

  const saveAnalyticsData = async (date: string, data: any) => {
    if (!db) return;

    try {
      const transaction = db.transaction(['analytics'], 'readwrite');
      const store = transaction.objectStore('analytics');
      await store.put({ date, ...data });
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  };

  const getAnalyticsData = async (startDate: string, endDate: string) => {
    if (!db) return [];

    try {
      const transaction = db.transaction(['analytics'], 'readonly');
      const store = transaction.objectStore('analytics');
      const request = store.getAll();

      return new Promise<any[]>((resolve, reject) => {
        request.onsuccess = () => {
          const allData = request.result;
          const filteredData = allData.filter(item => 
            item.date >= startDate && item.date <= endDate
          );
          resolve(filteredData);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return [];
    }
  };

  return {
    isOnline,
    pendingActions: pendingActions.length,
    saveOfflineTask,
    saveOfflineHabit,
    saveOfflineNote,
    saveAnalyticsData,
    getAnalyticsData,
    syncPendingActions
  };
}