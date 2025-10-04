import React, { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  typingUsers: string[];
  currentUserId?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  currentUserId,
}) => {
  const [dots, setDots] = useState('');

  // Filter out current user and get display names
  const otherTypingUsers = typingUsers.filter(userId => userId !== currentUserId);

  useEffect(() => {
    if (otherTypingUsers.length === 0) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [otherTypingUsers.length]);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return 'Someone is typing';
    } else if (otherTypingUsers.length === 2) {
      return 'Two people are typing';
    } else {
      return `${otherTypingUsers.length} people are typing`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 italic">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingText()}{dots}</span>
    </div>
  );
};