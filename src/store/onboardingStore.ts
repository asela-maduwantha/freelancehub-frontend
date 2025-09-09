import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  FreelancerProfileCreationDto, 
  Availability, 
  Location, 
  PortfolioItem, 
  Education, 
  Certification, 
  Language 
} from '@/lib/types/auth';
import type { FreelancerProfileResponse } from '@/lib/types/freelancer';
import { useProfileStore } from '@/store/profileStore';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface OnboardingState {
  // Current step tracking
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  
  // Form data
  formData: Partial<FreelancerProfileCreationDto>;
  
  // Backend integration
  existingProfile: FreelancerProfileResponse | null;
  profileId: string | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isInitialized: boolean;
  
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  markStepCompleted: (stepId: string) => void;
  
  // Backend integration actions
  initializeProfile: () => Promise<void>;
  saveDraft: () => Promise<void>;
  loadExistingProfile: (profile: FreelancerProfileResponse) => void;
  
  
  // Form data actions
  updateFormData: (data: Partial<FreelancerProfileCreationDto>) => void;
  updateBasicInfo: (data: { professionalTitle: string; description: string; experienceLevel: string; hourlyRate: number }) => void;
  updateSkillsAndCategories: (data: { skills: string[]; categories: string[] }) => void;
  updateAvailability: (data: Availability) => void;
  updateLocation: (data: Location) => void;
  updatePortfolio: (data: PortfolioItem[]) => void;
  updateEducation: (data: Education[]) => void;
  updateCertifications: (data: Certification[]) => void;
  updateLanguages: (data: Language[]) => void;
  updatePublicProfileUrl: (url: string) => void;
  
  // State management
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  resetOnboarding: () => void;
  
  // Completion check
  isStepValid: (stepNumber: number) => boolean;
  getCompletionPercentage: () => number;
  
  // Additional methods for main onboarding page
  canProceed: () => boolean;
  validateCurrentStep: () => Promise<boolean>;
  getProgressPercentage: () => number;
  submitProfile: () => Promise<boolean>;
}

