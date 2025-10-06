// Auth slice for Redux
export interface FreelancerData {
  skills: string[];
  hourlyRate?: number;
  availability?: string;
  experience?: string;
  totalEarned: number;
  pendingBalance: number;
  availableBalance: number;
  completedJobs: number;
  rating?: number;
  reviewCount?: number;
  bio?: string;
  portfolio?: string[];
  certifications?: string[];
}

export interface User {
  id: string;
  email: string;
  role: 'freelancer' | 'client' | 'admin';
  isEmailVerified: boolean;
  isActive: boolean;
  fullName: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  freelancerData?: FreelancerData;
  stripeConnectAccountId?: string;
  stripeConnectStatus?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  expiresIn: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  expiresIn: null,
};

// Action types
export const AUTH_ACTIONS = {
  LOGIN_START: 'auth/loginStart',
  LOGIN_SUCCESS: 'auth/loginSuccess',
  LOGIN_FAILURE: 'auth/loginFailure',
  LOGOUT: 'auth/logout',
  REFRESH_TOKEN_START: 'auth/refreshTokenStart',
  REFRESH_TOKEN_SUCCESS: 'auth/refreshTokenSuccess',
  REFRESH_TOKEN_FAILURE: 'auth/refreshTokenFailure',
  UPDATE_PROFILE: 'auth/updateProfile',
  CLEAR_ERROR: 'auth/clearError',
  SET_LOADING: 'auth/setLoading',
  REHYDRATE_AUTH: 'auth/rehydrateAuth',
} as const;

// Action creators
export const authActions = {
  loginStart: () => ({ type: AUTH_ACTIONS.LOGIN_START }),
  loginSuccess: (payload: { user: User; token: string; refreshToken: string; expiresIn: string }) => ({
    type: AUTH_ACTIONS.LOGIN_SUCCESS,
    payload,
  }),
  loginFailure: (error: string) => ({
    type: AUTH_ACTIONS.LOGIN_FAILURE,
    payload: error,
  }),
  logout: () => ({ type: AUTH_ACTIONS.LOGOUT }),
  refreshTokenStart: () => ({ type: AUTH_ACTIONS.REFRESH_TOKEN_START }),
  refreshTokenSuccess: (payload: { token: string; refreshToken: string; expiresIn: string }) => ({
    type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
    payload,
  }),
  refreshTokenFailure: (error: string) => ({
    type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE,
    payload: error,
  }),
  updateProfile: (user: User) => ({
    type: AUTH_ACTIONS.UPDATE_PROFILE,
    payload: user,
  }),
  clearError: () => ({ type: AUTH_ACTIONS.CLEAR_ERROR }),
  setLoading: (isLoading: boolean) => ({
    type: AUTH_ACTIONS.SET_LOADING,
    payload: isLoading,
  }),
  rehydrateAuth: (payload: { token: string; refreshToken: string }) => ({
    type: AUTH_ACTIONS.REHYDRATE_AUTH,
    payload,
  }),
};

// Reducer
const authReducer = (state: AuthState = initialState, action: any): AuthState => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REFRESH_TOKEN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresIn: action.payload.expiresIn,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
      // Update tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        expiresIn: action.payload.expiresIn,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      // Clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      }
      return {
        ...initialState,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.REHYDRATE_AUTH:
      // Restore auth state from stored tokens without user info
      // The user info will be fetched separately if needed
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: !!action.payload.token,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
};

export default authReducer;