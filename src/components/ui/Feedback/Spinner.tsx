import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <div className={`inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-[var(--color-secondary)] border-t-[var(--color-accent)] rounded-full animate-spin`}
      />
    </div>
  );
};

export default Spinner;