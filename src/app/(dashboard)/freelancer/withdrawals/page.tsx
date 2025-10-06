'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { withdrawalAPI } from '@/lib/api/withdrawals';
import { Withdrawal } from '@/types/withdrawals';
import { StripeAccountStatus } from '@/types/stripe';
import { UserWithFinancials } from '@/types/balance';
import { calculateWithdrawalStats, canCreateWithdrawal } from '@/lib/utils/withdrawal.utils';

// Components
import WithdrawalBalanceCard from '@/components/features/payments/WithdrawalBalanceCard';
import WithdrawalStatsCards from '@/components/features/payments/WithdrawalStatsCards';
import WithdrawalHistoryTable from '@/components/features/payments/WithdrawalHistoryTable';
import WithdrawalStripeSetup from '@/components/features/payments/WithdrawalStripeSetup';
import CreateWithdrawalModal from '@/components/features/payments/CreateWithdrawalModal';
import WithdrawalDetailsModal from '@/components/features/payments/WithdrawalDetailsModal';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// Toast notifications
import { useToast } from '@/components/common/Toast/ToastProvider';

const WithdrawalsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { success: showSuccess, error: showError } = useToast();

  // State
  const [userProfile, setUserProfile] = useState<UserWithFinancials | null>(null);
  const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingStripe, setIsLoadingStripe] = useState(true);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await withdrawalAPI.getUserProfile();
      setUserProfile(profile);
      setError(null);
    } catch (err: any) {
      setError('Failed to load profile');
      showError('Failed to load profile');
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fetch Stripe account status
  const fetchStripeStatus = async () => {
    try {
      setIsLoadingStripe(true);
      const status = await withdrawalAPI.getStripeAccountStatus();
      setStripeStatus(status);
    } catch (err: any) {
      console.error('Failed to fetch Stripe status:', err);
      showError('Failed to load Stripe account status');
    } finally {
      setIsLoadingStripe(false);
    }
  };

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    try {
      setIsLoadingWithdrawals(true);
      const data = await withdrawalAPI.getWithdrawals();
      setWithdrawals(data.withdrawals);
    } catch (err: any) {
      console.error('Failed to fetch withdrawals:', err);
      showError('Failed to load withdrawal history');
    } finally {
      setIsLoadingWithdrawals(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserProfile();
    fetchStripeStatus();
    fetchWithdrawals();
  }, []);

  // Handle Stripe onboarding return
  useEffect(() => {
    const setupStatus = searchParams.get('setup');
    
    if (setupStatus === 'success') {
      showSuccess('Stripe account setup complete!');
      fetchStripeStatus(); // Refresh Stripe status
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (setupStatus === 'failed') {
      showError('Stripe account setup was not completed');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  // Handle refresh after withdrawal creation
  const handleWithdrawalSuccess = () => {
    fetchUserProfile();
    fetchWithdrawals();
    showSuccess('Withdrawal request submitted successfully!');
  };

  // Handle view withdrawal details
  const handleViewDetails = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsDetailsModalOpen(true);
  };

  // Check if user can create withdrawal
  const { canWithdraw, reason: withdrawDisabledReason } = canCreateWithdrawal(
    userProfile?.freelancerData?.availableBalance || 0,
    withdrawals.filter(w => w.status === 'pending' || w.status === 'processing').length,
    stripeStatus?.hasAccount || false,
    (stripeStatus?.payoutsEnabled && stripeStatus?.detailsSubmitted) || false
  );

  // Calculate stats
  const stats = calculateWithdrawalStats(withdrawals);

  // Loading state
  const isLoading = isLoadingProfile || isLoadingStripe || isLoadingWithdrawals;

  // Error state
  if (error && !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <svg
            className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              fetchUserProfile();
              fetchStripeStatus();
              fetchWithdrawals();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Withdrawals
          </h1>
          <p className="text-gray-600">
            Manage your earnings and withdraw funds to your account
          </p>
        </div>      <div className="space-y-8">
        {/* Check Stripe Account Status */}
        {!isLoadingStripe &&
          stripeStatus &&
          (!stripeStatus.hasAccount ||
            !stripeStatus.payoutsEnabled ||
            !stripeStatus.detailsSubmitted) && (
            <WithdrawalStripeSetup
              stripeStatus={stripeStatus}
              onSetupComplete={fetchStripeStatus}
            />
          )}

        {/* Balance Card */}
        <WithdrawalBalanceCard
          availableBalance={userProfile?.freelancerData?.availableBalance || 0}
          pendingBalance={userProfile?.freelancerData?.pendingBalance || 0}
          totalEarned={userProfile?.freelancerData?.totalEarned || 0}
          onWithdrawClick={() => setIsCreateModalOpen(true)}
          canWithdraw={canWithdraw}
          withdrawDisabledReason={withdrawDisabledReason}
          isLoading={isLoadingProfile}
        />

        {/* Stats Cards */}
        <WithdrawalStatsCards stats={stats} isLoading={isLoadingWithdrawals} />

        {/* Withdrawal History Table */}
        <WithdrawalHistoryTable
          withdrawals={withdrawals}
          onViewDetails={handleViewDetails}
          isLoading={isLoadingWithdrawals}
        />
      </div>

      {/* Create Withdrawal Modal */}
      {stripeStatus?.accountId && (
        <CreateWithdrawalModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          availableBalance={userProfile?.freelancerData?.availableBalance || 0}
          stripeAccountId={stripeStatus.accountId}
          onSuccess={handleWithdrawalSuccess}
        />
      )}

      {/* Withdrawal Details Modal */}
      <WithdrawalDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedWithdrawal(null);
        }}
        withdrawal={selectedWithdrawal}
      />
    </div>
    </DashboardLayout>
  );
};

export default WithdrawalsPage;
