import { User, Job, UserProfile, JobFilters, Notification } from './index';
import { OnboardingState } from './onboarding';

// Redux store types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  modal: {
    isOpen: boolean;
    type: string | null;
    data: any;
  };
  loading: boolean;
}

export interface RootState {
  auth: AuthState;
  jobs: JobsState;
  user: UserState;
  notifications: NotificationsState;
  ui: UIState;
  onboarding: OnboardingState;
}

// Action types
export type AuthAction =
  | { type: 'AUTH_LOGIN_REQUEST' }
  | { type: 'AUTH_LOGIN_SUCCESS'; payload: User }
  | { type: 'AUTH_LOGIN_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_REGISTER_REQUEST' }
  | { type: 'AUTH_REGISTER_SUCCESS'; payload: User }
  | { type: 'AUTH_REGISTER_FAILURE'; payload: string };

export type JobsAction =
  | { type: 'JOBS_FETCH_REQUEST' }
  | { type: 'JOBS_FETCH_SUCCESS'; payload: { jobs: Job[]; pagination: any } }
  | { type: 'JOBS_FETCH_FAILURE'; payload: string }
  | { type: 'JOB_SELECT'; payload: Job }
  | { type: 'JOBS_FILTER_UPDATE'; payload: JobFilters };

export type UserAction =
  | { type: 'USER_PROFILE_REQUEST' }
  | { type: 'USER_PROFILE_SUCCESS'; payload: UserProfile }
  | { type: 'USER_PROFILE_FAILURE'; payload: string }
  | { type: 'USER_PROFILE_UPDATE_REQUEST' }
  | { type: 'USER_PROFILE_UPDATE_SUCCESS'; payload: UserProfile }
  | { type: 'USER_PROFILE_UPDATE_FAILURE'; payload: string };

export type NotificationsAction =
  | { type: 'NOTIFICATIONS_FETCH_REQUEST' }
  | { type: 'NOTIFICATIONS_FETCH_SUCCESS'; payload: Notification[] }
  | { type: 'NOTIFICATIONS_FETCH_FAILURE'; payload: string }
  | { type: 'NOTIFICATION_MARK_READ'; payload: string };

export type UIAction =
  | { type: 'UI_SIDEBAR_TOGGLE' }
  | { type: 'UI_THEME_TOGGLE' }
  | { type: 'UI_MODAL_OPEN'; payload: { type: string; data?: any } }
  | { type: 'UI_MODAL_CLOSE' }
  | { type: 'UI_LOADING_START' }
  | { type: 'UI_LOADING_END' };

export type AppAction =
  | AuthAction
  | JobsAction
  | UserAction
  | NotificationsAction
  | UIAction;