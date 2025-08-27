"use client";
import { CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface ProgressBarProps {
  steps: OnboardingStep[];
  currentStep: number;
  className?: string;
}

const ProgressBar = ({ steps, currentStep, className }: ProgressBarProps) => {
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className={clsx('w-full', className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Setup Progress
          </h3>
          <p className="text-sm text-gray-500">
            Step {currentStep} of {steps.length} • {progressPercentage}% complete
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{progressPercentage}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Step Circle */}
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300',
                  {
                    'bg-green-500 border-green-500 text-white': step.completed,
                    'bg-blue-500 border-blue-500 text-white': step.current && !step.completed,
                    'bg-white border-gray-300 text-gray-500': !step.current && !step.completed,
                  }
                )}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center max-w-24">
                <p
                  className={clsx(
                    'text-xs font-medium truncate',
                    {
                      'text-green-600': step.completed,
                      'text-blue-600': step.current && !step.completed,
                      'text-gray-500': !step.current && !step.completed,
                    }
                  )}
                >
                  {step.title}
                </p>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    'absolute top-4 left-8 h-0.5 transition-all duration-300',
                    {
                      'bg-green-500': step.completed,
                      'bg-gray-300': !step.completed,
                    }
                  )}
                  style={{
                    width: `calc(100vw / ${steps.length} - 4rem)`,
                    maxWidth: '120px',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900">
          {steps[currentStep - 1]?.title}
        </h4>
        <p className="text-sm text-blue-700 mt-1">
          {steps[currentStep - 1]?.description}
        </p>
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-4">
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
