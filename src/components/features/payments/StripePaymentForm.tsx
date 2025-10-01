import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import Button from '@/components/ui/Button';
import { useStripePayment } from '@/lib/hooks/useStripePayment';
import { PaymentMethod } from '@/lib/api/payments';
import { CreditCard, Shield, CheckCircle } from 'lucide-react';

interface StripePaymentFormProps {
  contractId: string;
  amount: number;
  currency?: string;
  description?: string;
  savedMethods?: PaymentMethod[];
  selectedMethod?: PaymentMethod | null;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  contractId,
  amount,
  currency = 'USD',
  description = 'Contract payment',
  savedMethods = [],
  selectedMethod,
  onSuccess,
  onError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { initiatePayment, confirmPayment, isProcessing, error, resetError } = useStripePayment();

  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select');

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amount is in cents
  };

  const handleInitiatePayment = async () => {
    resetError();

    // Validate contractId is present (required by backend)
    if (!contractId) {
      onError('Contract ID is required. Please select a contract before making payment.');
      return;
    }

    if (!agreedToTerms) {
      onError('Please agree to the terms and conditions.');
      return;
    }

    try {
      setPaymentStep('processing');

      // Backend will:
      // 1. Validate contract exists and user is authorized
      // 2. Create/get Stripe customer
      // 3. Create Stripe PaymentIntent
      // 4. Create Payment record in DB with PENDING status
      const result = await initiatePayment({
        contractId, // Required!
        amount,
        currency,
        description,
      });

      // Store both client secret (for Stripe) and paymentId (for backend tracking)
      setClientSecret(result.clientSecret);
      setPaymentIntentId(result.paymentId); // Backend Payment record ID
      setPaymentStep('confirm');
    } catch (err: any) {
      setPaymentStep('select');
      onError(err.message || 'Failed to initiate payment');
    }
  };

  const handleConfirmPayment = async () => {
    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    try {
      setPaymentStep('processing');

      // Confirm payment with Stripe
      // After this succeeds, backend webhook will:
      // 1. Update Payment status to COMPLETED
      // 2. Send notification to freelancer
      // 3. Create transaction logs
      // 4. Record fees
      const result = await confirmPayment(clientSecret);

      if (result.success) {
        setPaymentStep('success');
        // Pass paymentId (Backend Payment record ID) to success handler
        // Success page will use this to poll backend for final status
        onSuccess(paymentIntentId);
      } else {
        setPaymentStep('confirm');
        onError(result.error || 'Payment failed');
      }
    } catch (err: any) {
      setPaymentStep('confirm');
      onError(err.message || 'An unexpected error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentStep === 'select') {
      await handleInitiatePayment();
    } else if (paymentStep === 'confirm') {
      await handleConfirmPayment();
    }
  };

  if (paymentStep === 'success') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Initiated</h3>
        <p className="text-gray-600">
          Your payment is being processed. You'll be redirected to the success page shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(amount, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Description</span>
              <span className="text-gray-900">{description}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        {paymentStep === 'select' && savedMethods.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
            <div className="space-y-3">
              {savedMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod?.id === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod?.id === method.id}
                    onChange={() => {}} // Handle selection
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex items-center">
                    <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">
                        •••• •••• •••• {method.card.last4}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires {method.card.expMonth}/{method.card.expYear}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Stripe Payment Element */}
        {paymentStep === 'confirm' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Payment</h3>
            <div className="border border-gray-300 rounded-md p-3">
              <PaymentElement />
            </div>
          </div>
        )}

        {/* Terms Agreement */}
        {paymentStep === 'select' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                required
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                  terms and conditions
                </a>{' '}
                and authorize this payment.
              </label>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Secure Payment</p>
              <p>Your payment is processed securely by Stripe.</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          {onCancel && paymentStep === 'select' && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isProcessing || (paymentStep === 'select' && !agreedToTerms)}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {paymentStep === 'select' ? 'Initiating...' : 'Processing...'}
              </div>
            ) : paymentStep === 'select' ? (
              `Pay ${formatCurrency(amount, currency)}`
            ) : (
              'Complete Payment'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { StripePaymentForm };