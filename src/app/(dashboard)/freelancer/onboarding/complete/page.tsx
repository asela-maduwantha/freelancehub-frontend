'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStripeAccount } from '@/lib/hooks/useStripeAccount';
import { StripeAccountStatusBadge } from '@/components/features/payments';
import { StripeAccountSetupState } from '@/types/stripe';

/**
 * Stripe Onboarding Complete Page
 * Handles the return from Stripe onboarding success
 * URL: /freelancer/onboarding/complete
 */
function OnboardingCompletePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { account, status, fetchStatus, accountState } = useStripeAccount();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        setChecking(true);
        // Fetch the latest account status
        await fetchStatus();
      } catch (error) {
        console.error('Error checking account status:', error);
      } finally {
        setChecking(false);
      }
    };

    // Small delay to ensure Stripe has updated the account
    const timer = setTimeout(() => {
      checkAccountStatus();
    }, 1500);

    return () => clearTimeout(timer);
  }, [fetchStatus]);

  const handleContinue = () => {
    router.push('/freelancer/payments/withdrawals');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Your Account
          </h2>
          <p className="text-gray-600">
            Please wait while we check your account status with Stripe...
          </p>
        </div>
      </div>
    );
  }

  // Determine the completion state
  const isFullyComplete = accountState?.state === StripeAccountSetupState.FULLY_ENABLED;
  const isUnderReview = accountState?.state === StripeAccountSetupState.UNDER_REVIEW;
  const needsMoreInfo = accountState?.state === StripeAccountSetupState.ONBOARDING_INCOMPLETE || 
                        accountState?.state === StripeAccountSetupState.RESTRICTED;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className={`px-8 py-6 ${
          isFullyComplete
            ? 'bg-gradient-to-r from-green-500 to-green-600'
            : isUnderReview
            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
            : 'bg-gradient-to-r from-amber-500 to-amber-600'
        }`}>
          <div className="flex items-center gap-4 text-white">
            {isFullyComplete ? (
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : isUnderReview ? (
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {isFullyComplete
                  ? 'Account Setup Complete!'
                  : isUnderReview
                  ? 'Account Under Review'
                  : 'Additional Information Required'}
              </h1>
              <p className="opacity-90">
                {isFullyComplete
                  ? 'Your payout account is ready to use'
                  : isUnderReview
                  ? 'We\'re reviewing your account details'
                  : 'Please complete the remaining steps'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Account Status Badge */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Status:</h3>
            <StripeAccountStatusBadge showDetails={true} />
          </div>

          {/* Status-specific messages */}
          {isFullyComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">✓ Ready for Withdrawals</h3>
              <p className="text-sm text-green-800">
                Your payout account is fully set up and verified. You can now request withdrawals
                from your available balance. Funds will be transferred to your connected account.
              </p>
            </div>
          )}

          {isUnderReview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Under Review</h3>
              <p className="text-sm text-blue-800 mb-3">
                Stripe is reviewing your account information. This usually takes 1-2 business days.
                You'll receive an email notification once the review is complete.
              </p>
              <p className="text-sm text-blue-800">
                In the meantime, you can continue earning through completed milestones. Withdrawal
                functionality will be enabled once your account is approved.
              </p>
            </div>
          )}

          {needsMoreInfo && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-900 mb-2">Action Required</h3>
              <p className="text-sm text-amber-800 mb-3">
                Additional information is needed to complete your account setup. Please return to
                the onboarding process to provide the required details.
              </p>
              {status?.requirements?.currentlyDue && status.requirements.currentlyDue.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-amber-700 font-medium mb-2">Required information:</p>
                  <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                    {status.requirements.currentlyDue.map((req: string, index: number) => (
                      <li key={index}>{req.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Account Details */}
          {account && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Account Details:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Account ID:</span>
                  <p className="font-mono text-gray-900">...{account.id.slice(-8)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Country:</span>
                  <p className="text-gray-900">{account.country || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Charges Enabled:</span>
                  <p className="text-gray-900">{status?.chargesEnabled ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Payouts Enabled:</span>
                  <p className="text-gray-900">{status?.payoutsEnabled ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleContinue}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors px-6 py-3 rounded-lg font-medium"
            >
              {isFullyComplete ? 'Go to Withdrawals' : 'View Dashboard'}
            </button>
            <button
              onClick={() => router.push('/freelancer/dashboard')}
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors px-6 py-3 rounded-lg font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@freelancehub.com" className="text-blue-600 hover:underline">
              support@freelancehub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking your account status...</p>
        </div>
      </div>
    }>
      <OnboardingCompletePageContent />
    </Suspense>
  );
}
