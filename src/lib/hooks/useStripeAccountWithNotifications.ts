// Custom hook for Stripe operations with comprehensive error handling

import { useCallback } from 'react';
import { useStripeAccount as useStripeAccountBase } from './useStripeAccount';
import { useToast } from '@/components/common/Toast';
import {
  parseApiError,
  getStripeErrorMessage,
  logError,
} from '@/lib/utils/errorHandling';

/**
 * Enhanced Stripe account hook with built-in error handling and toast notifications
 */
export function useStripeAccountWithNotifications() {
  const stripeAccount = useStripeAccountBase();
  const toast = useToast();

  const createAccount = useCallback(
    async (country: string) => {
      try {
        await stripeAccount.createAccount(country);
        toast.success('Stripe account created successfully! Redirecting to onboarding...', 'Account Created');
      } catch (error) {
        const errorMessage = getStripeErrorMessage(error);
        toast.error(errorMessage, 'Account Creation Failed');
        logError(error, { operation: 'createStripeAccount', metadata: { country } });
        throw error;
      }
    },
    [stripeAccount, toast]
  );

  const startOnboarding = useCallback(
    async () => {
      try {
        await stripeAccount.startOnboarding();
        // Success notification handled by redirect
      } catch (error) {
        const errorMessage = getStripeErrorMessage(error);
        toast.error(errorMessage, 'Onboarding Failed');
        logError(error, { operation: 'startStripeOnboarding' });
        throw error;
      }
    },
    [stripeAccount, toast]
  );

  const fetchStatus = useCallback(
    async () => {
      try {
        await stripeAccount.fetchStatus();
        // Silent fetch, no toast needed
      } catch (error) {
        const errorMessage = getStripeErrorMessage(error);
        toast.warning(errorMessage, 'Status Check Failed');
        logError(error, { operation: 'fetchStripeStatus' });
        throw error;
      }
    },
    [stripeAccount, toast]
  );

  const deleteAccount = useCallback(
    async () => {
      try {
        await stripeAccount.deleteAccount();
        toast.success('Stripe account deleted successfully.', 'Account Deleted');
      } catch (error) {
        const errorMessage = getStripeErrorMessage(error);
        toast.error(errorMessage, 'Deletion Failed');
        logError(error, { operation: 'deleteStripeAccount' });
        throw error;
      }
    },
    [stripeAccount, toast]
  );

  return {
    ...stripeAccount,
    createAccount,
    startOnboarding,
    fetchStatus,
    deleteAccount,
  };
}

export default useStripeAccountWithNotifications;
