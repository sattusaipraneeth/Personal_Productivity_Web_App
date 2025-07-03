import { useState, useEffect } from 'react';
import { Notification as AppNotification } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }

    // Load saved notifications
    const saved = localStorage.getItem('clarity-hub-notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }

    // Check for due notifications every minute
    const interval = setInterval(checkDueNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const saveNotifications = (notifs: AppNotification[]) => {
    setNotifications(notifs);
    localStorage.setItem('clarity-hub-notifications', JSON.stringify(notifs));
  };

  const scheduleNotification = (notification: Omit<AppNotification, 'id' | 'completed'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      completed: false
    };

    saveNotifications([...notifications, newNotification]);
    return newNotification.id;
  };

  const cancelNotification = (id: string) => {
    saveNotifications(notifications.filter(n => n.id !== id));
  };

  const checkDueNotifications = () => {
    const now = new Date();
    const dueNotifications = notifications.filter(n => 
      !n.completed && new Date(n.scheduledFor) <= now
    );

    dueNotifications.forEach(notification => {
      showNotification(notification);
      markAsCompleted(notification.id);
    });
  };

  const showNotification = (notification: AppNotification) => {
    if (permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.type === 'deadline'
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.type !== 'deadline') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }

    // Play notification sound if enabled
    const settings = JSON.parse(localStorage.getItem('clarity-hub-settings') || '{}');
    if (settings.notifications?.sound) {
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors if audio can't play
  };

  const markAsCompleted = (id: string) => {
    saveNotifications(notifications.map(n => 
      n.id === id ? { ...n, completed: true } : n
    ));
  };

  const scheduleTaskReminder = (taskId: string, title: string, dueDate: Date) => {
    // Schedule reminder 1 hour before due date
    const reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000);
    
    if (reminderTime > new Date()) {
      scheduleNotification({
        title: 'Task Reminder',
        message: `"${title}" is due in 1 hour`,
        type: 'reminder',
        scheduledFor: reminderTime,
        taskId
      });
    }

    // Schedule deadline notification
    if (dueDate > new Date()) {
      scheduleNotification({
        title: 'Task Deadline',
        message: `"${title}" is due now!`,
        type: 'deadline',
        scheduledFor: dueDate,
        taskId
      });
    }
  };

  const scheduleHabitReminder = (habitId: string, name: string, time: Date) => {
    scheduleNotification({
      title: 'Habit Reminder',
      message: `Time for your "${name}" habit!`,
      type: 'reminder',
      scheduledFor: time,
      habitId
    });
  };

  return {
    notifications,
    permission,
    scheduleNotification,
    cancelNotification,
    scheduleTaskReminder,
    scheduleHabitReminder,
    markAsCompleted
  };
}