import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
// This should be your Stripe publishable key (pk_test_... or pk_live_...)
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = stripePublishableKey 
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

// Stripe configuration
export const STRIPE_CONFIG = {
  // Stripe API version
  apiVersion: '2023-10-16' as const,

  // Appearance configuration for Stripe Elements
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb', // Blue-600
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      spacingUnit: '2px',
      borderRadius: '6px',
    },
    rules: {
      '.Input': {
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      '.Input:focus': {
        borderColor: '#2563eb',
        boxShadow: '0 0 0 1px #2563eb',
      },
    },
  },

  // Element options
  elementsOptions: {
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css?family=Inter:400,500,600',
      },
    ],
  },
};

// Card element options
export const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#30313d',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#df1b41',
      iconColor: '#df1b41',
    },
  },
  hidePostalCode: false,
};

// Helper function to get Stripe instance
export const getStripe = () => {
  return stripePromise;
};

// Helper function to check if Stripe is loaded
export const isStripeLoaded = async (): Promise<boolean> => {
  try {
    const stripe = await stripePromise;
    return !!stripe;
  } catch {
    return false;
  }
};

// Error messages for common Stripe errors
export const STRIPE_ERROR_MESSAGES = {
  card_declined: 'Your card was declined. Please try a different card.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: 'The security code is incorrect. Please check and try again.',
  processing_error: 'An error occurred while processing your card. Please try again.',
  incorrect_number: 'The card number is incorrect. Please check and try again.',
  invalid_expiry_year: 'The expiration year is invalid.',
  invalid_expiry_month: 'The expiration month is invalid.',
  invalid_cvc: 'The security code is invalid.',
  card_not_supported: 'This card is not supported. Please use a different card.',
  call_issuer: 'Please contact your card issuer for more information.',
  generic_decline: 'Your card was declined. Please contact your card issuer.',
  insufficient_funds: 'Insufficient funds. Please use a different payment method.',
  lost_card: 'This card has been reported lost. Please contact your card issuer.',
  stolen_card: 'This card has been reported stolen. Please contact your card issuer.',
  default: 'An unexpected error occurred. Please try again.',
};

// Backend-specific error messages
export const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  'Contract ID is required': 'Please select a contract before making payment.',
  'Contract ID is required for payment intent creation': 'Please select a contract before making payment.',
  'Contract not found': 'Contract not found. Please refresh and try again.',
  'Only the contract client can create payment intents': 'You are not authorized to make this payment.',
  'Payment amount must be positive': 'Invalid payment amount.',
  'Invalid payment amount': 'Payment amount must be greater than zero.',
  'Payment not found': 'Payment record not found.',
  'Payment has already been processed': 'This payment has already been completed.',
  'Payment cannot be completed in its current state': 'Cannot complete payment at this time.',
  'Contract must be active to create payments': 'Cannot create payment for inactive contract.',
  'Failed to create Stripe customer': 'Failed to set up payment account. Please try again.',
  'Failed to create payment intent': 'Failed to initialize payment. Please try again.',
  'Stripe payment intent not found': 'Payment session not found. Please try again.',
  'User not found': 'User account not found.',
  'Unauthorized': 'You do not have permission to perform this action.',
};

// Helper function to get user-friendly error message
export const getStripeErrorMessage = (error: any): string => {
  if (!error) return STRIPE_ERROR_MESSAGES.default;

  // Handle Stripe error format
  if (error.type === 'card_error') {
    return STRIPE_ERROR_MESSAGES[error.code as keyof typeof STRIPE_ERROR_MESSAGES] ||
           error.message ||
           STRIPE_ERROR_MESSAGES.default;
  }

  // Handle API errors
  if (error.message) {
    return error.message;
  }

  return STRIPE_ERROR_MESSAGES.default;
};

// Helper function to get user-friendly error message including backend errors
export const getPaymentErrorMessage = (error: any): string => {
  if (!error) return STRIPE_ERROR_MESSAGES.default;

  // First, check if it's a backend error message we recognize
  const errorMessage = error?.response?.data?.message || error.message || '';
  
  // Try to find exact match in backend error messages
  if (BACKEND_ERROR_MESSAGES[errorMessage]) {
    return BACKEND_ERROR_MESSAGES[errorMessage];
  }

  // Try to find partial match in backend error messages
  const backendErrorKey = Object.keys(BACKEND_ERROR_MESSAGES).find(key =>
    errorMessage.includes(key)
  );
  if (backendErrorKey) {
    return BACKEND_ERROR_MESSAGES[backendErrorKey];
  }

  // Handle Stripe errors
  if (error.type === 'card_error') {
    return STRIPE_ERROR_MESSAGES[error.code as keyof typeof STRIPE_ERROR_MESSAGES] ||
           error.message ||
           STRIPE_ERROR_MESSAGES.default;
  }

  // Return the original message if it's user-friendly, otherwise use default
  if (errorMessage && errorMessage.length < 100) {
    return errorMessage;
  }

  return STRIPE_ERROR_MESSAGES.default;
};