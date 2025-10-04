import React from 'react';
import { CheckCircle, Clock, Eye, ThumbsUp } from 'lucide-react';

interface ProgressStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ComponentType<{ className?: string }>;
}

interface ProposalProgressProps {
  status: string;
  className?: string;
}

const ProposalProgress: React.FC<ProposalProgressProps> = ({
  status,
  className = ''
}) => {
  const getSteps = (currentStatus: string): ProgressStep[] => {
    const baseSteps: ProgressStep[] = [
      { label: 'Submitted', status: 'pending', icon: CheckCircle },
      { label: 'Under Review', status: 'pending', icon: Eye },
      { label: 'Decision', status: 'pending', icon: ThumbsUp }
    ];

    switch (currentStatus.toLowerCase()) {
      case 'pending':
        return baseSteps.map((step, index) =>
          index === 0 ? { ...step, status: 'current' as const } : step
        );
      case 'accepted':
      case 'rejected':
        return baseSteps.map(step => ({ ...step, status: 'completed' as const }));
      default:
        return baseSteps.map((step, index) => {
          if (index === 0) return { ...step, status: 'completed' as const };
          if (index === 1) return { ...step, status: 'current' as const };
          return step;
        });
    }
  };

  const steps = getSteps(status);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => {
        const IconComponent = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  step.status === 'completed'
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.status === 'current'
                    ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                <IconComponent className="h-4 w-4" />
              </div>
              <span
                className={`text-xs mt-1 text-center transition-colors duration-300 ${
                  step.status === 'completed'
                    ? 'text-green-600 font-medium'
                    : step.status === 'current'
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                  steps[index + 1].status === 'completed' || steps[index + 1].status === 'current'
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProposalProgress;