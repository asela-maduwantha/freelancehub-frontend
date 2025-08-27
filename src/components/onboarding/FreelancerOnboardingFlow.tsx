"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingLayout from './OnboardingLayout';
import RegistrationForm from './RegistrationForm';
import EmailVerification from './EmailVerification';
import WelcomeScreen from './WelcomeScreen';
import ProfileCompletion from './ProfileCompletion';
import PortfolioSetup from './PortfolioSetup';
import SecuritySetup from './SecuritySetup';
import OnboardingComplete from './OnboardingComplete';
import { RegisterData, FreelancerProfileUpdateData, PortfolioItem } from '@/types';

interface OnboardingFlowState {
  currentStep: number;
  registrationData?: RegisterData;
  profileData?: FreelancerProfileUpdateData;
  portfolioItems?: PortfolioItem[];
  securityConfig?: {
    passkeySetup: boolean;
    twoFactorEnabled: boolean;
  };
  error?: string;
  loading: boolean;
}

const FreelancerOnboardingFlow = () => {
  const router = useRouter();
  const [state, setState] = useState<OnboardingFlowState>({
    currentStep: 1,
    loading: false
  });

  // Validate that user selected freelancer role
  useEffect(() => {
    const selectedRole = sessionStorage.getItem('selectedRole');
    if (!selectedRole || selectedRole !== 'freelancer') {
      // Redirect to role selection if role not selected or not freelancer
      router.push('/auth/role-selection');
      return;
    }
  }, [router]);

  // Handle errors with toast notifications
  const handleError = (error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
    // In a real app, you'd show this via a toast notification system
    console.error('Onboarding error:', error);
  };

  // Step 1: Registration Success
  const handleRegistrationSuccess = (data: RegisterData) => {
    setState(prev => ({
      ...prev,
      registrationData: data,
      currentStep: 2,
      error: undefined
    }));
  };

  // Step 2: Email Verification Success
  const handleEmailVerificationSuccess = () => {
    setState(prev => ({
      ...prev,
      currentStep: 3,
      error: undefined
    }));
  };

  // Handle resend success for email verification
  const handleResendSuccess = () => {
    // Show success message for resend
    console.log('Verification email resent successfully');
  };

  // Step 3: Welcome Continue
  const handleWelcomeContinue = () => {
    setState(prev => ({
      ...prev,
      currentStep: 4,
      error: undefined
    }));
  };

  // Step 4: Profile Completion Success
  const handleProfileSuccess = (data: FreelancerProfileUpdateData) => {
    setState(prev => ({
      ...prev,
      profileData: data,
      currentStep: 5,
      error: undefined
    }));
  };

  // Step 5: Portfolio Setup Success
  const handlePortfolioSuccess = (portfolioItems: PortfolioItem[]) => {
    setState(prev => ({
      ...prev,
      portfolioItems,
      currentStep: 6,
      error: undefined
    }));
  };

  // Step 5: Portfolio Skip
  const handlePortfolioSkip = () => {
    setState(prev => ({
      ...prev,
      portfolioItems: [],
      currentStep: 6,
      error: undefined
    }));
  };

  // Step 6: Security Setup Success
  const handleSecuritySuccess = (securityConfig: { passkeySetup: boolean; twoFactorEnabled: boolean }) => {
    setState(prev => ({
      ...prev,
      securityConfig,
      currentStep: 7,
      error: undefined
    }));
  };

  // Step 6: Security Skip
  const handleSecuritySkip = () => {
    setState(prev => ({
      ...prev,
      securityConfig: { passkeySetup: false, twoFactorEnabled: false },
      currentStep: 7,
      error: undefined
    }));
  };

  // Step 7: Onboarding Complete
  const handleOnboardingComplete = () => {
    // Navigate to dashboard
    router.push('/freelancer/dashboard');
  };

  // Back navigation handlers
  const handleBackToStep = (step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
      error: undefined
    }));
  };

  // Clear error when user navigates
  useEffect(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, [state.currentStep]);

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <RegistrationForm
            onSuccess={handleRegistrationSuccess}
            onError={handleError}
          />
        );
      
      case 2:
        return (
          <EmailVerification
            email={state.registrationData?.email || ''}
            onSuccess={handleEmailVerificationSuccess}
            onError={handleError}
            onResendSuccess={handleResendSuccess}
          />
        );
      
      case 3:
        return (
          <WelcomeScreen
            userName={state.registrationData?.firstName || 'there'}
            onContinue={handleWelcomeContinue}
          />
        );
      
      case 4:
        return (
          <ProfileCompletion
            onSuccess={handleProfileSuccess}
            onError={handleError}
            onBack={() => handleBackToStep(3)}
          />
        );
      
      case 5:
        return (
          <PortfolioSetup
            onSuccess={handlePortfolioSuccess}
            onError={handleError}
            onBack={() => handleBackToStep(4)}
            onSkip={handlePortfolioSkip}
          />
        );
      
      case 6:
        return (
          <SecuritySetup
            onSuccess={handleSecuritySuccess}
            onError={handleError}
            onBack={() => handleBackToStep(5)}
            onSkip={handleSecuritySkip}
          />
        );
      
      case 7:
        return (
          <OnboardingComplete
            userName={state.registrationData?.firstName || 'there'}
            onContinue={handleOnboardingComplete}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      currentStep={state.currentStep}
      totalSteps={7}
      onStepChange={(step) => setState(prev => ({ ...prev, currentStep: step }))}
    >
      {/* Error Display */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{state.error}</p>
          <button
            onClick={() => setState(prev => ({ ...prev, error: undefined }))}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step Content */}
      {renderCurrentStep()}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
          <strong>Debug Info:</strong>
          <pre>{JSON.stringify({
            step: state.currentStep,
            hasRegistration: !!state.registrationData,
            hasProfile: !!state.profileData,
            portfolioCount: state.portfolioItems?.length || 0,
            hasSecurity: !!state.securityConfig
          }, null, 2)}</pre>
        </div>
      )}
    </OnboardingLayout>
  );
};

export default FreelancerOnboardingFlow;
