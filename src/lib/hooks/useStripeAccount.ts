import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  createStripeAccount,
  createOnboardingLink,
  startOnboarding,
  fetchAccountStatus,
  deleteStripeAccount,
  checkCanWithdraw,
  clearStripeAccountError,
  clearOnboardingUrl,
  resetStripeAccount,
  updateAccountStatus,
} from '@/store/slices/stripe';
import {
  StripeAccount,
  StripeAccountStatus,
  StripeAccountType,
  OnboardingType,
  CreateStripeAccountRequest,
  CreateOnboardingLinkRequest,
  StripeAccountSetupState,
  AccountStateInfo,
} from '@/types';
import { stripeAccountService } from '@/lib/api/stripe';

interface UseStripeAccountReturn {
  // State
  account: StripeAccount | null;
  status: StripeAccountStatus | null;
  accountState: AccountStateInfo | null;
  onboardingUrl: string | null;
  loading: boolean;
  error: string | null;
  lastChecked: string | null;
  
  // Actions
  createAccount: (country: string, type?: StripeAccountType) => Promise<void>;
  startOnboarding: (
    returnPath?: string,
    refreshPath?: string,
    type?: OnboardingType
  ) => Promise<void>;
  fetchStatus: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  checkCanWithdraw: () => Promise<void>;
  
  // Helpers
  clearError: () => void;
  clearUrl: () => void;
  reset: () => void;
  redirectToOnboarding: (url?: string) => void;
  needsAttention: () => boolean;
  canWithdraw: boolean;
  
  // UI Helpers
  getStatusBadgeColor: () => 'success' | 'warning' | 'error' | 'info';
  getStatusMessage: () => string;
}

export function useStripeAccount(autoFetch = false): UseStripeAccountReturn {
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    account,
    status,
    accountState,
    onboardingUrl,
    loading,
    error,
    lastChecked,
  } = useSelector((state: RootState) => state.stripeAccount);

  // Create Stripe account
  const handleCreateAccount = useCallback(
    async (country: string, type: StripeAccountType = StripeAccountType.EXPRESS) => {
      const data: CreateStripeAccountRequest = { country, type };
      await dispatch(createStripeAccount(data)).unwrap();
    },
    [dispatch]
  );

  // Start onboarding
  const handleStartOnboarding = useCallback(
    async (
      returnPath = '/dashboard?onboarding=complete',
      refreshPath = '/dashboard?onboarding=refresh',
      type: OnboardingType = OnboardingType.ACCOUNT_ONBOARDING
    ) => {
      await dispatch(startOnboarding({ returnPath, refreshPath, type })).unwrap();
    },
    [dispatch]
  );

  // Fetch account status
  const handleFetchStatus = useCallback(async () => {
    await dispatch(fetchAccountStatus()).unwrap();
  }, [dispatch]);

  // Delete account
  const handleDeleteAccount = useCallback(async () => {
    await dispatch(deleteStripeAccount()).unwrap();
  }, [dispatch]);

  // Check if can withdraw
  const handleCheckCanWithdraw = useCallback(async () => {
    await dispatch(checkCanWithdraw()).unwrap();
  }, [dispatch]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch(clearStripeAccountError());
  }, [dispatch]);

  // Clear onboarding URL
  const clearUrl = useCallback(() => {
    dispatch(clearOnboardingUrl());
  }, [dispatch]);

  // Reset state
  const reset = useCallback(() => {
    dispatch(resetStripeAccount());
  }, [dispatch]);

  // Redirect to onboarding
  const redirectToOnboarding = useCallback(
    (url?: string) => {
      const targetUrl = url || onboardingUrl;
      if (targetUrl && typeof window !== 'undefined') {
        window.location.href = targetUrl;
      }
    },
    [onboardingUrl]
  );

  // Check if account needs attention
  const needsAttention = useCallback(() => {
    if (!status) return false;
    if (!status.hasAccount) return true;
    if (!status.detailsSubmitted) return true;
    if (!status.chargesEnabled || !status.payoutsEnabled) {
      const requirements = status.requirements;
      return !!(requirements && 
        (requirements.currentlyDue.length > 0 || requirements.pastDue.length > 0));
    }
    return false;
  }, [status]);

  // Get status badge color
  const getStatusBadgeColor = useCallback((): 'success' | 'warning' | 'error' | 'info' => {
    if (!status) return 'info';
    if (!status.hasAccount) return 'info';
    if (!status.detailsSubmitted) return 'warning';
    if (!status.chargesEnabled || !status.payoutsEnabled) {
      const requirements = status.requirements;
      if (requirements && requirements.pastDue.length > 0) return 'error';
      if (requirements && requirements.currentlyDue.length > 0) return 'warning';
      return 'info';
    }
    return 'success';
  }, [status]);

  // Get status message
  const getStatusMessage = useCallback(() => {
    if (!status) return 'No account';
    if (accountState) return accountState.actionMessage || 'Unknown status';
    return 'Unknown status';
  }, [status, accountState]);

  // Compute canWithdraw from accountState
  const canWithdraw = accountState?.canWithdraw ?? false;

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      handleFetchStatus();
    }
  }, [autoFetch]); // Only run once on mount

  // Redirect to onboarding URL when it's set
  useEffect(() => {
    if (onboardingUrl && typeof window !== 'undefined') {
      // Small delay to allow state to update
      const timer = setTimeout(() => {
        window.location.href = onboardingUrl;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [onboardingUrl]);

  return {
    // State
    account,
    status,
    accountState,
    onboardingUrl,
    loading,
    error,
    lastChecked,
    
    // Actions
    createAccount: handleCreateAccount,
    startOnboarding: handleStartOnboarding,
    fetchStatus: handleFetchStatus,
    deleteAccount: handleDeleteAccount,
    checkCanWithdraw: handleCheckCanWithdraw,
    
    // Helpers
    clearError,
    clearUrl,
    reset,
    redirectToOnboarding,
    needsAttention,
    canWithdraw,
    
    // UI Helpers
    getStatusBadgeColor,
    getStatusMessage,
  };
}

export default useStripeAccount;
