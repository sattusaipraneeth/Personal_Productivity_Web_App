import { useState, useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { speak, cancel, speaking } = useSpeechSynthesis();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    speak({ text });
  };

  const parseVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Task creation patterns
    if (lowerText.includes('create task') || lowerText.includes('add task') || lowerText.includes('new task')) {
      const taskTitle = text.replace(/create task|add task|new task/i, '').trim();
      return { type: 'create-task', data: { title: taskTitle } };
    }

    // Habit creation patterns
    if (lowerText.includes('create habit') || lowerText.includes('add habit') || lowerText.includes('new habit')) {
      const habitName = text.replace(/create habit|add habit|new habit/i, '').trim();
      return { type: 'create-habit', data: { name: habitName } };
    }

    // Note creation patterns
    if (lowerText.includes('create note') || lowerText.includes('add note') || lowerText.includes('new note')) {
      const noteContent = text.replace(/create note|add note|new note/i, '').trim();
      return { type: 'create-note', data: { content: noteContent } };
    }

    // Navigation patterns
    if (lowerText.includes('go to') || lowerText.includes('open') || lowerText.includes('show')) {
      if (lowerText.includes('dashboard')) return { type: 'navigate', data: { path: '/' } };
      if (lowerText.includes('tasks')) return { type: 'navigate', data: { path: '/tasks' } };
      if (lowerText.includes('habits')) return { type: 'navigate', data: { path: '/habits' } };
      if (lowerText.includes('notes')) return { type: 'navigate', data: { path: '/notes' } };
      if (lowerText.includes('projects')) return { type: 'navigate', data: { path: '/projects' } };
      if (lowerText.includes('timer')) return { type: 'navigate', data: { path: '/timer' } };
      if (lowerText.includes('analytics')) return { type: 'navigate', data: { path: '/analytics' } };
    }

    // Timer controls
    if (lowerText.includes('start timer') || lowerText.includes('start pomodoro')) {
      return { type: 'start-timer' };
    }
    if (lowerText.includes('stop timer') || lowerText.includes('pause timer')) {
      return { type: 'stop-timer' };
    }

    return { type: 'unknown', data: { text } };
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speakText,
    parseVoiceCommand,
    isSupported: !!recognition,
    isSpeaking: speaking
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}