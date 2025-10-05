// Client Onboarding types
export interface ClientOnboardingFormData {
  // Step 1: Profile & Company
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  city: string;
  logo?: File | string;

  companyName: string;
  companySize: string;
  industry: string;
  customIndustry?: string;
  companyWebsite?: string;
  aboutCompany?: string;

  // Step 2: Payment Method
  paymentMethodAdded: boolean;
  paymentMethodId?: string;

  // Step 3: Preferences
  workTypes: string[];
  budgetRange: string;
  hiringFrequency: string;
  contactMethod: string;
  timezone: string;
  emailNotifications: {
    newProposals: boolean;
    messages: boolean;
    milestones: boolean;
    payments: boolean;
    weeklySummary: boolean;
    marketing: boolean;
  };
}

export interface ClientOnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  formData: Partial<ClientOnboardingFormData>;
  lastUpdated: string;
}

export interface ClientOnboardingState {
  progress: ClientOnboardingProgress | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}