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
      fetchStripeStatus();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (setupStatus === 'failed') {
      showError('Stripe account setup was not completed');
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

  // Error state
  if (error && !userProfile) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white border border-blue-200 rounded-xl p-8 text-center shadow-sm">
            <svg
              className="w-16 h-16 text-blue-600 mx-auto mb-4"
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
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Failed to Load Data
            </h2>
            <p className="text-blue-700 mb-6">{error}</p>
            <button
              onClick={() => {
                fetchUserProfile();
                fetchStripeStatus();
                fetchWithdrawals();
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl space-y-6">
          
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
                Withdrawals
              </h1>
              <p className="text-blue-700">
                Manage your earnings and transfer funds securely
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-blue-100">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-sm text-blue-700">Account Active</span>
            </div>
          </div>

          {/* Stripe Setup Warning */}
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
    </DashboardLayout>
  );
};

export default WithdrawalsPage;