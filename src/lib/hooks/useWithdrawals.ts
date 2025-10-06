import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchWithdrawals,
  fetchWithdrawalById,
  createWithdrawal,
  fetchPendingWithdrawals,
  processWithdrawal as processWithdrawalAction,
  completeWithdrawal as completeWithdrawalAction,
  failWithdrawal as failWithdrawalAction,
  selectAllWithdrawals,
  selectWithdrawalById,
  selectWithdrawalsLoading,
  selectWithdrawalsError,
  selectWithdrawalsPagination,
} from '@/store/slices/withdrawals/withdrawalsSlice';
import type {
  CreateWithdrawalRequest,
  ProcessWithdrawalRequest,
  FailWithdrawalRequest,
  GetWithdrawalsQuery,
} from '@/types/withdrawals';

/**
 * Custom hook for managing withdrawals
 * Provides access to withdrawal state and actions from Redux store
 */
export function useWithdrawals(autoLoad = false, query?: GetWithdrawalsQuery) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const withdrawals = useSelector((state: RootState) => selectAllWithdrawals(state));
  const loading = useSelector((state: RootState) => selectWithdrawalsLoading(state));
  const error = useSelector((state: RootState) => selectWithdrawalsError(state));
  const pagination = useSelector((state: RootState) => selectWithdrawalsPagination(state));

  // Auto-load withdrawals on mount if requested
  useEffect(() => {
    if (autoLoad) {
      dispatch(fetchWithdrawals(query || {}));
    }
  }, [autoLoad, dispatch]);

  // Actions
  const loadWithdrawals = useCallback(
    (queryParams?: GetWithdrawalsQuery) => {
      return dispatch(fetchWithdrawals(queryParams || {}));
    },
    [dispatch]
  );

  const loadWithdrawalById = useCallback(
    (id: string) => {
      return dispatch(fetchWithdrawalById(id));
    },
    [dispatch]
  );

  const requestWithdrawal = useCallback(
    (data: CreateWithdrawalRequest) => {
      return dispatch(createWithdrawal(data));
    },
    [dispatch]
  );

  const loadPendingWithdrawals = useCallback(
    (page = 1, limit = 20) => {
      return dispatch(fetchPendingWithdrawals({ page, limit }));
    },
    [dispatch]
  );

  const processWithdrawal = useCallback(
    (withdrawalId: string, data: ProcessWithdrawalRequest) => {
      return dispatch(processWithdrawalAction({ withdrawalId, data }));
    },
    [dispatch]
  );

  const completeWithdrawal = useCallback(
    (withdrawalId: string) => {
      return dispatch(completeWithdrawalAction(withdrawalId));
    },
    [dispatch]
  );

  const failWithdrawal = useCallback(
    (withdrawalId: string, data: FailWithdrawalRequest) => {
      return dispatch(failWithdrawalAction({ withdrawalId, data }));
    },
    [dispatch]
  );

  const getWithdrawalById = (id: string) => {
    // This needs to be called within a component using useSelector
    return withdrawals.find((w) => w._id === id || w.id === id);
  };

  return {
    // State
    withdrawals,
    loading,
    error,
    pagination,
    
    // Actions
    loadWithdrawals,
    loadWithdrawalById,
    requestWithdrawal,
    loadPendingWithdrawals,
    processWithdrawal,
    completeWithdrawal,
    failWithdrawal,
    getWithdrawalById,
    
    // Utilities
    hasWithdrawals: withdrawals.length > 0,
    isEmpty: !loading && withdrawals.length === 0,
  };
}
