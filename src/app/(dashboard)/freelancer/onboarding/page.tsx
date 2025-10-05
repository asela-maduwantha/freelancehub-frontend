'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import OnboardingLayout from '@/components/features/onboarding/OnboardingLayout';
import ProfileStep from '@/components/features/onboarding/steps/ProfileStep';
import SkillsStep from '@/components/features/onboarding/steps/SkillsStep';
import PortfolioStep from '@/components/features/onboarding/steps/PortfolioStep';
import PaymentStep from '@/components/features/onboarding/steps/PaymentStep';
import { RootState } from '@/types/store';
import { onboardingActions } from '@/store/slices/onboarding';

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { progress, isInitialized } = useSelector((state: RootState) => state.onboarding);

  // Get current step from URL query parameter
  const step = searchParams.get('step');
  const currentStep = step ? parseInt(step, 10) : (progress?.currentStep || 1);

  // Initialize onboarding progress
  useEffect(() => {
    if (!isInitialized) {
      dispatch(onboardingActions.initializeStart());
      // Load from localStorage
      const savedProgress = localStorage.getItem('freelancer_onboarding_progress');
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          dispatch(onboardingActions.initializeSuccess(parsed));
        } catch (error) {
          console.error('Error loading saved progress:', error);
          dispatch(onboardingActions.initializeFailure('Failed to load saved progress'));
        }
      } else {
        // Initialize with default progress
        dispatch(onboardingActions.initializeSuccess({
          currentStep: 1,
          completedSteps: [],
          formData: {},
          lastUpdated: new Date().toISOString(),
        }));
      }
    }
  }, [dispatch, isInitialized]);

  const getStepTitle = (step: number) => {
    const titles = {
      1: 'Complete Your Profile',
      2: 'Skills & Expertise',
      3: 'Portfolio',
      4: 'Payment Setup',
    };
    return titles[step as keyof typeof titles] || 'Onboarding';
  };

  const getStepSubtitle = (step: number) => {
    const subtitles = {
      1: 'Tell us about yourself to help clients find you',
      2: 'Showcase your skills and expertise',
      3: 'Display your best work to attract clients',
      4: 'Set up payments to receive earnings',
    };
    return subtitles[step as keyof typeof subtitles] || '';
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ProfileStep />;
      case 2:
        return <SkillsStep />;
      case 3:
        return <PortfolioStep />;
      case 4:
        return <PaymentStep />;
      default:
        return <ProfileStep />;
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading your onboarding progress...</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={4}
      title={getStepTitle(currentStep)}
      subtitle={getStepSubtitle(currentStep)}
    >
      {renderCurrentStep()}
    </OnboardingLayout>
  );
};

export default OnboardingPage;