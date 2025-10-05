import { ClientOnboardingState, ClientOnboardingProgress, ClientOnboardingFormData } from '@/types/clientOnboarding';

const initialState: ClientOnboardingState = {
  progress: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Action types
export const CLIENT_ONBOARDING_ACTIONS = {
  INITIALIZE_START: 'clientOnboarding/initializeStart',
  INITIALIZE_SUCCESS: 'clientOnboarding/initializeSuccess',
  INITIALIZE_FAILURE: 'clientOnboarding/initializeFailure',
  UPDATE_STEP: 'clientOnboarding/updateStep',
  SAVE_PROGRESS_START: 'clientOnboarding/saveProgressStart',
  SAVE_PROGRESS_SUCCESS: 'clientOnboarding/saveProgressSuccess',
  SAVE_PROGRESS_FAILURE: 'clientOnboarding/saveProgressFailure',
  COMPLETE_STEP: 'clientOnboarding/completeStep',
  RESET_ONBOARDING: 'clientOnboarding/resetOnboarding',
  SET_ERROR: 'clientOnboarding/setError',
  CLEAR_ERROR: 'clientOnboarding/clearError',
} as const;

// Action creators
export const clientOnboardingActions = {
  initializeStart: () => ({ type: CLIENT_ONBOARDING_ACTIONS.INITIALIZE_START }),
  initializeSuccess: (progress: ClientOnboardingProgress) => ({
    type: CLIENT_ONBOARDING_ACTIONS.INITIALIZE_SUCCESS,
    payload: progress,
  }),
  initializeFailure: (error: string) => ({
    type: CLIENT_ONBOARDING_ACTIONS.INITIALIZE_FAILURE,
    payload: error,
  }),
  updateStep: (step: number, formData: Partial<ClientOnboardingFormData>) => ({
    type: CLIENT_ONBOARDING_ACTIONS.UPDATE_STEP,
    payload: { step, formData },
  }),
  saveProgressStart: () => ({ type: CLIENT_ONBOARDING_ACTIONS.SAVE_PROGRESS_START }),
  saveProgressSuccess: () => ({ type: CLIENT_ONBOARDING_ACTIONS.SAVE_PROGRESS_SUCCESS }),
  saveProgressFailure: (error: string) => ({
    type: CLIENT_ONBOARDING_ACTIONS.SAVE_PROGRESS_FAILURE,
    payload: error,
  }),
  completeStep: (step: number) => ({
    type: CLIENT_ONBOARDING_ACTIONS.COMPLETE_STEP,
    payload: step,
  }),
  resetOnboarding: () => ({ type: CLIENT_ONBOARDING_ACTIONS.RESET_ONBOARDING }),
  setError: (error: string) => ({
    type: CLIENT_ONBOARDING_ACTIONS.SET_ERROR,
    payload: error,
  }),
  clearError: () => ({ type: CLIENT_ONBOARDING_ACTIONS.CLEAR_ERROR }),
};

// Helper functions
const saveProgressToStorage = (progress: ClientOnboardingProgress) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('client_onboarding_progress', JSON.stringify(progress));
  }
};

const loadProgressFromStorage = (): ClientOnboardingProgress | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('client_onboarding_progress');
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

const clearProgressFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('client_onboarding_progress');
  }
};

// Reducer
const clientOnboardingReducer = (state: ClientOnboardingState = initialState, action: any): ClientOnboardingState => {
  switch (action.type) {
    case CLIENT_ONBOARDING_ACTIONS.INITIALIZE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case CLIENT_ONBOARDING_ACTIONS.INITIALIZE_SUCCESS:
      return {
        ...state,
        progress: action.payload,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    case CLIENT_ONBOARDING_ACTIONS.INITIALIZE_FAILURE:
      return {
        ...state,
        isLoading: false,
        isInitialized: true,
        error: action.payload,
      };

    case CLIENT_ONBOARDING_ACTIONS.UPDATE_STEP:
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

    case CLIENT_ONBOARDING_ACTIONS.SAVE_PROGRESS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case CLIENT_ONBOARDING_ACTIONS.SAVE_PROGRESS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      };

    case CLIENT_ONBOARDING_ACTIONS.SAVE_PROGRESS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case CLIENT_ONBOARDING_ACTIONS.COMPLETE_STEP:
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

    case CLIENT_ONBOARDING_ACTIONS.RESET_ONBOARDING:
      clearProgressFromStorage();
      return {
        ...initialState,
        isInitialized: true,
      };

    case CLIENT_ONBOARDING_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case CLIENT_ONBOARDING_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default clientOnboardingReducer;