import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', onClick, hover = false }: GlassCardProps) {
  return (
    <div
      className={`
        backdrop-blur-sm bg-white/10 dark:bg-black/10 
        border border-white/20 dark:border-gray-700/50
        rounded-xl shadow-lg
        transition-all duration-300
        ${hover ? 'hover:bg-white/15 dark:hover:bg-black/15 hover:scale-105' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}