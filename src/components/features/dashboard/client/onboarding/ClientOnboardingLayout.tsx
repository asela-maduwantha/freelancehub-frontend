'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface ClientOnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
}

const ClientOnboardingLayout: React.FC<ClientOnboardingLayoutProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  onStepChange,
  children,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    'Profile & Company',
    'Payment Method',
    'Preferences',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Onboarding</h1>
          <p className="text-gray-600">Get started with posting jobs and hiring freelancers</p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Step {currentStep} of {totalSteps}</h2>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              const isClickable = stepNumber <= currentStep;

              return (
                <button
                  key={stepNumber}
                  onClick={() => isClickable && onStepChange(stepNumber)}
                  disabled={!isClickable}
                  className={`flex flex-col items-center space-y-2 ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span
                    className={`text-xs text-center max-w-20 ${
                      isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {title}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Current Step Title */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{stepTitle}</h3>
        </div>

        {/* Step Content */}
        {children}
      </div>
    </div>
  );
};

export default ClientOnboardingLayout;