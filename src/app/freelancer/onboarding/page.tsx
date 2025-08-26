"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  User,
  Star, 
  Award, 
  Briefcase, 
  Shield, 
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Import enhanced step components
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ProfessionalSkillsStep } from "./steps/ProfessionalSkillsStep";
import { EducationCertificationStep } from "./steps/EducationCertificationStep";
import { PortfolioLinksStep } from "./steps/PortfolioLinksStep";
import { PasskeySetupStep } from "./steps/PasskeySetupStep";
import { ProfileCompletionStep } from "./steps/ProfileCompletionStep";

export interface OnboardingData {
  // Basic Info
  profilePicture?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: string;
  bio: string;
  
  // Professional Skills
  skills: string[];
  hourlyRate: number;
  experience: string;
  title: string;
  
  // Education & Certifications
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    description?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
    credentialUrl?: string;
  }>;
  
  // Portfolio & Links
  portfolioLinks: Array<{
    title: string;
    description: string;
    url: string;
    type: "website" | "github" | "design" | "document" | "other";
  }>;
  githubUrl?: string;
  portfolioWebsite?: string;
  linkedinUrl?: string;
  
  // Optional
  passkeySetup: boolean;
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Basic Information",
    description: "Tell us about yourself",
    icon: User,
    required: true,
  },
  {
    id: 2,
    title: "Professional Skills",
    description: "Your expertise and rates",
    icon: Star,
    required: true,
  },
  {
    id: 3,
    title: "Education & Certifications",
    description: "Your qualifications",
    icon: Award,
    required: false,
  },
  {
    id: 4,
    title: "Portfolio & Links",
    description: "Showcase your work",
    icon: Briefcase,
    required: false,
  },
  {
    id: 5,
    title: "Security Setup",
    description: "Secure your account",
    icon: Shield,
    required: false,
  },
  {
    id: 6,
    title: "Profile Review",
    description: "Complete your profile",
    icon: Sparkles,
    required: true,
  },
];

export default function FreelancerOnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth({ required: true });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    // Basic Info
    profilePicture: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    location: "",
    bio: "",
    
    // Professional Skills
    skills: [],
    hourlyRate: 25,
    experience: "",
    title: "",
    
    // Education & Certifications
    education: [],
    certifications: [],
    
    // Portfolio & Links
    portfolioLinks: [],
    githubUrl: "",
    portfolioWebsite: "",
    linkedinUrl: "",
    
    // Optional
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
    // Skip to the next step
    handleNext();
  };

  const handleDataUpdate = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const handleComplete = () => {
    // Redirect to freelancer dashboard
    router.push("/freelancer/dashboard");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          {/* Step Progress */}
          <div className="flex items-center justify-between mb-6">
            {ONBOARDING_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                      ${isCompleted 
                        ? "bg-green-600 border-green-600 text-white" 
                        : isActive 
                        ? "bg-green-100 border-green-600 text-green-600" 
                        : "bg-white border-gray-300 text-gray-400"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={`
                        w-12 h-0.5 mx-2 transition-all duration-200
                        ${isCompleted ? "bg-green-600" : "bg-gray-300"}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Step Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
              {!ONBOARDING_STEPS[currentStep].required && (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                  Optional
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {ONBOARDING_STEPS[currentStep].title}
            </h1>
            <p className="text-gray-600">
              {ONBOARDING_STEPS[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <BasicInfoStep
                key="basic-info"
                data={{
                  profilePicture: onboardingData.profilePicture,
                  firstName: onboardingData.firstName,
                  lastName: onboardingData.lastName,
                  phoneNumber: onboardingData.phoneNumber,
                  location: onboardingData.location,
                  bio: onboardingData.bio,
                }}
                onUpdate={handleDataUpdate}
                onNext={handleNext}
              />
            )}

            {currentStep === 1 && (
              <ProfessionalSkillsStep
                key="professional-skills"
                data={{
                  skills: onboardingData.skills,
                  hourlyRate: onboardingData.hourlyRate,
                  experience: onboardingData.experience,
                  title: onboardingData.title,
                }}
                onUpdate={handleDataUpdate}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 2 && (
              <EducationCertificationStep
                key="education-certification"
                data={{
                  education: onboardingData.education,
                  certifications: onboardingData.certifications,
                }}
                onUpdate={handleDataUpdate}
                onNext={handleNext}
                onBack={handleBack}
                allowSkip={true}
              />
            )}

            {currentStep === 3 && (
              <PortfolioLinksStep
                key="portfolio-links"
                data={{
                  portfolioLinks: onboardingData.portfolioLinks,
                  githubUrl: onboardingData.githubUrl,
                  portfolioWebsite: onboardingData.portfolioWebsite,
                  linkedinUrl: onboardingData.linkedinUrl,
                }}
                onUpdate={handleDataUpdate}
                onNext={handleNext}
                onBack={handleBack}
                allowSkip={true}
              />
            )}

            {currentStep === 4 && (
              <PasskeySetupStep
                key="passkey-setup"
                onNext={handleNext}
                onBack={handleBack}
                allowSkip={true}
              />
            )}

            {currentStep === 5 && (
              <ProfileCompletionStep
                key="profile-completion"
                data={onboardingData}
                onComplete={handleComplete}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need help? Contact our{" "}
            <a href="/support" className="text-green-600 hover:text-green-700">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
