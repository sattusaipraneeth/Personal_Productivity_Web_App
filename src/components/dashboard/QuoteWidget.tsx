import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import GlassCard from '../common/GlassCard';

const motivationalQuotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "Don't wait for opportunity. Create it.",
    author: "Unknown"
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill"
  }
];

export default function QuoteWidget() {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 10000); // Change quote every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const quote = motivationalQuotes[currentQuote];

  return (
    <GlassCard className="p-6 h-full flex flex-col justify-center animate-fade-in">
      <div className="flex items-start space-x-4">
        <Quote className="w-8 h-8 text-accent-green flex-shrink-0 mt-1" />
        <div className="flex-1">
          <blockquote className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
            "{quote.text}"
          </blockquote>
          <cite className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            — {quote.author}
          </cite>
        </div>
      </div>
      
      {/* Quote indicator dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {motivationalQuotes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuote(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentQuote 
                ? 'bg-accent-green' 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
    </GlassCard>
  );
}