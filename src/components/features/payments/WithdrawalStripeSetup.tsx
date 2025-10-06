'use client';

import React, { useState } from 'react';
import { StripeAccountStatus } from '@/types/stripe';
import { withdrawalAPI } from '@/lib/api/withdrawals';
import Button from '@/components/ui/Button/Button';

interface WithdrawalStripeSetupProps {
  stripeStatus: StripeAccountStatus | null;
  onSetupComplete: () => void;
}

const WithdrawalStripeSetup: React.FC<WithdrawalStripeSetupProps> = ({
  stripeStatus,
  onSetupComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetupStripeAccount = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!stripeStatus?.hasAccount) {
        await withdrawalAPI.createStripeAccount({
          country: 'US',
        });
      }

      const currentUrl = window.location.origin + window.location.pathname;
      const { url } = await withdrawalAPI.createOnboardingLink({
        refreshUrl: `${currentUrl}?setup=failed`,
        returnUrl: `${currentUrl}?setup=success`,
      });

      window.location.href = url;
    } catch (err: any) {
      setError(err.message || 'Failed to setup Stripe account');
      setIsLoading(false);
    }
  };

  // Account doesn't exist
  if (!stripeStatus?.hasAccount) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-2xl mx-auto border border-blue-200">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full">
            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          Setup Your Stripe Account
        </h2>
        <p className="text-blue-700 mb-6 max-w-lg mx-auto">
          To withdraw your earnings, you need to connect your Stripe account. 
          Stripe is a secure payment platform trusted by millions of businesses worldwide.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            What you'll need:
          </h3>
          <ul className="text-sm text-blue-800 text-left space-y-1 max-w-md mx-auto">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Valid government-issued ID
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Social Security Number (US) or Tax ID
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Bank account information
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Personal information (address, date of birth)
            </li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSetupStripeAccount}
          disabled={isLoading}
          className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold min-w-[200px] transition-colors"
        >
          {isLoading ? 'Redirecting...' : 'Setup Stripe Account'}
        </Button>

        <p className="text-xs text-blue-600 mt-4">
          You'll be redirected to Stripe's secure platform to complete the setup
        </p>
      </div>
    );
  }

  // Account exists but not verified
  if (!stripeStatus.payoutsEnabled || !stripeStatus.detailsSubmitted) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-2xl mx-auto border border-amber-200">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-amber-100 rounded-full">
            <svg className="w-16 h-16 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          Complete Stripe Account Setup
        </h2>
        <p className="text-blue-700 mb-6 max-w-lg mx-auto">
          Your Stripe account needs additional information before you can receive withdrawals. 
          This usually takes just a few minutes.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800 text-left">
              <p className="font-medium mb-1">Account Status</p>
              <ul className="space-y-1">
                <li>
                  Details Submitted:{' '}
                  {stripeStatus.detailsSubmitted ? (
                    <span className="text-blue-600">✓ Yes</span>
                  ) : (
                    <span className="text-amber-600">✗ No</span>
                  )}
                </li>
                <li>
                  Payouts Enabled:{' '}
                  {stripeStatus.payoutsEnabled ? (
                    <span className="text-blue-600">✓ Yes</span>
                  ) : (
                    <span className="text-amber-600">✗ No</span>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSetupStripeAccount}
          disabled={isLoading}
          className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold min-w-[200px] transition-colors"
        >
          {isLoading ? 'Redirecting...' : 'Complete Setup'}
        </Button>

        <p className="text-xs text-blue-600 mt-4">
          You'll be redirected to Stripe to provide the missing information
        </p>
      </div>
    );
  }

  // Account is ready
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center">
        <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Stripe Account Ready
          </p>
          <p className="text-xs text-blue-700">
            Your account is fully set up and ready for withdrawals
          </p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalStripeSetup;