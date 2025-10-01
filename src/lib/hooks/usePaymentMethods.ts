import { useState, useEffect } from 'react';
import { paymentService, PaymentMethod, PaymentMethodsResponse } from '@/lib/api/payments';

interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setDefaultMethod: (paymentMethodId: string) => Promise<void>;
  deleteMethod: (paymentMethodId: string) => Promise<void>;
}

export function usePaymentMethods(): UsePaymentMethodsReturn {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: PaymentMethodsResponse = await paymentService.getPaymentMethods();
      setPaymentMethods(response.paymentMethods);
      setDefaultPaymentMethodId(response.defaultPaymentMethodId || null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load payment methods';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultMethod = async (paymentMethodId: string) => {
    try {
      setError(null);
      // Note: This would need a backend endpoint to set default payment method
      // For now, we'll update locally
      setDefaultPaymentMethodId(paymentMethodId);
      await fetchPaymentMethods(); // Refetch to get updated data
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to set default payment method';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteMethod = async (paymentMethodId: string) => {
    try {
      setError(null);
      // Note: This would need a backend endpoint to delete payment method
      // For now, we'll update locally
      setPaymentMethods(prev => prev.filter(method => method.id !== paymentMethodId));
      if (defaultPaymentMethodId === paymentMethodId) {
        setDefaultPaymentMethodId(null);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to delete payment method';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  return {
    paymentMethods,
    defaultPaymentMethodId,
    isLoading,
    error,
    refetch: fetchPaymentMethods,
    setDefaultMethod,
    deleteMethod,
  };
}