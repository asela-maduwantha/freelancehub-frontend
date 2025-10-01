import { useState, useEffect, useCallback } from 'react';
import { paymentService, PaymentResponse } from '@/lib/api/payments';

interface UsePaymentVerificationOptions {
  paymentId: string | null;
  enabled?: boolean;
  pollInterval?: number; // milliseconds
  maxAttempts?: number;
}

interface UsePaymentVerificationReturn {
  payment: PaymentResponse | null;
  isVerifying: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to verify and poll payment status after Stripe confirmation
 * The backend webhook may take a few seconds to process the payment
 * This hook polls the backend until the payment is marked as completed
 */
export function usePaymentVerification({
  paymentId,
  enabled = true,
  pollInterval = 2000,
  maxAttempts = 30, // 30 attempts * 2 seconds = 60 seconds max
}: UsePaymentVerificationOptions): UsePaymentVerificationReturn {
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const fetchPaymentStatus = useCallback(async () => {
    if (!paymentId) return;

    try {
      setIsVerifying(true);
      setError(null);

      const paymentData = await paymentService.getPaymentById(paymentId);
      setPayment(paymentData);

      // Stop polling if payment is completed or failed
      if (
        paymentData.status === 'completed' ||
        paymentData.status === 'failed' ||
        paymentData.status === 'refunded'
      ) {
        setIsVerifying(false);
        return true; // Signal to stop polling
      }

      return false; // Continue polling
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to verify payment status';
      setError(errorMessage);
      setIsVerifying(false);
      return true; // Stop polling on error
    }
  }, [paymentId]);

  const refetch = useCallback(async () => {
    await fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  useEffect(() => {
    if (!paymentId || !enabled) {
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let shouldStop = false;

    const startPolling = async () => {
      // Initial fetch
      const shouldStopPolling = await fetchPaymentStatus();
      if (shouldStopPolling) {
        shouldStop = true;
        return;
      }

      // Start polling
      intervalId = setInterval(async () => {
        if (attempts >= maxAttempts) {
          setError('Payment verification timeout. Please check your payment history.');
          shouldStop = true;
          if (intervalId) clearInterval(intervalId);
          return;
        }

        setAttempts(prev => prev + 1);
        const shouldStopPolling = await fetchPaymentStatus();
        
        if (shouldStopPolling || shouldStop) {
          if (intervalId) clearInterval(intervalId);
        }
      }, pollInterval);
    };

    startPolling();

    return () => {
      if (intervalId) clearInterval(intervalId);
      shouldStop = true;
    };
  }, [paymentId, enabled, pollInterval, maxAttempts, fetchPaymentStatus, attempts]);

  const isCompleted = payment?.status === 'completed';
  const isFailed = payment?.status === 'failed';

  return {
    payment,
    isVerifying: isVerifying && !isCompleted && !isFailed,
    isCompleted,
    isFailed,
    error,
    refetch,
  };
}
