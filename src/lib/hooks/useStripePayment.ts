import { useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { paymentService, CreatePaymentIntentRequest, PaymentIntentResponse } from '@/lib/api/payments';
import { getStripeErrorMessage } from '@/lib/stripe';

interface PaymentIntentResult {
  clientSecret: string;
  paymentId: string; // Backend Payment record ID (NOT Stripe PaymentIntent ID)
  stripePaymentIntentId: string; // Stripe PaymentIntent ID
  amount: number;
  currency: string;
  metadata: PaymentIntentResponse['metadata'];
}

interface UseStripePaymentReturn {
  initiatePayment: (data: CreatePaymentIntentRequest) => Promise<PaymentIntentResult>;
  confirmPayment: (clientSecret: string) => Promise<{ success: boolean; error?: string }>;
  isProcessing: boolean;
  error: string | null;
  resetError: () => void;
}

export function useStripePayment(): UseStripePaymentReturn {
  const stripe = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = () => setError(null);

  const initiatePayment = async (data: CreatePaymentIntentRequest) => {
    setIsProcessing(true);
    setError(null);

    // Validate required contractId
    if (!data.contractId) {
      const errorMsg = 'Contract ID is required for payment intent creation';
      setError(errorMsg);
      setIsProcessing(false);
      throw new Error(errorMsg);
    }

    try {
      // Call backend to create payment intent
      // Backend will:
      // 1. Validate contract exists and user is authorized
      // 2. Create/get Stripe customer
      // 3. Create Stripe PaymentIntent
      // 4. Create Payment record in DB with PENDING status
      // 5. Return both Stripe data and Payment record ID
      const response = await paymentService.createPaymentIntent(data);

      if (!response.clientSecret) {
        throw new Error('No client secret received from server');
      }

      if (!response.paymentId) {
        throw new Error('No payment ID received from server');
      }

      // Return complete payment intent data
      return {
        clientSecret: response.clientSecret,
        paymentId: response.paymentId, // Backend DB Payment record ID - use for status tracking
        stripePaymentIntentId: response.id, // Stripe PaymentIntent ID
        amount: response.amount,
        currency: response.currency,
        metadata: response.metadata,
      };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to initiate payment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPayment = async (clientSecret: string) => {
    if (!stripe) {
      const errorMsg = 'Stripe has not loaded yet';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm the payment with Stripe
      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/client/payments/success`,
        },
      });

      if (result.error) {
        const errorMessage = getStripeErrorMessage(result.error);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Type assertion for paymentIntent
      const paymentIntent = (result as any).paymentIntent;
      if (paymentIntent?.status === 'succeeded') {
        return { success: true };
      } else {
        const errorMsg = 'Payment was not completed successfully';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred during payment confirmation';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initiatePayment,
    confirmPayment,
    isProcessing,
    error,
    resetError,
  };
}