'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStripeAccount } from '@/lib/hooks/useStripeAccount';

/**
 * Stripe Onboarding Refresh Page
 * Handles the return when user exits Stripe onboarding without completing
 * URL: /freelancer/onboarding/refresh
 */
export default function OnboardingRefreshPage() {
  const router = useRouter();
  const { startOnboarding, account, accountState } = useStripeAccount();
  const [redirecting, setRedirecting] = React.useState(false);

  useEffect(() => {
    // Auto-redirect to onboarding after a short delay
    const timer = setTimeout(() => {
      handleContinueOnboarding();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinueOnboarding = async () => {
    setRedirecting(true);
    try {
      await startOnboarding();
      // The useStripeAccount hook will handle the redirect
    } catch (error) {
      console.error('Error restarting onboarding:', error);
      setRedirecting(false);
    }
  };

  const handleSkipForNow = () => {
    router.push('/freelancer/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
          <div className="flex items-center gap-4 text-white">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h1 className="text-xl font-bold mb-1">Setup Not Complete</h1>
              <p className="text-sm opacity-90">Your payout account needs to be finished</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Complete Your Payout Setup
            </h2>
            <p className="text-gray-600 mb-4">
              It looks like you exited the onboarding process before completing all required steps.
              To receive withdrawals, you need to finish setting up your payout account with Stripe.
            </p>
          </div>

          {/* Why Complete */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Why is this required?</h3>
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure and compliant payment processing</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verify your identity for fraud prevention</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Enable fast and reliable payouts to your account</span>
              </li>
            </ul>
          </div>

          {/* Redirecting indicator */}
          {redirecting && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent mb-2"></div>
              <p className="text-sm text-gray-600">Redirecting to Stripe...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinueOnboarding}
              disabled={redirecting}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {redirecting ? 'Redirecting...' : 'Continue Setup'}
            </button>
            <button
              onClick={handleSkipForNow}
              disabled={redirecting}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip for Now
            </button>
          </div>

          {/* Help text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              You can complete this setup anytime from your{' '}
              <a href="/freelancer/payments/withdrawals" className="text-blue-600 hover:underline">
                withdrawals page
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
