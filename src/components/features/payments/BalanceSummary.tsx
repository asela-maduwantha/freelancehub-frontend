import React from 'react';
import useBalance from '@/lib/hooks/useBalance';

interface BalanceSummaryProps {
  variant?: 'compact' | 'inline' | 'detailed';
  className?: string;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const {
    availableBalance,
    pendingBalance,
    totalEarned,
    formattedAvailableBalance,
    formattedPendingBalance,
    formattedTotalEarned,
  } = useBalance();

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-6 ${className}`}>
        <div>
          <span className="text-sm text-gray-600">Available: </span>
          <span className="text-lg font-semibold text-gray-900">{formattedAvailableBalance}</span>
        </div>
        <div className="h-6 w-px bg-gray-300" />
        <div>
          <span className="text-sm text-gray-600">Pending: </span>
          <span className="text-lg font-semibold text-amber-600">{formattedPendingBalance}</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg ${className}`}>
        <div>
          <p className="text-sm text-gray-600">Available Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formattedAvailableBalance}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-sm font-medium text-amber-600">{formattedPendingBalance}</p>
        </div>
      </div>
    );
  }

  // detailed variant
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-5 ${className}`}>
      <div className="space-y-4">
        {/* Available Balance - Ready for Withdrawal */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Available for Withdrawal</span>
              <span className="inline-flex items-center text-xs text-gray-500" title="Funds from approved milestones that you can withdraw">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <span className="text-2xl font-bold text-primary">{formattedAvailableBalance}</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">Ready to withdraw to your Stripe account</p>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{
                width: totalEarned > 0 ? `${(availableBalance / totalEarned) * 100}%` : '0%',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          {/* Pending Balance - Locked in Active Contracts */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-500">Pending</p>
              <span className="inline-flex items-center text-xs text-gray-400" title="Money locked in active milestones">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <p className="text-lg font-semibold text-amber-600">{formattedPendingBalance}</p>
            <p className="text-xs text-amber-700 mt-0.5">In active contracts</p>
          </div>
          
          {/* Total Earned - Lifetime Metric */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-gray-500">Total Earned</p>
              <span className="inline-flex items-center text-xs text-gray-400" title="Lifetime earnings from all completed work">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <p className="text-lg font-semibold text-green-600">{formattedTotalEarned}</p>
            <p className="text-xs text-green-700 mt-0.5">Lifetime earnings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