const initialSteps: OnboardingStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Tell us about your professional background',
    isCompleted: false,
    isActive: true,
  },
  {
    id: 'skills-categories',
    title: 'Skills & Categories',
    description: 'What services do you offer?',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 'availability',
    title: 'Availability',
    description: 'When are you available to work?',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Where are you based?',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'Showcase your best work',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Your educational background',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 'certifications',
    title: 'Certifications',
    description: 'Professional certifications',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 'languages',
    title: 'Languages',
    description: 'Languages you speak',
    isCompleted: false,
    isActive: false,
  },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 0,
      totalSteps: initialSteps.length,
      steps: initialSteps,
      formData: {
        professionalTitle: '',
        description: '',
        skills: [],
        categories: [],
        experienceLevel: '',
        hourlyRate: 0,
        availability: {
          status: '',
          hoursPerWeek: 0,
          workingHours: {
            timezone: 'UTC',
            schedule: {
              monday: null,
              tuesday: null,
              wednesday: null,
              thursday: null,
              friday: null,
              saturday: null,
              sunday: null,
            },
          },
        },
        location: {
          country: '',
          city: '',
          province: '',
        },
        publicProfileUrl: '',
        portfolio: [],
        education: [],
        certifications: [],
        languages: [],
      },
      existingProfile: null,
      profileId: null,
      isLoading: false,
      isSaving: false,
      isInitialized: false,

      // Step navigation
      setCurrentStep: (step) => {
        set((state) => ({
          currentStep: step,
          steps: state.steps.map((s, index) => ({
            ...s,
            isActive: index === step,
          })),
        }));
      },

      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps - 1) {
          get().setCurrentStep(currentStep + 1);
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          get().setCurrentStep(currentStep - 1);
        }
      },

      markStepCompleted: (stepId) => {
        set((state) => ({
          steps: state.steps.map((step) =>
            step.id === stepId ? { ...step, isCompleted: true } : step
          ),
        }));
      },

      // Form data updates
      updateFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      updateBasicInfo: (data) => {
        get().updateFormData(data);
        get().markStepCompleted('basic-info');
      },

      updateSkillsAndCategories: (data) => {
        get().updateFormData(data);
        get().markStepCompleted('skills-categories');
      },

      updateAvailability: (data) => {
        get().updateFormData({ availability: data });
        get().markStepCompleted('availability');
      },

      updateLocation: (data) => {
        get().updateFormData({ location: data });
        get().markStepCompleted('location');
      },

      updatePortfolio: (data) => {
        get().updateFormData({ portfolio: data });
        get().markStepCompleted('portfolio');
      },

      updateEducation: (data) => {
        get().updateFormData({ education: data });
        get().markStepCompleted('education');
      },

      updateCertifications: (data) => {
        get().updateFormData({ certifications: data });
        get().markStepCompleted('certifications');
      },

      updateLanguages: (data) => {
        get().updateFormData({ languages: data });
        get().markStepCompleted('languages');
      },

      updatePublicProfileUrl: (url) => {
        get().updateFormData({ publicProfileUrl: url });
      },

      // State management
      setLoading: (loading) => set({ isLoading: loading }),
      setSaving: (saving) => set({ isSaving: saving }),

      // Backend integration methods
      initializeProfile: async () => {
        const { setLoading } = get();
        setLoading(true);
        try {
          await useProfileStore.getState().loadMyProfile();
          const profile = useProfileStore.getState().profile;
          if (profile) {
            get().loadExistingProfile(profile);
          }
          set({ isInitialized: true });
        } catch (error) {
          console.error('Failed to initialize profile:', error);
          set({ isInitialized: true });
        } finally {
          setLoading(false);
        }
      },

      saveDraft: async () => {
        const { formData, setSaving } = get();
        setSaving(true);
        try {
          await useProfileStore.getState().saveDraft(formData);
          const newId = useProfileStore.getState().profileId;
          if (newId) set({ profileId: newId });
        } catch (error) {
          console.error('Failed to save draft:', error);
          throw error;
        } finally {
          setSaving(false);
        }
      },

      loadExistingProfile: (profile) => {
        set({
          existingProfile: profile,
          profileId: profile.id,
          formData: {
            professionalTitle: profile.professionalTitle || '',
            description: profile.description || '',
            skills: profile.skills || [],
            categories: profile.categories || [],
            experienceLevel: profile.experienceLevel || '',
            hourlyRate: profile.hourlyRate || 0,
            availability: profile.availability || {
              status: '',
              hoursPerWeek: 0,
              workingHours: {
                timezone: 'UTC',
                schedule: {
                  monday: null,
                  tuesday: null,
                  wednesday: null,
                  thursday: null,
                  friday: null,
                  saturday: null,
                  sunday: null,
                },
              },
            },
            location: profile.location || {
              country: '',
              city: '',
              province: '',
            },
            publicProfileUrl: profile.publicProfileUrl || '',
            portfolio: profile.portfolio || [],
            education: profile.education || [],
            certifications: profile.certifications || [],
            languages: profile.languages || [],
          },
        });
        
        // Mark steps as completed based on existing data
        if (profile.professionalTitle && profile.description) {
          get().markStepCompleted('basic-info');
        }
        if (profile.skills?.length && profile.categories?.length) {
          get().markStepCompleted('skills-categories');
        }
        if (profile.availability?.status) {
          get().markStepCompleted('availability');
        }
        if (profile.location?.country) {
          get().markStepCompleted('location');
        }
        if (profile.portfolio?.length) {
          get().markStepCompleted('portfolio');
        }
        if (profile.education?.length) {
          get().markStepCompleted('education');
        }
        if (profile.certifications?.length) {
          get().markStepCompleted('certifications');
        }
        if (profile.languages?.length) {
          get().markStepCompleted('languages');
        }
      },

      resetOnboarding: () => {
        set({
          currentStep: 0,
          steps: initialSteps,
          formData: {
            professionalTitle: '',
            description: '',
            skills: [],
            categories: [],
            experienceLevel: '',
            hourlyRate: 0,
            availability: {
              status: '',
              hoursPerWeek: 0,
              workingHours: {
                timezone: 'UTC',
                schedule: {
                  monday: null,
                  tuesday: null,
                  wednesday: null,
                  thursday: null,
                  friday: null,
                  saturday: null,
                  sunday: null,
                },
              },
            },
            location: {
              country: '',
              city: '',
              province: '',
            },
            publicProfileUrl: '',
            portfolio: [],
            education: [],
            certifications: [],
            languages: [],
          },
          isLoading: false,
          isSaving: false,
        });
      },

      // Validation
      isStepValid: (stepNumber) => {
        const { formData } = get();
        
        switch (stepNumber) {
          case 0: // Basic Info
            return !!(formData.professionalTitle && formData.description && formData.experienceLevel && formData.hourlyRate);
          case 1: // Skills & Categories
            return !!(formData.skills?.length && formData.categories?.length);
          case 2: // Availability
            return !!(formData.availability?.status && formData.availability?.hoursPerWeek);
          case 3: // Location
            return !!(formData.location?.country && formData.location?.city && formData.location?.province);
          case 4: // Portfolio
            return true; // Optional
          case 5: // Education
            return true; // Optional
          case 6: // Certifications
            return true; // Optional
          case 7: // Languages
            return true; // Optional
          default:
            return false;
        }
      },

      getCompletionPercentage: () => {
        const { steps } = get();
        const completedSteps = steps.filter(step => step.isCompleted).length;
        return Math.round((completedSteps / steps.length) * 100);
      },

      // Additional methods for main onboarding page
      canProceed: () => {
        const { currentStep } = get();
        return get().isStepValid(currentStep);
      },

      validateCurrentStep: async () => {
        const { currentStep } = get();
        return get().isStepValid(currentStep);
      },

      getProgressPercentage: () => {
        const { currentStep, totalSteps } = get();
        return Math.round(((currentStep + 1) / totalSteps) * 100);
      },

      submitProfile: async () => {
        const { formData, setLoading } = get();
        setLoading(true);
        try {
          await useProfileStore.getState().submitProfile(formData as FreelancerProfileCreationDto);
          const prof = useProfileStore.getState().profile;
          if (prof) {
            set({ existingProfile: prof, profileId: prof.id });
            // Mark all steps as completed
            get().steps.forEach((step) => {
              get().markStepCompleted(step.id);
            });
          }
          return true;
        } catch (error) {
          console.error('Failed to submit profile:', error);
          throw error;
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: 'onboarding-store',
      // Only persist form data, not UI state
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
      }),
    }
  )
);
