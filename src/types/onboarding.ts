// Onboarding types
export interface OnboardingFormData {
  // Step 1: Basic Profile
  title: string;
  overview: string;
  availability: 'full-time' | 'part-time' | 'contract' | 'freelance';
  experience: 'beginner' | 'intermediate' | 'expert';
  languages: string[];
  avatar?: string;

  // Step 2: Professional Details
  professionalTitle: string;
  hourlyRate: number;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  availability_old: 'full-time' | 'part-time' | 'project-based';
  languages_old: string[];
  professionalOverview: string;

  // Step 3: Skills
  skills: string[];

  // Step 4: Portfolio
  portfolio: PortfolioItem[];

  // Step 5: Education & Certifications
  education: EducationItem[];
  certifications: CertificationItem[];

  // Step 6: Payment Setup
  stripeConnected: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  images: File[];
  featured: boolean;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate?: string;
  isCurrentlyStudying: boolean;
  description?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  formData: Partial<OnboardingFormData>;
  lastUpdated: string;
}

export interface OnboardingState {
  progress: OnboardingProgress | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}