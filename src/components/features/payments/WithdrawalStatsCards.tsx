'use client';

import React from 'react';
import { WithdrawalStats } from '@/types/withdrawals';
import { formatCurrency, formatDateShort } from '@/lib/utils/withdrawal.utils';

interface WithdrawalStatsCardsProps {
  stats: WithdrawalStats;
  isLoading?: boolean;
}

const WithdrawalStatsCards: React.FC<WithdrawalStatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse border border-gray-200">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Withdrawn */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">
            Total Withdrawn
          </h3>
          <div className="p-2 bg-secondary-light rounded-lg">
            <svg
              className="w-5 h-5 text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(stats.totalWithdrawn)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Completed withdrawals
        </p>
      </div>

      {/* Pending Withdrawals */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">
            Pending Withdrawals
          </h3>
          <div className="p-2 bg-accent-light rounded-lg">
            <svg
              className="w-5 h-5 text-accent"
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
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(stats.totalPending)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {stats.pendingCount} {stats.pendingCount === 1 ? 'request' : 'requests'} pending
        </p>
      </div>

      {/* Last Withdrawal */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">
            Last Withdrawal
          </h3>
          <div className="p-2 bg-primary-light rounded-lg">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        {stats.lastWithdrawalDate && stats.lastWithdrawalAmount ? (
          <>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.lastWithdrawalAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              on {formatDateShort(stats.lastWithdrawalDate)}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-gray-400">
              No withdrawals yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Start your first withdrawal
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default WithdrawalStatsCards;
