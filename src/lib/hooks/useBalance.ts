import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { FreelancerBalance, WithdrawalConstraints } from '@/types';

interface UseBalanceReturn {
  // Balance data
  totalEarned: number;
  pendingBalance: number;
  availableBalance: number;
  
  // Formatted values
  formattedTotalEarned: string;
  formattedPendingBalance: string;
  formattedAvailableBalance: string;
  
  // Withdrawal constraints
  constraints: WithdrawalConstraints;
  
  // Helpers
  canWithdraw: boolean;
  hasBalance: boolean;
  withdrawalReasons: string[];
  formatCurrency: (amount: number) => string;
}

const MINIMUM_WITHDRAWAL = 10;

export function useBalance(): UseBalanceReturn {
  const user = useSelector((state: RootState) => state.auth?.user);
  const stripeStatus = useSelector((state: RootState) => state.stripeAccount?.status);
  
  // Extract balance data
  // Note: User type from auth might need extending with freelancerData
  const freelancerData = (user as any)?.freelancerData;
  const totalEarned = freelancerData?.totalEarned || 0;
  const pendingBalance = freelancerData?.pendingBalance || 0;
  const availableBalance = freelancerData?.availableBalance || 0;

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Formatted values
  const formattedTotalEarned = useMemo(() => formatCurrency(totalEarned), [totalEarned]);
  const formattedPendingBalance = useMemo(() => formatCurrency(pendingBalance), [pendingBalance]);
  const formattedAvailableBalance = useMemo(() => formatCurrency(availableBalance), [availableBalance]);

  // Calculate withdrawal constraints
  const constraints: WithdrawalConstraints = useMemo(() => {
    const reasons: string[] = [];
    let canWithdrawAmount = true;

    // Check minimum balance
    if (availableBalance < MINIMUM_WITHDRAWAL) {
      canWithdrawAmount = false;
      reasons.push(`Minimum withdrawal amount is ${formatCurrency(MINIMUM_WITHDRAWAL)}`);
    }

    // Check Stripe account status
    const hasStripeAccount = stripeStatus?.hasAccount || false;
    const payoutsEnabled = stripeStatus?.payoutsEnabled || false;
    const detailsSubmitted = stripeStatus?.detailsSubmitted || false;

    if (!hasStripeAccount) {
      canWithdrawAmount = false;
      reasons.push('Stripe payout account not set up');
    } else if (!detailsSubmitted) {
      canWithdrawAmount = false;
      reasons.push('Complete Stripe account onboarding');
    } else if (!payoutsEnabled) {
      canWithdrawAmount = false;
      reasons.push('Stripe account verification pending');
    }

    return {
      minimumAmount: MINIMUM_WITHDRAWAL,
      maximumAmount: availableBalance,
      availableBalance,
      canWithdraw: canWithdrawAmount,
      reasons: reasons.length > 0 ? reasons : undefined,
    };
  }, [availableBalance, stripeStatus]);

  // Can withdraw check
  const canWithdraw = constraints.canWithdraw;
  
  // Has any balance
  const hasBalance = availableBalance > 0 || pendingBalance > 0;
  
  // Reasons why withdrawal might be disabled
  const withdrawalReasons = constraints.reasons || [];

  return {
    // Balance data
    totalEarned,
    pendingBalance,
    availableBalance,
    
    // Formatted values
    formattedTotalEarned,
    formattedPendingBalance,
    formattedAvailableBalance,
    
    // Withdrawal constraints
    constraints,
    
    // Helpers
    canWithdraw,
    hasBalance,
    withdrawalReasons,
    formatCurrency,
  };
}

export default useBalance;
