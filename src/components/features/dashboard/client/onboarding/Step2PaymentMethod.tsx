'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import AddCardForm from '@/components/ui/Payment/AddCardForm';
import { clientOnboardingActions } from '@/store/slices/clientOnboarding';
import { RootState } from '@/store';
import { ClientOnboardingFormData } from '@/types/clientOnboarding';

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

const Step2PaymentMethod: React.FC<Step2Props> = ({ onNext, onBack }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { progress, isLoading } = useSelector((state: RootState) => state.clientOnboarding);

  const [paymentMethodAdded, setPaymentMethodAdded] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    // Load existing data if available
    if (progress?.formData?.paymentMethodAdded) {
      setPaymentMethodAdded(true);
      setPaymentMethodId(progress.formData.paymentMethodId || null);
    }
  }, [progress]);

  useEffect(() => {
    // Check if Stripe is loaded
    const checkStripe = async () => {
      try {
        const stripe = await stripePromise;
        setStripeLoaded(!!stripe);
        if (!stripe) {
          console.warn('Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.');
        }
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        setStripeLoaded(false);
      }
    };
    checkStripe();
  }, []);

  const handlePaymentMethodSuccess = (newPaymentMethodId: string) => {
    setPaymentMethodAdded(true);
    setPaymentMethodId(newPaymentMethodId);

    // Update Redux state
    dispatch(clientOnboardingActions.updateStep(2, {
      paymentMethodAdded: true,
      paymentMethodId: newPaymentMethodId,
    }));

    // Mark step as completed
    dispatch(clientOnboardingActions.completeStep(2));
  };

  const handleSkip = () => {
    // Allow skipping payment method setup for now
    dispatch(clientOnboardingActions.updateStep(2, {
      paymentMethodAdded: false,
    }));

    // Mark step as completed
    dispatch(clientOnboardingActions.completeStep(2));

    // Proceed to next step
    onNext();
  };

  const handleContinue = () => {
    if (paymentMethodAdded) {
      onNext();
    }
  };

  if (!stripeLoaded) {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method Setup</h2>
          <p className="text-gray-600">
            Add a payment method to easily pay freelancers when you hire them.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Payment System Not Configured
              </h3>
              <p className="mt-2 text-sm text-yellow-700">
                Stripe is not configured yet. Please set up your Stripe publishable key in the environment variables to enable payment features.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSkip}
          >
            Skip for Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method Setup</h2>
        <p className="text-gray-600">
          Add a payment method to easily pay freelancers when you hire them. You can skip this step and add a payment method later.
        </p>
      </div>

      {!paymentMethodAdded ? (
        <div className="space-y-6">
          {/* Payment Method Setup */}
          <div className="bg-gray-50 rounded-lg p-6">
            <Elements stripe={stripePromise}>
              <AddCardForm
                onSuccess={handlePaymentMethodSuccess}
                onCancel={() => {}}
                setAsDefault={true}
              />
            </Elements>
          </div>

          {/* Skip Option */}
          <div className="border-t pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Don't want to add a payment method right now?
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSkip}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success State */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-green-800">
                  Payment Method Added Successfully!
                </h3>
                <p className="text-green-700 mt-1">
                  Your card has been securely saved and will be set as your default payment method.
                </p>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Your payment information is encrypted and secure. We use Stripe to process payments
                  and never store your full card details on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isLoading || !paymentMethodAdded}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Saving...' : 'Continue to Preferences'}
        </Button>
      </div>
    </Card>
  );
};

export default Step2PaymentMethod;