import React from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import useBalance from '@/lib/hooks/useBalance';

interface BalanceCardProps {
  showActions?: boolean;
  onWithdrawClick?: () => void;
  className?: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  showActions = false,
  onWithdrawClick,
  className = '',
}) => {
  const {
    totalEarned,
    pendingBalance,
    availableBalance,
    formattedTotalEarned,
    formattedPendingBalance,
    formattedAvailableBalance,
    canWithdraw,
    hasBalance,
  } = useBalance();

  return (
    <Card className={`balance-card ${className}`} variant="elevated">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Your Balance</h3>
      </CardHeader>
      <CardBody>
        {/* Main Balance Display */}
        <div className="space-y-6">
          {/* Available Balance - Primary */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium opacity-90">Available to Withdraw</span>
              <svg
                className="w-6 h-6 opacity-75"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-4xl font-bold tracking-tight">
              {formattedAvailableBalance}
            </div>
            {showActions && (
              <button
                onClick={onWithdrawClick}
                disabled={!canWithdraw || availableBalance < 10}
                className="mt-4 w-full bg-white text-primary font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canWithdraw && availableBalance >= 10 ? 'Withdraw Funds' : 'Withdrawal Unavailable'}
              </button>
            )}
          </div>

          {/* Secondary Balances */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pending Balance */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-amber-900">Pending</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">
                {formattedPendingBalance}
              </div>
              <p className="text-xs text-amber-700 mt-1">In active milestones</p>
            </div>

            {/* Total Earned */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span className="text-sm font-medium text-green-900">Total Earned</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formattedTotalEarned}
              </div>
              <p className="text-xs text-green-700 mt-1">Lifetime earnings</p>
            </div>
          </div>

          {/* Balance Breakdown */}
          {hasBalance && (
            <div className="border-t pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Available:</span>
                  <span className="font-medium text-gray-900">{formattedAvailableBalance}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pending approval:</span>
                  <span className="font-medium text-gray-900">{formattedPendingBalance}</span>
                </div>
                <div className="flex justify-between text-gray-600 pt-2 border-t">
                  <span className="font-semibold">Total earned:</span>
                  <span className="font-semibold text-gray-900">{formattedTotalEarned}</span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!hasBalance && (
            <div className="text-center py-6 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <p className="text-sm">No earnings yet</p>
              <p className="text-xs mt-1">Start completing milestones to earn</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default BalanceCard;
