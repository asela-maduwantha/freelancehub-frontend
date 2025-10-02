// Common Utility Types for API and State Management

// API State for async operations
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// Paginated Response Wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Generic API Error
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

// Form Validation State (ValidationError already exists in api.ts)
export interface FormState<T> {
  values: T;
  errors: Array<{ field: string; message: string }>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Generic Success Response
export interface SuccessResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Filter and Sort Options
export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// Date Range Selector
export interface DateRange {
  startDate: string;
  endDate: string;
}

// ID Types for better type safety
export type UserId = string;
export type WithdrawalId = string;
export type MilestoneId = string;
export type ContractId = string;
export type JobId = string;
export type StripeAccountId = string;
export type TransactionId = string;

// Generic ID-based lookup
export type EntityMap<T> = Record<string, T>;

// Loading States for UI
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Currency and Money Types
export interface Money {
  amount: number;
  currency: string;
}

export interface MoneyRange {
  min: Money;
  max: Money;
}

// Notification/Toast Types
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Modal State
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

// Table Column Definition
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Generic Action with Payload
export interface Action<T = any> {
  type: string;
  payload?: T;
}

// Async Thunk State
export interface AsyncThunkState {
  pending: boolean;
  fulfilled: boolean;
  rejected: boolean;
  error?: string;
}
