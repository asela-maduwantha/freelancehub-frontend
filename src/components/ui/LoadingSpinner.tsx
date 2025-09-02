'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'blue' | 'gray';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

const colorClasses = {
  green: 'border-green-500',
  blue: 'border-blue-500',
  gray: 'border-gray-500'
};

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'green', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          animate-spin rounded-full border-b-2 border-transparent
          ${sizeClasses[size]} 
          ${colorClasses[color]}
        `}
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 font-inter">
          {text}
        </p>
      )}
    </div>
  );
}
