'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import ClientOnboardingLayout from '@/components/features/dashboard/client/onboarding/ClientOnboardingLayout';
import Step1ProfileCompany from '@/components/features/dashboard/client/onboarding/Step1ProfileCompany';
import Step2PaymentMethod from '@/components/features/dashboard/client/onboarding/Step2PaymentMethod';
import Step3Preferences from '@/components/features/dashboard/client/onboarding/Step3Preferences';
import CompletionPage from '@/components/features/dashboard/client/onboarding/CompletionPage';
import { clientOnboardingActions } from '@/store/slices/clientOnboarding';
import { RootState } from '@/store';

const ClientOnboardingPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { progress, isInitialized } = useSelector((state: RootState) => state.clientOnboarding);

  // Get current step from URL query parameter
  const step = searchParams.get('step');
  const currentStep = step ? parseInt(step, 10) : (progress?.currentStep || 1);

  // Initialize onboarding on component mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(clientOnboardingActions.initializeStart());

      // Try to load saved progress from localStorage
      const savedProgress = localStorage.getItem('client_onboarding_progress');
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          dispatch(clientOnboardingActions.initializeSuccess(parsed));
          // Navigate to the next incomplete step
          if (!step) {
            const nextStep = Math.max(...parsed.completedSteps, 0) + 1;
            router.replace(`/client/onboarding?step=${Math.min(nextStep, 3)}`);
          }
        } catch (error) {
          console.error('Failed to load saved progress:', error);
          dispatch(clientOnboardingActions.initializeFailure('Failed to load saved progress'));
        }
      } else {
        // Start fresh onboarding
        dispatch(clientOnboardingActions.initializeSuccess({
          currentStep: 1,
          completedSteps: [],
          formData: {},
          lastUpdated: new Date().toISOString(),
        }));
        if (!step) {
          router.replace('/client/onboarding?step=1');
        }
      }
    }
  }, [dispatch, isInitialized, step, router]);

  const handleBack = () => {
    if (currentStep > 1) {
      router.push(`/client/onboarding?step=${currentStep - 1}`);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      router.push(`/client/onboarding?step=${currentStep + 1}`);
    } else {
      // Complete onboarding and redirect to dashboard
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Clear onboarding progress
    dispatch(clientOnboardingActions.resetOnboarding());
    localStorage.removeItem('client_onboarding_progress');

    // Redirect to client dashboard
    router.push('/client/dashboard');
  };

  const handleStepChange = (stepNum: number) => {
    // Allow navigation to completed steps or the next step
    if (stepNum <= currentStep && stepNum >= 1 && stepNum <= 3) {
      router.push(`/client/onboarding?step=${stepNum}`);
    }
  };

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1:
        return 'Profile & Company';
      case 2:
        return 'Payment Method';
      case 3:
        return 'Preferences';
      default:
        return '';
    }
  };

  const renderCurrentStep = () => {
    // Check if onboarding is complete
    if (progress?.completedSteps?.includes(3)) {
      return <CompletionPage onComplete={handleComplete} />;
    }

    switch (currentStep) {
      case 1:
        return <Step1ProfileCompany onNext={handleNext} />;
      case 2:
        return <Step2PaymentMethod onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3Preferences onNext={handleNext} onBack={handleBack} />;
      default:
        return null;
    }
  };

  if (!isInitialized) {
    return (
      <ClientOnboardingLayout
        currentStep={1}
        totalSteps={3}
        stepTitle="Loading..."
        onStepChange={handleStepChange}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ClientOnboardingLayout>
    );
  }

  // Show completion page without layout wrapper
  if (progress?.completedSteps?.includes(3)) {
    return renderCurrentStep();
  }

  return (
    <ClientOnboardingLayout
      currentStep={currentStep}
      totalSteps={3}
      stepTitle={getStepTitle(currentStep)}
      onStepChange={handleStepChange}
    >
      {renderCurrentStep()}
    </ClientOnboardingLayout>
  );
};

export default ClientOnboardingPage;