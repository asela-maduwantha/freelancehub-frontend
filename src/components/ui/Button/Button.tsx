import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  type = 'button',
  disabled = false
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';

  const variants = {
    primary: 'btn-primary focus:ring-[var(--color-primary)]/50',
    secondary: 'btn-secondary focus:ring-[var(--color-primary)]/50',
    accent: 'btn-accent focus:ring-[var(--color-accent)]/50',
    outline: 'border-2 border-[var(--color-text-white)] text-[var(--color-text-white)] hover:bg-[var(--color-text-white)] hover:text-[var(--color-primary)] disabled:border-[var(--color-disabled-bg)] disabled:text-[var(--color-disabled-bg)] focus:ring-[var(--color-text-white)]/50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;