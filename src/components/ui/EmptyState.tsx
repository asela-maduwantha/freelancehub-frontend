'use client';

import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'premium';
  };
  className?: string;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto font-inter">
        {description}
      </p>
      {action && (
        <Button 
          variant={action.variant || 'premium'} 
          onClick={action.onClick}
          className="font-poppins"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
