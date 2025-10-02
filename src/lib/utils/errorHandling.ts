// Error Handling Utilities for Withdrawal and Stripe Operations

import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface ParsedError {
  message: string;
  code?: string;
  statusCode?: number;
  fieldErrors?: Record<string, string>;
  isNetworkError: boolean;
  isAuthError: boolean;
  isValidationError: boolean;
}

/**
 * Parse API error into a user-friendly format
 */
export const parseApiError = (error: unknown): ParsedError => {
  // Default error object
  const defaultError: ParsedError = {
    message: 'An unexpected error occurred. Please try again.',
    isNetworkError: false,
    isAuthError: false,
    isValidationError: false,
  };

  // Handle Axios errors
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Network error (no response)
    if (!axiosError.response) {
      return {
        ...defaultError,
        message: 'Network error. Please check your internet connection and try again.',
        isNetworkError: true,
      };
    }

    const { status, data } = axiosError.response;

    // Authentication errors
    if (status === 401) {
      return {
        message: data?.message || 'Authentication required. Please log in again.',
        statusCode: 401,
        isNetworkError: false,
        isAuthError: true,
        isValidationError: false,
      };
    }

    // Authorization errors
    if (status === 403) {
      return {
        message: data?.message || 'You do not have permission to perform this action.',
        statusCode: 403,
        isNetworkError: false,
        isAuthError: true,
        isValidationError: false,
      };
    }

    // Validation errors
    if (status === 400 || status === 422) {
      const fieldErrors: Record<string, string> = {};

      // Parse field-specific errors if available
      if (data?.errors) {
        Object.entries(data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            fieldErrors[field] = messages.join(', ');
          } else {
            fieldErrors[field] = String(messages);
          }
        });
      }

      return {
        message: data?.message || 'Invalid request. Please check your input.',
        statusCode: status,
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
        isNetworkError: false,
        isAuthError: false,
        isValidationError: true,
      };
    }

    // Not found
    if (status === 404) {
      return {
        message: data?.message || 'The requested resource was not found.',
        statusCode: 404,
        isNetworkError: false,
        isAuthError: false,
        isValidationError: false,
      };
    }

    // Rate limiting
    if (status === 429) {
      return {
        message: data?.message || 'Too many requests. Please wait a moment and try again.',
        statusCode: 429,
        isNetworkError: false,
        isAuthError: false,
        isValidationError: false,
      };
    }

    // Server errors
    if (status >= 500) {
      return {
        message: data?.message || 'Server error. Our team has been notified. Please try again later.',
        statusCode: status,
        isNetworkError: false,
        isAuthError: false,
        isValidationError: false,
      };
    }

    // Other API errors
    return {
      message: data?.message || data?.error || 'An error occurred. Please try again.',
      statusCode: status,
      isNetworkError: false,
      isAuthError: false,
      isValidationError: false,
    };
  }

  // Handle Error instances
  if (error instanceof Error) {
    return {
      ...defaultError,
      message: error.message || defaultError.message,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      ...defaultError,
      message: error,
    };
  }

  return defaultError;
};

/**
 * Withdrawal-specific error messages
 */
export const WITHDRAWAL_ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient balance for this withdrawal',
  ACCOUNT_NOT_SETUP: 'Please complete your Stripe account setup before withdrawing',
  ACCOUNT_RESTRICTED: 'Your payout account is restricted. Please contact support.',
  MINIMUM_NOT_MET: 'Withdrawal amount is below the minimum threshold',
  INVALID_AMOUNT: 'Please enter a valid withdrawal amount',
  INVALID_METHOD: 'Invalid withdrawal method selected',
  PROCESSING_FAILED: 'Failed to process withdrawal. Please try again.',
  STRIPE_ERROR: 'Stripe error occurred. Please contact support.',
  ALREADY_PROCESSING: 'A withdrawal is already being processed',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;

/**
 * Get user-friendly error message for withdrawal operations
 */
export const getWithdrawalErrorMessage = (error: unknown): string => {
  const parsed = parseApiError(error);

  // Map common error codes to user-friendly messages
  if (parsed.message.toLowerCase().includes('insufficient')) {
    return WITHDRAWAL_ERROR_MESSAGES.INSUFFICIENT_BALANCE;
  }

  if (parsed.message.toLowerCase().includes('stripe account') || 
      parsed.message.toLowerCase().includes('account not found')) {
    return WITHDRAWAL_ERROR_MESSAGES.ACCOUNT_NOT_SETUP;
  }

  if (parsed.message.toLowerCase().includes('restricted')) {
    return WITHDRAWAL_ERROR_MESSAGES.ACCOUNT_RESTRICTED;
  }

  if (parsed.message.toLowerCase().includes('minimum')) {
    return WITHDRAWAL_ERROR_MESSAGES.MINIMUM_NOT_MET;
  }

  if (parsed.isNetworkError) {
    return WITHDRAWAL_ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Return original message if no specific match
  return parsed.message;
};

/**
 * Stripe-specific error messages
 */
export const STRIPE_ERROR_MESSAGES = {
  ONBOARDING_FAILED: 'Failed to start Stripe onboarding. Please try again.',
  ACCOUNT_CREATION_FAILED: 'Failed to create Stripe account. Please try again.',
  ACCOUNT_FETCH_FAILED: 'Failed to fetch account status. Please refresh the page.',
  ACCOUNT_DELETE_FAILED: 'Failed to delete Stripe account. Please contact support.',
  ONBOARDING_INCOMPLETE: 'Please complete all required Stripe onboarding steps',
  VERIFICATION_PENDING: 'Your account is under review. This usually takes 1-2 business days.',
  ADDITIONAL_INFO_REQUIRED: 'Additional information is required to activate your account',
} as const;

/**
 * Get user-friendly error message for Stripe operations
 */
export const getStripeErrorMessage = (error: unknown): string => {
  const parsed = parseApiError(error);

  if (parsed.message.toLowerCase().includes('onboard')) {
    return STRIPE_ERROR_MESSAGES.ONBOARDING_FAILED;
  }

  if (parsed.message.toLowerCase().includes('create')) {
    return STRIPE_ERROR_MESSAGES.ACCOUNT_CREATION_FAILED;
  }

  if (parsed.message.toLowerCase().includes('verification') || 
      parsed.message.toLowerCase().includes('review')) {
    return STRIPE_ERROR_MESSAGES.VERIFICATION_PENDING;
  }

  if (parsed.message.toLowerCase().includes('information required')) {
    return STRIPE_ERROR_MESSAGES.ADDITIONAL_INFO_REQUIRED;
  }

  return parsed.message;
};

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export const logError = (
  error: unknown,
  context?: {
    operation?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
): void => {
  const parsed = parseApiError(error);

  console.error('[Error]', {
    ...context,
    error: parsed,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
};

/**
 * Retry logic for failed operations
 */
export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on auth or validation errors
      const parsed = parseApiError(error);
      if (parsed.isAuthError || parsed.isValidationError) {
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with optional exponential backoff
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  const parsed = parseApiError(error);

  // Don't retry auth, validation, or client errors
  if (parsed.isAuthError || parsed.isValidationError) {
    return false;
  }

  // Retry network errors
  if (parsed.isNetworkError) {
    return true;
  }

  // Retry server errors (5xx)
  if (parsed.statusCode && parsed.statusCode >= 500) {
    return true;
  }

  // Retry rate limiting (429)
  if (parsed.statusCode === 429) {
    return true;
  }

  return false;
};
