'use client';

import React from 'react';
import Link from 'next/link';
import { BalanceSummary, StripeAccountStatusBadge } from '@/components/features/payments';
import { useWithdrawals } from '@/lib/hooks/useWithdrawals';
import { useStripeAccount } from '@/lib/hooks/useStripeAccount';
import { WithdrawalStatus } from '@/types/withdrawals';
import { formatDate } from '@/lib/utils/formatting';

/**
 * Earnings & Withdrawals Widget for Freelancer Dashboard
 * Shows balance summary, recent withdrawals, and quick actions
 */
export const EarningsWidget: React.FC = () => {
  const { withdrawals, fetchWithdrawals } = useWithdrawals();
  const { account } = useStripeAccount();

  // Get recent withdrawals (last 3)
  const recentWithdrawals = withdrawals.slice(0, 3);

  React.useEffect(() => {
    fetchWithdrawals({ page: 1, limit: 3, sortBy: 'requestedAt', sortOrder: 'desc' });
  }, [fetchWithdrawals]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Earnings & Withdrawals</h2>
          <Link
            href="/freelancer/payments/withdrawals"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            View All →
          </Link>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
        <BalanceSummary variant="detailed" />
        
        {/* Stripe Account Status */}
        {account && (
          <div className="mt-4 pt-4 border-t border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payout Account:</span>
              <StripeAccountStatusBadge showDetails={false} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <Link href="/freelancer/payments/withdrawals">
          <button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Request Withdrawal
          </button>
        </Link>
      </div>

      {/* Recent Withdrawals */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Withdrawals</h3>
        {recentWithdrawals.length > 0 ? (
          <div className="space-y-3">
            {recentWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal._id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      ${withdrawal.amount.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        withdrawal.status === WithdrawalStatus.COMPLETED
                          ? 'bg-green-100 text-green-800'
                          : withdrawal.status === WithdrawalStatus.PROCESSING
                          ? 'bg-blue-100 text-blue-800'
                          : withdrawal.status === WithdrawalStatus.PENDING
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {withdrawal.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(withdrawal.requestedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    ${withdrawal.finalAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Net amount</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-10 w-10 text-gray-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm text-gray-500">No withdrawals yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Request your first withdrawal to see it here
            </p>
          </div>
        )}
      </div>

      {/* Footer Link */}
      {recentWithdrawals.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <Link
            href="/freelancer/payments/withdrawals"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
          >
            View All Withdrawals
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EarningsWidget;
