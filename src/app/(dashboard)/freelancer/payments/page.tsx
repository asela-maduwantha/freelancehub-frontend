'use client';

import React from 'react';
import Link from 'next/link';
import { DollarSign } from 'lucide-react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Breadcrumb from '../../../../components/common/Breadcrumb';
import TransactionHistory from '../../../../components/features/payments/PaymentHistory';
import { BalanceSummary, StripeAccountStatusBadge } from '../../../../components/features/payments';
import { useStripeAccount } from '../../../../lib/hooks/useStripeAccount';

export default function FreelancerPaymentsPage() {
  const { account } = useStripeAccount();

  return (
    <DashboardLayout userRole="freelancer">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/freelancer/dashboard' },
            { label: 'Payments & Earnings', icon: <DollarSign size={16} /> }
          ]}
        />

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Earnings</h1>
          <p className="text-gray-600 mt-1">
            Manage your transactions and withdrawal settings
          </p>
        </div>

        {/* Quick Stats & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Balance Overview</h2>
              <BalanceSummary variant="detailed" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/freelancer/payments/withdrawals">
                <button className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Withdraw Funds
                </button>
              </Link>

              {account && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="mb-2">
                    <span className="text-sm text-gray-600">Payout Account Status:</span>
                  </div>
                  <StripeAccountStatusBadge showDetails={true} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <TransactionHistory userType="freelancer" />
      </div>
    </DashboardLayout>
  );
}