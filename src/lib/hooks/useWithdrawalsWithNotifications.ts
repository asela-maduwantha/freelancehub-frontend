// Custom hook for handling withdrawal operations with comprehensive error handling

import { useCallback } from 'react';
import { useWithdrawals as useWithdrawalsBase } from './useWithdrawals';
import { useToast } from '@/components/common/Toast';
import {
  parseApiError,
  getWithdrawalErrorMessage,
  logError,
} from '@/lib/utils/errorHandling';
import { CreateWithdrawalRequest, ProcessWithdrawalRequest, FailWithdrawalRequest } from '@/types';

/**
 * Enhanced withdrawals hook with built-in error handling and toast notifications
 */
export function useWithdrawalsWithNotifications() {
  const withdrawals = useWithdrawalsBase();
  const toast = useToast();

  const createWithdrawal = useCallback(
    async (data: CreateWithdrawalRequest) => {
      try {
        await withdrawals.createWithdrawal(data);
        toast.success(
          'Withdrawal request submitted successfully! You\'ll receive an email once it\'s processed.',
          'Withdrawal Requested'
        );
      } catch (error) {
        const errorMessage = getWithdrawalErrorMessage(error);
        toast.error(errorMessage, 'Withdrawal Failed');
        logError(error, { operation: 'createWithdrawal', metadata: { data } });
        throw error;
      }
    },
    [withdrawals, toast]
  );

  const processWithdrawal = useCallback(
    async (id: string, data?: ProcessWithdrawalRequest) => {
      try {
        await withdrawals.processWithdrawal(id, data);
        toast.success('Withdrawal is now being processed.', 'Processing Started');
      } catch (error) {
        const errorMessage = getWithdrawalErrorMessage(error);
        toast.error(errorMessage, 'Process Failed');
        logError(error, { operation: 'processWithdrawal', metadata: { withdrawalId: id } });
        throw error;
      }
    },
    [withdrawals, toast]
  );

  const completeWithdrawal = useCallback(
    async (id: string) => {
      try {
        await withdrawals.completeWithdrawal(id);
        toast.success('Withdrawal has been completed successfully.', 'Withdrawal Complete');
      } catch (error) {
        const errorMessage = getWithdrawalErrorMessage(error);
        toast.error(errorMessage, 'Completion Failed');
        logError(error, { operation: 'completeWithdrawal', metadata: { withdrawalId: id } });
        throw error;
      }
    },
    [withdrawals, toast]
  );

  const failWithdrawal = useCallback(
    async (id: string, data: FailWithdrawalRequest) => {
      try {
        await withdrawals.failWithdrawal(id, data);
        toast.info('Withdrawal has been marked as failed.', 'Withdrawal Failed');
      } catch (error) {
        const errorMessage = getWithdrawalErrorMessage(error);
        toast.error(errorMessage, 'Operation Failed');
        logError(error, { operation: 'failWithdrawal', metadata: { withdrawalId: id } });
        throw error;
      }
    },
    [withdrawals, toast]
  );

  return {
    ...withdrawals,
    createWithdrawal,
    processWithdrawal,
    completeWithdrawal,
    failWithdrawal,
  };
}

export default useWithdrawalsWithNotifications;
