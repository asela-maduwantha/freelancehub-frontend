import { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '@/lib/api/payments';
import { getStripeErrorMessage } from '@/lib/stripe';

interface UseSetupIntentReturn {
  createSetupIntent: () => Promise<{ clientSecret: string; setupIntentId: string }>;
  confirmSetupIntent: (clientSecret: string) => Promise<{ success: boolean; paymentMethodId?: string; error?: string }>;
  isProcessing: boolean;
  error: string | null;
  resetError: () => void;
}

export function useSetupIntent(): UseSetupIntentReturn {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = () => setError(null);

  const createSetupIntent = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Call backend API to create a setup intent
      const data = await paymentService.createSetupIntent();

      if (!data.clientSecret) {
        throw new Error('No client secret received from server');
      }

      return {
        clientSecret: data.clientSecret,
        setupIntentId: data.setupIntentId,
      };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to create setup intent';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmSetupIntent = async (clientSecret: string) => {
    if (!stripe || !elements) {
      const errorMsg = 'Stripe has not loaded yet';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement('card');
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm the setup intent
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-methods`,
        },
      });

      if (result.error) {
        const errorMessage = getStripeErrorMessage(result.error);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Type assertion for setupIntent
      const setupIntent = (result as any).setupIntent;
      if (setupIntent?.status === 'succeeded') {
        return {
          success: true,
          paymentMethodId: setupIntent.payment_method,
        };
      } else {
        const errorMsg = 'Setup was not completed successfully';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred during setup confirmation';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    createSetupIntent,
    confirmSetupIntent,
    isProcessing,
    error,
    resetError,
  };
}