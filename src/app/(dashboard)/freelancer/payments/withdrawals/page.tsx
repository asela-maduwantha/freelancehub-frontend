'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import {
  BalanceCard,
  WithdrawalRequestForm,
  WithdrawalHistory,
  StripeAccountSetup,
} from '../../../../../components/features/payments';
import { useStripeAccount } from '../../../../../lib/hooks/useStripeAccount';

export default function WithdrawalsPage() {
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const { account, accountState } = useStripeAccount();

  const handleWithdrawalSuccess = () => {
    setShowWithdrawalForm(false);
    // Show success notification (could use a toast library)
    alert('Withdrawal request submitted successfully!');
  };

  return (
    <DashboardLayout userRole="freelancer">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
          <p className="text-gray-600 mt-1">
            Manage your earnings and withdrawal requests
          </p>
        </div>

        {/* Stripe Account Setup (if needed) */}
        {!account && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Setup Required
                </h3>
                <p className="text-blue-800 mb-4">
                  Before you can withdraw funds, you need to set up your payout account with Stripe.
                  This is a one-time process that ensures secure and compliant payments.
                </p>
                <StripeAccountSetup />
              </div>
            </div>
          </div>
        )}

        {/* Balance Display */}
        <BalanceCard
          onWithdrawClick={() => setShowWithdrawalForm(true)}
          showActions={true}
        />

        {/* Withdrawal Form Modal/Section */}
        {showWithdrawalForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Request Withdrawal</h2>
                <button
                  onClick={() => setShowWithdrawalForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <WithdrawalRequestForm
                  onSuccess={handleWithdrawalSuccess}
                  onCancel={() => setShowWithdrawalForm(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal History */}
        <WithdrawalHistory limit={10} showFilters={true} />
      </div>
    </DashboardLayout>
  );
}
