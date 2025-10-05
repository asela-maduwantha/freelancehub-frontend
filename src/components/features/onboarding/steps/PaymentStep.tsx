'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NavigationButtons from '../NavigationButtons';
import { RootState } from '@/types/store';
import { onboardingActions } from '@/store/slices/onboarding';
import { freelancerApi } from '@/lib/api/freelancer';

const PaymentStep: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { progress, isLoading } = useSelector((state: RootState) => state.onboarding);

  const [stripeConnected, setStripeConnected] = useState(
    progress?.formData?.stripeConnected || false
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for return from Stripe onboarding - only once
    const urlParams = new URLSearchParams(window.location.search);
    const stripeSuccess = urlParams.get('stripe_success') === 'true';
    
    if (stripeSuccess && !stripeConnected) {
      setStripeConnected(true);
      dispatch(onboardingActions.updateStep(4, { stripeConnected: true }));
      dispatch(onboardingActions.completeStep(4));
    }
  }, []); // Run only once on mount

  // Sync with Redux state
  useEffect(() => {
    if (progress?.formData?.stripeConnected && !stripeConnected) {
      setStripeConnected(true);
    }
  }, [progress?.formData?.stripeConnected, stripeConnected]);

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Step 1: Create Stripe Connect account
      const accountResponse = await freelancerApi.createStripeAccount({
        country: 'US',
        type: 'express'
      });

      console.log('Stripe account created:', accountResponse);

      // Step 2: Get onboarding link
      const frontendUrl = window.location.origin;
      const linkResponse = await freelancerApi.getStripeAccountLink({
        refreshUrl: `${frontendUrl}/freelancer/onboarding?step=4`,
        returnUrl: `${frontendUrl}/freelancer/onboarding?step=4&stripe_success=true`,
        type: 'account_onboarding'
      });

      console.log('Stripe onboarding link response:', linkResponse);

      // Step 3: Redirect to Stripe onboarding
      // API client returns response.data.data, so linkResponse already has the url property
      if (linkResponse?.url) {
        window.location.href = linkResponse.url;
      } else {
        console.error('Invalid response structure:', linkResponse);
        throw new Error('No onboarding URL received from server');
      }

    } catch (error: any) {
      console.error('Failed to connect Stripe:', error);
      setError(error.response?.data?.message || 'Failed to connect Stripe account. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSkip = () => {
    // Allow skipping payment setup for now
    dispatch(onboardingActions.updateStep(4, { stripeConnected: false }));
    dispatch(onboardingActions.completeStep(4));

    // Navigate to dashboard
    router.push('/freelancer/dashboard');
  };

  const handleBack = () => {
    router.push('/freelancer/onboarding?step=3');
  };

  const handleGoToDashboard = () => {
    dispatch(onboardingActions.completeStep(4));
    router.push('/freelancer/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Setup</h2>
        <p className="text-gray-600">
          Connect your Stripe account to receive payments securely when you complete projects.
        </p>
      </div>

      {!stripeConnected ? (
        <div className="space-y-6">
          {/* Stripe Connect Setup */}
          <Card className="p-8">
            <div className="text-center space-y-6">
              {/* Stripe Logo/Branding */}
              <div className="flex justify-center">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <svg className="h-12 w-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                  </svg>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Connect with Stripe
                </h3>
                <p className="text-gray-600 mb-6">
                  Stripe Connect allows you to receive payments directly from clients.
                  It's secure, reliable, and trusted by millions of businesses worldwide.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Secure Payments</h4>
                  <p className="text-sm text-gray-600">Bank-level security for all transactions</p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Fast Transfers</h4>
                  <p className="text-sm text-gray-600">Get paid quickly with instant transfers</p>
                </div>

                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Detailed Reports</h4>
                  <p className="text-sm text-gray-600">Track earnings and manage finances easily</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Connect Button */}
              <Button
                onClick={handleConnectStripe}
                disabled={isConnecting}
                className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  'Connect Stripe Account'
                )}
              </Button>

              <p className="text-sm text-gray-500 mt-4">
                By connecting your Stripe account, you agree to Stripe's{' '}
                <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </a>
              </p>
            </div>
          </Card>

          {/* Skip Option */}
          <Card className="p-6 bg-gray-50">
            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-2">Not ready to connect payments?</h4>
              <p className="text-gray-600 mb-4">
                You can connect your Stripe account later from your dashboard settings.
                You'll need to connect it before you can start receiving payments from clients.
              </p>
              <Button variant="secondary" onClick={handleSkip}>
                Skip for Now
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success State */}
          <Card className="p-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Stripe Account Connected!
                </h3>
                <p className="text-gray-600">
                  Your Stripe account is now connected and ready to receive payments.
                  You'll be able to withdraw earnings once you complete projects.
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">What's Next?</h4>
                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <span className="text-sm text-blue-800">Complete your profile verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                    <span className="text-sm text-blue-800">Browse available projects</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                    <span className="text-sm text-blue-800">Submit proposals and start working</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGoToDashboard}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation - Only show if not connected */}
      {!stripeConnected && (
        <NavigationButtons
          onBack={handleBack}
          onSkip={handleSkip}
          skipLabel="Skip Payment Setup"
          showSkip={true}
          loading={isLoading}
        />
      )}
    </div>
  );
};

export default PaymentStep;