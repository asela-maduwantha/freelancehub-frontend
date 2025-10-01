import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import Button from '@/components/ui/Button';
import { useSetupIntent } from '@/lib/hooks/useSetupIntent';
import { CARD_ELEMENT_OPTIONS } from '@/lib/stripe';
import { ArrowLeft, CreditCard, Shield } from 'lucide-react';

interface AddPaymentMethodFormProps {
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const AddPaymentMethodForm: React.FC<AddPaymentMethodFormProps> = ({
  onSuccess,
  onError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { createSetupIntent, confirmSetupIntent, isProcessing, error, resetError } = useSetupIntent();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [cardholderName, setCardholderName] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!cardholderName.trim()) {
      onError('Please enter the cardholder name.');
      return;
    }

    if (!agreedToTerms) {
      onError('Please agree to the terms and conditions.');
      return;
    }

    try {
      // Create setup intent if not already created
      if (!clientSecret) {
        const setupIntent = await createSetupIntent();
        setClientSecret(setupIntent.clientSecret);
        return; // Wait for user to submit again with the setup intent
      }

      // Confirm the setup intent
      const result = await confirmSetupIntent(clientSecret);

      if (result.success && result.paymentMethodId) {
        onSuccess(result.paymentMethodId);
      } else {
        onError(result.error || 'Failed to add payment method');
      }
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        {onCancel && (
          <button
            onClick={onCancel}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h2 className="text-2xl font-bold text-gray-900">Add Payment Method</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Information Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Card Information</h3>
          </div>

          {/* Card Element */}
          <div className="mb-4">
            <div className="border border-gray-300 rounded-md p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              id="cardholderName"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter cardholder name"
              required
            />
          </div>
        </div>

        {/* Options */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            {/* Set as Default */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="setAsDefault"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="setAsDefault" className="ml-2 text-sm text-gray-700">
                Set as default payment method
              </label>
            </div>

            {/* Terms Agreement */}
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
                and authorize this payment method for future transactions.
              </label>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your payment information is secure</p>
              <p>Your card details are encrypted and processed securely by Stripe. We never store your full card information on our servers.</p>
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
          {onCancel && (
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
            disabled={isProcessing || !agreedToTerms}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {clientSecret ? 'Processing...' : 'Setting up...'}
              </div>
            ) : (
              'Save Payment Method'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { AddPaymentMethodForm };