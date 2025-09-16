import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const baseStyles = 'bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl';

  return (
    <div
      className={`${baseStyles} ${className} ${onClick ? 'cursor-pointer hover:transform hover:scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;