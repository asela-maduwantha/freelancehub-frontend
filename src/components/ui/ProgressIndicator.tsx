import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      {/* Step Labels */}
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`text-xs font-medium ${
              index + 1 <= currentStep
                ? 'text-green-600'
                : 'text-gray-400'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Step Counter */}
      <div className="text-center">
        <span className="text-sm text-gray-600 font-inter">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
};
