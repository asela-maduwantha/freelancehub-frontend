'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { Button } from '@/components/ui/Button';
import ProgressTracker from '@/components/ui/ProgressTracker';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Import step components (we'll create these next)
import BasicInfoStep from '@/components/onboarding/BasicInfoStep';
import SkillsCategoriesStep from '@/components/onboarding/SkillsCategoriesStep';
import AvailabilityStep from '@/components/onboarding/AvailabilityStep';
import LocationStep from '@/components/onboarding/LocationStep';
import PortfolioStep from '@/components/onboarding/PortfolioStep';
import EducationStep from '@/components/onboarding/EducationStep';
import CertificationsStep from '@/components/onboarding/CertificationsStep';
import LanguagesStep from '@/components/onboarding/LanguagesStep';
import ReviewStep from '@/components/onboarding/ReviewStep';

const stepComponents = {
  0: BasicInfoStep,
  1: SkillsCategoriesStep,
  2: AvailabilityStep,
  3: LocationStep,
  4: PortfolioStep,
  5: EducationStep,
  6: CertificationsStep,
  7: LanguagesStep,
  8: ReviewStep,
};

export default function FreelancerOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    currentStep,
    totalSteps,
    isLoading,
    steps,
    canProceed,
    nextStep,
    previousStep,
    validateCurrentStep,
    submitProfile,
    getProgressPercentage,
    initializeProfile,
    saveDraft,
    isInitialized,
  } = useOnboardingStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Initialize profile when component mounts
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      initializeProfile();
    }
  }, [isAuthenticated, isInitialized, initializeProfile]);

  // Auto-save draft when form data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isInitialized && currentStep > 1) { // Don't save on first step
        saveDraft();
      }
    }, 2000); // Save 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [steps, isInitialized, currentStep, saveDraft]);

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleSubmit = async () => {
    try {
      await submitProfile();
      
      // Clean the stores after successful profile creation
      useOnboardingStore.getState().resetOnboarding();
      useProfileStore.getState().clear();
      
      router.push('/freelancer');
    } catch (error) {
      console.error('Failed to submit profile:', error);
    }
  };

  const getCurrentStepComponent = () => {
    const StepComponent = stepComponents[currentStep as keyof typeof stepComponents];
    return StepComponent ? <StepComponent /> : null;
  };

  const progressSteps = steps.map((step, index) => ({
    ...step,
    status: (
      index < currentStep ? 'completed' : 
      index === currentStep ? 'current' : 
      'upcoming'
    ) as 'completed' | 'current' | 'upcoming',
  }));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Your Freelancer Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Help clients find the perfect freelancer by showcasing your skills and experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Progress Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl sticky top-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {Math.round(getProgressPercentage())}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                
                <ProgressTracker steps={progressSteps} orientation="vertical" />
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl"
              >
                {/* Step Header */}
                <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.h2
                        key={currentStep}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                      >
                        {steps[currentStep].title}
                      </motion.h2>
                      <motion.p
                        key={`${currentStep}-desc`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {steps[currentStep].description}
                      </motion.p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Step {currentStep + 1} of {totalSteps}
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {getCurrentStepComponent()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="p-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="min-w-[120px]"
                    >
                      Previous
                    </Button>

                    {currentStep === totalSteps - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !canProceed()}
                        className="min-w-[120px] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium"
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Submitting...
                          </>
                        ) : (
                          'Complete Profile'
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="min-w-[120px] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium"
                      >
                        Next Step
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
