import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    primary: 'badge-in-progress',
    secondary: 'badge-pending',
    outline: 'border border-[var(--color-text-secondary)] text-[var(--color-text-body)] bg-[var(--color-bg-content)]',
    success: 'badge-completed',
    warning: 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]',
    error: 'bg-red-100 text-red-800'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;