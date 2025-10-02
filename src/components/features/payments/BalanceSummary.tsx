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
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Available Balance</span>
            <span className="text-2xl font-bold text-primary">{formattedAvailableBalance}</span>
          </div>
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
          <div>
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className="text-lg font-semibold text-amber-600">{formattedPendingBalance}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Earned</p>
            <p className="text-lg font-semibold text-green-600">{formattedTotalEarned}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
