import { OnboardingState, OnboardingProgress, OnboardingFormData } from '@/types/onboarding';

const initialState: OnboardingState = {
  progress: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Action types
export const ONBOARDING_ACTIONS = {
  INITIALIZE_START: 'onboarding/initializeStart',
  INITIALIZE_SUCCESS: 'onboarding/initializeSuccess',
  INITIALIZE_FAILURE: 'onboarding/initializeFailure',
  UPDATE_STEP: 'onboarding/updateStep',
  SAVE_PROGRESS_START: 'onboarding/saveProgressStart',
  SAVE_PROGRESS_SUCCESS: 'onboarding/saveProgressSuccess',
  SAVE_PROGRESS_FAILURE: 'onboarding/saveProgressFailure',
  COMPLETE_STEP: 'onboarding/completeStep',
  RESET_ONBOARDING: 'onboarding/resetOnboarding',
  SET_ERROR: 'onboarding/setError',
  CLEAR_ERROR: 'onboarding/clearError',
} as const;

// Action creators
export const onboardingActions = {
  initializeStart: () => ({ type: ONBOARDING_ACTIONS.INITIALIZE_START }),
  initializeSuccess: (progress: OnboardingProgress) => ({
    type: ONBOARDING_ACTIONS.INITIALIZE_SUCCESS,
    payload: progress,
  }),
  initializeFailure: (error: string) => ({
    type: ONBOARDING_ACTIONS.INITIALIZE_FAILURE,
    payload: error,
  }),
  updateStep: (step: number, formData: Partial<OnboardingFormData>) => ({
    type: ONBOARDING_ACTIONS.UPDATE_STEP,
    payload: { step, formData },
  }),
  saveProgressStart: () => ({ type: ONBOARDING_ACTIONS.SAVE_PROGRESS_START }),
  saveProgressSuccess: () => ({ type: ONBOARDING_ACTIONS.SAVE_PROGRESS_SUCCESS }),
  saveProgressFailure: (error: string) => ({
    type: ONBOARDING_ACTIONS.SAVE_PROGRESS_FAILURE,
    payload: error,
  }),
  completeStep: (step: number) => ({
    type: ONBOARDING_ACTIONS.COMPLETE_STEP,
    payload: step,
  }),
  resetOnboarding: () => ({ type: ONBOARDING_ACTIONS.RESET_ONBOARDING }),
  setError: (error: string) => ({
    type: ONBOARDING_ACTIONS.SET_ERROR,
    payload: error,
  }),
  clearError: () => ({ type: ONBOARDING_ACTIONS.CLEAR_ERROR }),
};

// Helper functions
const saveProgressToStorage = (progress: OnboardingProgress) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('freelancer_onboarding_progress', JSON.stringify(progress));
  }
};

const loadProgressFromStorage = (): OnboardingProgress | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('freelancer_onboarding_progress');
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

const clearProgressFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('freelancer_onboarding_progress');
  }
};

// Reducer
const onboardingReducer = (state: OnboardingState = initialState, action: any): OnboardingState => {
  switch (action.type) {
    case ONBOARDING_ACTIONS.INITIALIZE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case ONBOARDING_ACTIONS.INITIALIZE_SUCCESS:
      return {
        ...state,
        progress: action.payload,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    case ONBOARDING_ACTIONS.INITIALIZE_FAILURE:
      return {
        ...state,
        isLoading: false,
        isInitialized: true,
        error: action.payload,
      };

    case ONBOARDING_ACTIONS.UPDATE_STEP:
      const updatedProgress = state.progress ? {
        ...state.progress,
        currentStep: action.payload.step,
        formData: {
          ...state.progress.formData,
          ...action.payload.formData,
        },
        lastUpdated: new Date().toISOString(),
      } : {
        currentStep: action.payload.step,
        completedSteps: [],
        formData: action.payload.formData,
        lastUpdated: new Date().toISOString(),
      };

      // Save to localStorage
      saveProgressToStorage(updatedProgress);

      return {
        ...state,
        progress: updatedProgress,
      };

    case ONBOARDING_ACTIONS.SAVE_PROGRESS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case ONBOARDING_ACTIONS.SAVE_PROGRESS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      };

    case ONBOARDING_ACTIONS.SAVE_PROGRESS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case ONBOARDING_ACTIONS.COMPLETE_STEP:
      if (!state.progress) return state;

      const completedSteps = [...state.progress.completedSteps];
      if (!completedSteps.includes(action.payload)) {
        completedSteps.push(action.payload);
      }

      const completedProgress = {
        ...state.progress,
        completedSteps,
        lastUpdated: new Date().toISOString(),
      };

      // Save to localStorage
      saveProgressToStorage(completedProgress);

      return {
        ...state,
        progress: completedProgress,
      };

    case ONBOARDING_ACTIONS.RESET_ONBOARDING:
      clearProgressFromStorage();
      return {
        ...initialState,
        isInitialized: true,
      };

    case ONBOARDING_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case ONBOARDING_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default onboardingReducer;