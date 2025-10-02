import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchWithdrawals,
  fetchWithdrawalById,
  createWithdrawal,
  processWithdrawal,
  completeWithdrawal,
  failWithdrawal,
  fetchPendingWithdrawals,
  clearWithdrawalError,
  updateWithdrawalFilters,
  resetWithdrawalFilters,
  clearWithdrawals,
} from '@/store/slices/withdrawals';
import {
  Withdrawal,
  WithdrawalStatus,
  WithdrawalMethod,
  CreateWithdrawalRequest,
  ProcessWithdrawalRequest,
  FailWithdrawalRequest,
  GetWithdrawalsQuery,
} from '@/types';
import { withdrawalService } from '@/lib/api/withdrawals';

interface UseWithdrawalsReturn {
  // State
  withdrawals: Withdrawal[];
  currentWithdrawal: Withdrawal | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
  filters: GetWithdrawalsQuery;
  
  // Actions
  fetchWithdrawals: (query?: GetWithdrawalsQuery) => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  createWithdrawal: (data: CreateWithdrawalRequest) => Promise<void>;
  processWithdrawal: (id: string, data?: ProcessWithdrawalRequest) => Promise<void>;
  completeWithdrawal: (id: string) => Promise<void>;
  failWithdrawal: (id: string, data: FailWithdrawalRequest) => Promise<void>;
  fetchPending: (page?: number, limit?: number) => Promise<void>;
  setFilters: (filters: Partial<GetWithdrawalsQuery>) => void;
  resetFilters: () => void;
  clearError: () => void;
  clear: () => void;
  
  // Helpers
  calculateFee: (amount: number, method: WithdrawalMethod) => {
    processingFee: number;
    finalAmount: number;
    feePercentage: number;
    fixedFee?: number;
  };
  validateWithdrawal: (
    amount: number,
    availableBalance: number,
    method: WithdrawalMethod
  ) => { isValid: boolean; errors: string[] };
}

export function useWithdrawals(autoFetch = false): UseWithdrawalsReturn {
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    withdrawals,
    currentWithdrawal,
    loading,
    error,
    pagination,
    filters,
  } = useSelector((state: RootState) => state.withdrawals);

  // Fetch withdrawals
  const handleFetchWithdrawals = useCallback(
    async (query?: GetWithdrawalsQuery) => {
      await dispatch(fetchWithdrawals(query)).unwrap();
    },
    [dispatch]
  );

  // Fetch withdrawal by ID
  const handleFetchById = useCallback(
    async (id: string) => {
      await dispatch(fetchWithdrawalById(id)).unwrap();
    },
    [dispatch]
  );

  // Create withdrawal
  const handleCreateWithdrawal = useCallback(
    async (data: CreateWithdrawalRequest) => {
      await dispatch(createWithdrawal(data)).unwrap();
    },
    [dispatch]
  );

  // Process withdrawal (Admin)
  const handleProcessWithdrawal = useCallback(
    async (id: string, data?: ProcessWithdrawalRequest) => {
      await dispatch(processWithdrawal({ withdrawalId: id, data })).unwrap();
    },
    [dispatch]
  );

  // Complete withdrawal (Admin)
  const handleCompleteWithdrawal = useCallback(
    async (id: string) => {
      await dispatch(completeWithdrawal(id)).unwrap();
    },
    [dispatch]
  );

  // Fail withdrawal (Admin)
  const handleFailWithdrawal = useCallback(
    async (id: string, data: FailWithdrawalRequest) => {
      await dispatch(failWithdrawal({ withdrawalId: id, data })).unwrap();
    },
    [dispatch]
  );

  // Fetch pending withdrawals (Admin)
  const handleFetchPending = useCallback(
    async (page = 1, limit = 20) => {
      await dispatch(fetchPendingWithdrawals({ page, limit })).unwrap();
    },
    [dispatch]
  );

  // Update filters
  const setFilters = useCallback(
    (newFilters: Partial<GetWithdrawalsQuery>) => {
      dispatch(updateWithdrawalFilters(newFilters));
    },
    [dispatch]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    dispatch(resetWithdrawalFilters());
  }, [dispatch]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch(clearWithdrawalError());
  }, [dispatch]);

  // Clear withdrawals
  const clear = useCallback(() => {
    dispatch(clearWithdrawals());
  }, [dispatch]);

  // Calculate fee
  const calculateFee = useCallback(
    (amount: number, method: WithdrawalMethod) => {
      return withdrawalService.calculateFee(amount, method);
    },
    []
  );

  // Validate withdrawal
  const validateWithdrawal = useCallback(
    (amount: number, availableBalance: number, method: WithdrawalMethod) => {
      return withdrawalService.validateWithdrawal(amount, availableBalance, method);
    },
    []
  );

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      handleFetchWithdrawals(filters);
    }
  }, [autoFetch]); // Only run once on mount

  return {
    // State
    withdrawals,
    currentWithdrawal,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    fetchWithdrawals: handleFetchWithdrawals,
    fetchById: handleFetchById,
    createWithdrawal: handleCreateWithdrawal,
    processWithdrawal: handleProcessWithdrawal,
    completeWithdrawal: handleCompleteWithdrawal,
    failWithdrawal: handleFailWithdrawal,
    fetchPending: handleFetchPending,
    setFilters,
    resetFilters,
    clearError,
    clear,
    
    // Helpers
    calculateFee,
    validateWithdrawal,
  };
}

export default useWithdrawals;
