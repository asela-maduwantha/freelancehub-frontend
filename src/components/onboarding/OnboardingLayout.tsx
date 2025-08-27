"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from '@/components/ui/ProgressBar';
import { OnboardingStep } from '@/types';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onStepChange?: (step: number) => void;
}

const OnboardingLayout = ({ 
  currentStep, 
  totalSteps, 
  children, 
  onStepChange 
}: OnboardingLayoutProps) => {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  useEffect(() => {
    const stepDefinitions = [
      { id: '1', title: 'Register', description: 'Create your account' },
      { id: '2', title: 'Verify', description: 'Verify your email' },
      { id: '3', title: 'Welcome', description: 'Get started' },
      { id: '4', title: 'Profile', description: 'Complete your profile' },
      { id: '5', title: 'Portfolio', description: 'Showcase your work' },
      { id: '6', title: 'Security', description: 'Secure your account' },
      { id: '7', title: 'Complete', description: 'You\'re all set!' },
    ];

    const updatedSteps = stepDefinitions.map((step, index) => ({
      ...step,
      completed: index + 1 < currentStep,
      current: index + 1 === currentStep,
    }));

    setSteps(updatedSteps);
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.png" 
                alt="FreelanceHub" 
                className="h-8 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  Freelancer Onboarding
                </h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar 
            steps={steps} 
            currentStep={currentStep}
          />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              © 2025 FreelanceHub. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <a href="/help" className="hover:text-gray-700 transition-colors">
                Need Help?
              </a>
              <a href="/privacy" className="hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingLayout;
