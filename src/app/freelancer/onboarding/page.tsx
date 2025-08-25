"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  Star, 
  Award, 
  Briefcase, 
  Shield, 
  Sparkles,
  Rocket
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Import step components
import { AlmostThereStep } from "@/components/freelancer/onboarding/AlmostThereStep";
import { SkillsStep } from "@/components/freelancer/onboarding/SkillsStep";
import { CertificatesStep } from "@/components/freelancer/onboarding/CertificatesStep";
import { PortfolioStep } from "@/components/freelancer/onboarding/PortfolioStep";
import { PasskeyStep } from "@/components/freelancer/onboarding/PasskeyStep";
import { CongratulationsStep } from "@/components/freelancer/onboarding/CongratulationsStep";

export interface OnboardingData {
  skills: string[];
  certificates: string[];
  portfolioLinks: string[];
  passkeySetup: boolean;
}

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome!', icon: Sparkles },
  { id: 'skills', title: 'Your Skills', icon: Star },
  { id: 'certificates', title: 'Certificates', icon: Award },
  { id: 'portfolio', title: 'Portfolio', icon: Briefcase },
  { id: 'passkey', title: 'Security', icon: Shield },
  { id: 'complete', title: 'Complete!', icon: Rocket },
];

export default function FreelancerOnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth({ required: true });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    skills: [],
    certificates: [],
    portfolioLinks: [],
    passkeySetup: false,
  });

  // Check if user is freelancer
  useEffect(() => {
    if (user && user.role !== 'freelancer') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const handleComplete = () => {
    // Navigate to dashboard
    router.push('/freelancer/dashboard');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading your journey...</p>
        </div>
      </div>
    );
  }

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 mb-4"
          >
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">FreelanceHub</h1>
          </motion.div>
          
          <motion.h2
            key={currentStepData.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            {currentStepData.title}
          </motion.h2>
        </div>

        {/* Progress Bar */}
        {currentStep > 0 && currentStep < ONBOARDING_STEPS.length - 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {ONBOARDING_STEPS.slice(1, -1).map((step, index) => {
                const isActive = index + 1 === currentStep;
                const isCompleted = index + 1 < currentStep;
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-600 text-white' 
                        : isActive 
                        ? 'bg-green-100 text-green-600 ring-2 ring-green-600' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {index < ONBOARDING_STEPS.length - 3 && (
                      <div className={`h-1 w-16 mx-2 transition-all duration-300 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && (
              <AlmostThereStep 
                user={user}
                onNext={handleNext}
                isLoading={isLoading}
              />
            )}
            
            {currentStep === 1 && (
              <SkillsStep
                skills={onboardingData.skills}
                onSkillsChange={(skills: string[]) => updateOnboardingData({ skills })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
                isLoading={isLoading}
              />
            )}
            
            {currentStep === 2 && (
              <CertificatesStep
                certificates={onboardingData.certificates}
                onCertificatesChange={(certificates: string[]) => updateOnboardingData({ certificates })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
                isLoading={isLoading}
              />
            )}
            
            {currentStep === 3 && (
              <PortfolioStep
                portfolioLinks={onboardingData.portfolioLinks}
                onPortfolioChange={(portfolioLinks: string[]) => updateOnboardingData({ portfolioLinks })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
                isLoading={isLoading}
              />
            )}
            
            {currentStep === 4 && (
              <PasskeyStep
                onPasskeySetup={(setup: boolean) => updateOnboardingData({ passkeySetup: setup })}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            
            {currentStep === 5 && (
              <CongratulationsStep
                onboardingData={onboardingData}
                onComplete={handleComplete}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
