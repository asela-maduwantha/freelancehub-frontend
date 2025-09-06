'use client';

import { useState } from 'react';
import { usePaymentStore } from '../../lib/stores/payment.store';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, DollarSign, Calendar, Shield } from 'lucide-react';

interface CreatePaymentFormProps {
  projectId: string;
  freelancerId: string;
  milestoneId?: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

export function CreatePaymentForm({
  projectId,
  freelancerId,
  milestoneId,
  amount,
  onSuccess,
  onCancel
}: CreatePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { createPayment, confirmPayment, isLoading, error } = usePaymentStore();

  const [formData, setFormData] = useState({
    description: '',
    autoRelease: true,
    autoReleaseDays: 7
  });

  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    try {
      setProcessing(true);

      // Create payment intent
      const paymentIntent = await createPayment({
        contractId: projectId, // Using projectId as contractId for now
        milestoneId,
        amount,
        currency: 'USD',
        paymentMethod: 'stripe',
        description: formData.description,
        autoRelease: formData.autoRelease,
        autoReleaseDays: formData.autoReleaseDays
      });

      // Confirm payment with card details
      const { error: confirmError } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Client Name', // This should come from user profile
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Confirm payment on backend
      await confirmPayment(paymentIntent.id, paymentIntent.id);

      onSuccess(paymentIntent.id);
    } catch (error) {
      console.error('Payment creation failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const platformFee = amount * 0.05; // 5% platform fee
  const netAmount = amount - platformFee;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Create Payment
          </h2>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Milestone Amount:</span>
            <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Platform Fee (5%):</span>
            <span className="text-red-600">-${platformFee.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total to Pay:</span>
            <span className="font-bold text-lg text-green-600">
              ${netAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              placeholder="Describe what this payment is for..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Auto-Release Settings */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Auto-Release Settings</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRelease"
                  checked={formData.autoRelease}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    autoRelease: e.target.checked
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoRelease" className="ml-2 text-sm text-gray-700">
                  Enable auto-release after milestone completion
                </label>
              </div>

              {formData.autoRelease && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auto-release after (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.autoReleaseDays}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      autoReleaseDays: parseInt(e.target.value) || 7
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Card Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className="border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || processing || isLoading}
              className="flex-1"
            >
              {processing ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay ${netAmount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-sm text-green-800">
              Your payment information is secure and encrypted. Funds are held in escrow until the milestone is completed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
