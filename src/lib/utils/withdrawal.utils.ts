import { Withdrawal, WithdrawalStatus, WithdrawalStats } from '@/types/withdrawals';

/**
 * Calculate Stripe withdrawal fee (2.9% + $0.30)
 */
export const calculateWithdrawalFee = (amount: number) => {
  const fee = amount * 0.029 + 0.30;
  const finalAmount = amount - fee;
  
  return {
    fee: parseFloat(fee.toFixed(2)),
    finalAmount: parseFloat(finalAmount.toFixed(2)),
    meetsMinimum: finalAmount >= 10,
  };
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Get color for withdrawal status badge
 */
export const getStatusColor = (status: WithdrawalStatus): string => {
  const colors: Record<WithdrawalStatus, string> = {
    [WithdrawalStatus.PENDING]: 'yellow',
    [WithdrawalStatus.PROCESSING]: 'blue',
    [WithdrawalStatus.COMPLETED]: 'green',
    [WithdrawalStatus.FAILED]: 'red',
    [WithdrawalStatus.CANCELLED]: 'gray',
  };
  return colors[status] || 'gray';
};

/**
 * Get Tailwind CSS classes for status badges
 */
export const getStatusBadgeClasses = (status: WithdrawalStatus): string => {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold uppercase';
  const colorClasses: Record<WithdrawalStatus, string> = {
    [WithdrawalStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [WithdrawalStatus.PROCESSING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [WithdrawalStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [WithdrawalStatus.FAILED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    [WithdrawalStatus.CANCELLED]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return `${baseClasses} ${colorClasses[status] || colorClasses[WithdrawalStatus.PENDING]}`;
};

/**
 * Get human-readable status label
 */
export const getStatusLabel = (status: WithdrawalStatus): string => {
  const labels: Record<WithdrawalStatus, string> = {
    [WithdrawalStatus.PENDING]: 'Pending',
    [WithdrawalStatus.PROCESSING]: 'Processing',
    [WithdrawalStatus.COMPLETED]: 'Completed',
    [WithdrawalStatus.FAILED]: 'Failed',
    [WithdrawalStatus.CANCELLED]: 'Cancelled',
  };
  return labels[status] || status;
};

/**
 * Format date to human-readable string
 */
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date for short display (no time)
 */
export const formatDateShort = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Calculate withdrawal statistics from array of withdrawals
 */
export const calculateWithdrawalStats = (withdrawals: Withdrawal[]): WithdrawalStats => {
  const completed = withdrawals.filter(w => w.status === WithdrawalStatus.COMPLETED);
  const pending = withdrawals.filter(w => 
    w.status === WithdrawalStatus.PENDING || w.status === WithdrawalStatus.PROCESSING
  );
  
  const totalWithdrawn = completed.reduce((sum, w) => sum + w.finalAmount, 0);
  const totalPending = pending.reduce((sum, w) => sum + w.amount, 0);
  
  const lastWithdrawal = completed.sort((a, b) => {
    const dateA = new Date(a.completedAt || a.requestedAt).getTime();
    const dateB = new Date(b.completedAt || b.requestedAt).getTime();
    return dateB - dateA;
  })[0];
  
  return {
    totalWithdrawn,
    totalPending,
    pendingCount: pending.length,
    lastWithdrawalDate: lastWithdrawal?.completedAt,
    lastWithdrawalAmount: lastWithdrawal?.finalAmount,
  };
};

/**
 * Mask Stripe account ID (show only last 4 characters)
 */
export const maskStripeAccountId = (accountId: string): string => {
  if (!accountId || accountId.length < 4) return accountId;
  const lastFour = accountId.slice(-4);
  return `acc_••••••${lastFour}`;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: string): string => {
  if (error.includes('Insufficient balance') || error.includes('insufficient')) {
    return "You don't have enough available balance for this withdrawal.";
  }
  if (error.includes('Maximum pending withdrawals') || error.includes('maximum')) {
    return 'You can have up to 3 pending withdrawals at a time. Please wait for them to complete.';
  }
  if (error.includes('Minimum withdrawal') || error.includes('minimum')) {
    return 'The withdrawal amount after fees must be at least $10.';
  }
  if (error.includes('Stripe account') || error.includes('stripe')) {
    return 'Please set up your Stripe account before making a withdrawal.';
  }
  if (error.includes('Only freelancers')) {
    return 'Only freelancers can request withdrawals.';
  }
  return error || 'Something went wrong. Please try again.';
};

/**
 * Validate withdrawal amount
 */
export const validateWithdrawalAmount = (
  amount: number, 
  availableBalance: number
): { isValid: boolean; error?: string } => {
  if (!amount || amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (amount > availableBalance) {
    return { isValid: false, error: 'Amount exceeds available balance' };
  }
  
  const { meetsMinimum, finalAmount } = calculateWithdrawalFee(amount);
  if (!meetsMinimum) {
    return { 
      isValid: false, 
      error: `After fees, you'll receive $${finalAmount.toFixed(2)}. Minimum is $10.00` 
    };
  }
  
  return { isValid: true };
};

/**
 * Check if user can create withdrawal
 */
export const canCreateWithdrawal = (
  availableBalance: number,
  pendingCount: number,
  hasStripeAccount: boolean,
  stripeAccountVerified: boolean
): { canWithdraw: boolean; reason?: string } => {
  if (!hasStripeAccount) {
    return { canWithdraw: false, reason: 'Please set up your Stripe account first' };
  }
  
  if (!stripeAccountVerified) {
    return { canWithdraw: false, reason: 'Please complete your Stripe account setup' };
  }
  
  if (availableBalance < 10) {
    return { canWithdraw: false, reason: 'Minimum balance required is $10.00' };
  }
  
  if (pendingCount >= 3) {
    return { canWithdraw: false, reason: 'Maximum 3 pending withdrawals allowed' };
  }
  
  return { canWithdraw: true };
};
