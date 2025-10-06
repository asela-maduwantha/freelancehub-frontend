'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils/withdrawal.utils';
import Button from '@/components/ui/Button/Button';

interface WithdrawalBalanceCardProps {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  onWithdrawClick: () => void;
  canWithdraw: boolean;
  withdrawDisabledReason?: string;
  isLoading?: boolean;
}

const WithdrawalBalanceCard: React.FC<WithdrawalBalanceCardProps> = ({
  availableBalance,
  pendingBalance,
  totalEarned,
  onWithdrawClick,
  canWithdraw,
  withdrawDisabledReason,
  isLoading = false,
}) => {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl shadow-lg p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Balance Information */}
        <div className="flex-1">
          <h2 className="text-sm font-medium text-gray-600 mb-2">
            Available Balance
          </h2>
          {isLoading ? (
            <div className="h-12 w-48 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-4xl md:text-5xl font-bold text-gray-900">
              {formatCurrency(availableBalance)}
            </p>
          )}

          {/* Secondary Balances */}
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Pending Balance</p>
              {isLoading ? (
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-lg font-semibold text-accent">
                  {formatCurrency(pendingBalance)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Earned</p>
              {isLoading ? (
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-lg font-semibold text-secondary">
                  {formatCurrency(totalEarned)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="flex flex-col items-center md:items-end">
          <Button
            onClick={onWithdrawClick}
            disabled={!canWithdraw || isLoading}
            variant={canWithdraw ? 'primary' : 'secondary'}
            size="lg"
            className="w-full md:w-auto min-w-[200px]"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
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
                Withdraw Funds
              </>
            )}
          </Button>

          {/* Disabled Reason */}
          {!canWithdraw && withdrawDisabledReason && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center md:text-right max-w-[200px]">
              {withdrawDisabledReason}
            </p>
          )}

          {canWithdraw && availableBalance >= 10 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center md:text-right">
              2.9% + $0.30 processing fee applies
            </p>
          )}
        </div>
      </div>

      {/* Info Banner */}
      {pendingBalance > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Pending Balance Notice</p>
              <p>
                {formatCurrency(pendingBalance)} is currently locked in active contracts. 
                These funds will become available once the contracts are completed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalBalanceCard;
