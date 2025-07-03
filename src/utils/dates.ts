import { format, isToday, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) return 'Today';
  if (isYesterday(dateObj)) return 'Yesterday';
  
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a');
};

export const getWeekDays = (date: Date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start, end });
};

export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};