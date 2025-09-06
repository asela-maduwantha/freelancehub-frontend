'use client';

import { useState } from 'react';
import { usePaymentStore } from '../../lib/stores/payment.store';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

export function StripeConnectOnboarding() {
  const {
    stripeConnect,
    onboardingStatus,
    createStripeAccount,
    checkStripeStatus
  } = usePaymentStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleSetupPayments = async () => {
    try {
      setIsLoading(true);
      await createStripeAccount();

      // Check status after creation
      if (stripeConnect?.accountId) {
        await checkStripeStatus();
      }
    } catch (error) {
      console.error('Failed to create Stripe account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueOnboarding = () => {
    if (stripeConnect?.onboardingUrl) {
      window.open(stripeConnect.onboardingUrl, '_blank');
    }
  };

  const getStatusDisplay = () => {
    if (!stripeConnect) {
      return {
        icon: <CreditCard className="w-5 h-5 text-gray-400" />,
        text: 'Set up payments to start receiving money',
        buttonText: 'Set Up Payments',
        buttonAction: handleSetupPayments,
        status: 'not-started'
      };
    }

    switch (stripeConnect.status) {
      case 'pending':
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          text: 'Complete your Stripe onboarding to start receiving payments',
          buttonText: 'Continue Setup',
          buttonAction: handleContinueOnboarding,
          status: 'pending'
        };

      case 'complete':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Your payment account is ready! You can now receive payments.',
          buttonText: null,
          buttonAction: null,
          status: 'complete'
        };

      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          text: 'There was an issue with your payment setup. Please try again.',
          buttonText: 'Retry Setup',
          buttonAction: handleSetupPayments,
          status: 'error'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center space-x-3 mb-4">
        {statusDisplay.icon}
        <h3 className="text-lg font-semibold text-gray-900">
          Payment Setup
        </h3>
      </div>

      <p className="text-gray-600 mb-4">
        {statusDisplay.text}
      </p>

      {stripeConnect?.requirements && stripeConnect.requirements.currently_due.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800 font-medium mb-2">
            Required Information:
          </p>
          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
            {stripeConnect.requirements.currently_due.map((requirement, index) => (
              <li key={index}>{requirement.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      )}

      {statusDisplay.buttonText && (
        <Button
          onClick={statusDisplay.buttonAction}
          disabled={isLoading || onboardingStatus === 'loading'}
          className="w-full sm:w-auto"
        >
          {isLoading || onboardingStatus === 'loading' ? (
            <>
              <LoadingSpinner className="w-4 h-4 mr-2" />
              Setting up...
            </>
          ) : (
            statusDisplay.buttonText
          )}
        </Button>
      )}

      {statusDisplay.status === 'complete' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-green-800">
              Payments enabled • Account ID: {stripeConnect?.accountId}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
