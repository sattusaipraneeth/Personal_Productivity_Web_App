import { useState, useEffect } from 'react';
import { CalendarEvent, Task, Habit } from '../types';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  description?: string;
  colorId?: string;
}

export function useCalendarSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated with Google
    checkGoogleAuth();
  }, []);

  const checkGoogleAuth = async () => {
    try {
      // Check if Google API is loaded and user is signed in
      if (window.gapi && window.gapi.auth2) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (authInstance && authInstance.isSignedIn.get()) {
          setIsConnected(true);
          await loadCalendarEvents();
        }
      }
    } catch (error) {
      console.error('Error checking Google auth:', error);
    }
  };

  const initializeGoogleAPI = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar'
          }).then(() => {
            resolve();
          }).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const connectToGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      await initializeGoogleAPI();
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsConnected(true);
      await loadCalendarEvents();
    } catch (error) {
      setError('Failed to connect to Google Calendar');
      console.error('Google Calendar connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromGoogle = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setIsConnected(false);
      setEvents([]);
    } catch (error) {
      console.error('Error disconnecting from Google:', error);
    }
  };

  const loadCalendarEvents = async () => {
    if (!isConnected) return;

    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const googleEvents = response.result.items || [];
      const calendarEvents: CalendarEvent[] = googleEvents.map((event: GoogleCalendarEvent) => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        start: new Date(event.start.dateTime || event.start.date || ''),
        end: new Date(event.end.dateTime || event.end.date || ''),
        type: 'external',
        color: getEventColor(event.colorId),
        description: event.description
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      setError('Failed to load calendar events');
    }
  };

  const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (!isConnected) return null;

    try {
      const googleEvent = {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        colorId: getColorId(event.color)
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: googleEvent
      });

      await loadCalendarEvents(); // Refresh events
      return response.result.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  };

  const syncTaskToCalendar = async (task: Task) => {
    if (!task.dueDate || !isConnected) return;

    const event: Omit<CalendarEvent, 'id'> = {
      title: `📋 ${task.title}`,
      start: new Date(task.dueDate),
      end: new Date(new Date(task.dueDate).getTime() + (task.estimatedTime || 30) * 60000),
      type: 'task',
      color: getPriorityColor(task.priority),
      description: `Task: ${task.description || ''}\nPriority: ${task.priority}\nCategory: ${task.category}`
    };

    return await createCalendarEvent(event);
  };

  const syncHabitToCalendar = async (habit: Habit, date: Date) => {
    if (!isConnected) return;

    const event: Omit<CalendarEvent, 'id'> = {
      title: `🎯 ${habit.name}`,
      start: date,
      end: new Date(date.getTime() + 30 * 60000), // 30 minutes default
      type: 'habit',
      color: habit.color,
      description: `Habit: ${habit.description || ''}\nTarget: ${habit.target} times`
    };

    return await createCalendarEvent(event);
  };

  const syncPomodoroToCalendar = async (sessionType: string, startTime: Date, duration: number) => {
    if (!isConnected) return;

    const event: Omit<CalendarEvent, 'id'> = {
      title: `🍅 ${sessionType === 'work' ? 'Focus Session' : 'Break Time'}`,
      start: startTime,
      end: new Date(startTime.getTime() + duration * 60000),
      type: 'pomodoro',
      color: sessionType === 'work' ? '#EF4444' : '#10B981',
      description: `Pomodoro ${sessionType} session`
    };

    return await createCalendarEvent(event);
  };

  return {
    isConnected,
    events,
    loading,
    error,
    connectToGoogle,
    disconnectFromGoogle,
    loadCalendarEvents,
    createCalendarEvent,
    syncTaskToCalendar,
    syncHabitToCalendar,
    syncPomodoroToCalendar
  };
}

function getEventColor(colorId?: string): string {
  const colorMap: { [key: string]: string } = {
    '1': '#3B82F6', // Blue
    '2': '#10B981', // Green
    '3': '#8B5CF6', // Purple
    '4': '#EF4444', // Red
    '5': '#F59E0B', // Yellow
    '6': '#F97316', // Orange
    '7': '#06B6D4', // Cyan
    '8': '#6B7280', // Gray
    '9': '#1F2937', // Dark
    '10': '#10B981', // Emerald
    '11': '#DC2626'  // Rose
  };
  return colorMap[colorId || '1'] || '#3B82F6';
}

function getColorId(color: string): string {
  const colorIdMap: { [key: string]: string } = {
    '#3B82F6': '1',
    '#10B981': '2',
    '#8B5CF6': '3',
    '#EF4444': '4',
    '#F59E0B': '5',
    '#F97316': '6',
    '#06B6D4': '7',
    '#6B7280': '8',
    '#1F2937': '9',
    '#DC2626': '11'
  };
  return colorIdMap[color] || '1';
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return '#EF4444';
    case 'high': return '#F97316';
    case 'medium': return '#3B82F6';
    case 'low': return '#10B981';
    default: return '#6B7280';
  }
}

// Extend Window interface for Google API
declare global {
  interface Window {
    gapi: any;
  }
}