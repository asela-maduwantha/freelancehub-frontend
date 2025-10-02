import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'flat' | 'interactive';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick
}) => {
  const variantClasses = {
    default: 'card-default',
    elevated: 'card-elevated',
    flat: 'card-flat',
    interactive: 'card-interactive'
  };

  const cardClass = variant === 'interactive' && onClick
    ? variantClasses.interactive
    : variantClasses[variant];

  return (
    <div
      className={`${cardClass} ${className} ${onClick && variant !== 'interactive' ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;