import { useState, useEffect } from 'react';
import {
  paymentService,
  PaymentListResponse,
  PaymentListItem,
  PaymentFilters,
  PaymentResponse
} from '@/lib/api/payments';

interface UsePaymentsReturn {
  payments: PaymentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: PaymentFilters;
  setFilters: (filters: Partial<PaymentFilters>) => void;
  refetch: () => Promise<void>;
  getPaymentById: (paymentId: string) => Promise<PaymentResponse | null>;
}

export function usePayments(initialFilters: PaymentFilters = {}): UsePaymentsReturn {
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PaymentFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: PaymentListResponse = await paymentService.getPayments(filters);
      
      // Transform payment items to add computed id fields
      const transformedPayments = response.payments.map(payment => ({
        ...payment,
        id: payment._id, // _id is always present from API
        contractId: payment.contractId ? {
          ...payment.contractId,
          id: payment.contractId._id
        } : null,
        milestoneId: payment.milestoneId ? {
          ...payment.milestoneId,
          id: payment.milestoneId._id
        } : undefined
      }));
      
      setPayments(transformedPayments);
      setTotal(response.total);
      setPage(filters.page || 1);
      setLimit(filters.limit || 10);
      setTotalPages(response.totalPages || Math.ceil(response.total / (filters.limit || 10)));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load payments';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const setFilters = (newFilters: Partial<PaymentFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 when filters change
  };

  const getPaymentById = async (paymentId: string): Promise<PaymentResponse | null> => {
    try {
      const payment = await paymentService.getPayment(paymentId);
      return payment;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load payment details');
      return null;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  return {
    payments,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchPayments,
    getPaymentById,
  };
}