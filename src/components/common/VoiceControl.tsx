import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceControlProps {
  onVoiceCommand?: (command: any) => void;
}

export default function VoiceControl({ onVoiceCommand }: VoiceControlProps) {
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    parseVoiceCommand, 
    isSupported,
    speakText 
  } = useVoice();
  
  const [showTranscript, setShowTranscript] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (transcript) {
      setShowTranscript(true);
      const command = parseVoiceCommand(transcript);
      
      // Handle navigation commands
      if (command.type === 'navigate') {
        navigate(command.data.path);
        speakText(`Navigating to ${command.data.path.replace('/', '') || 'dashboard'}`);
      }
      
      // Pass command to parent component
      if (onVoiceCommand) {
        onVoiceCommand(command);
      }

      // Hide transcript after 3 seconds
      setTimeout(() => setShowTranscript(false), 3000);
    }
  }, [transcript, navigate, onVoiceCommand, speakText]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Voice Command
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              "{transcript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? stopListening : startListening}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {isListening && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"
        />
      )}
    </div>
  );
}