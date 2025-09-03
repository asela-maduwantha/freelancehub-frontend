'use client';

import { Check, Circle } from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export default function ProgressTracker({ 
  steps, 
  orientation = 'horizontal',
  className = '' 
}: ProgressTrackerProps) {
  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex">
            {/* Step indicator */}
            <div className="flex flex-col items-center mr-4">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2
                  ${step.status === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step.status === 'current'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}
              >
                {step.status === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`
                    w-0.5 h-8 mt-2
                    ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-8">
              <div 
                className={`
                  text-sm font-medium
                  ${step.status === 'current' ? 'text-green-600' : 'text-gray-900'}
                `}
              >
                {step.title}
              </div>
              {step.description && (
                <div className="text-sm text-gray-500 mt-1">
                  {step.description}
                </div>
              )}
              {step.date && (
                <div className="text-xs text-gray-400 mt-1">
                  {step.date}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {/* Step */}
          <div className="flex flex-col items-center">
            <div 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2
                ${step.status === 'completed' 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : step.status === 'current'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
                }
              `}
            >
              {step.status === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <div 
              className={`
                text-xs font-medium mt-2 text-center max-w-20
                ${step.status === 'current' ? 'text-green-600' : 'text-gray-600'}
              `}
            >
              {step.title}
            </div>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div 
              className={`
                flex-1 h-0.5 mx-4 min-w-12
                ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}
