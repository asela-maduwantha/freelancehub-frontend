'use client';

import React, { useState, useEffect } from 'react';
import { stripePromise } from '@/lib/stripe';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Alert, Spinner } from '@/components/ui/Feedback';
import { paymentService } from '@/lib/api/payments';
import { formatCurrency } from '@/lib/utils/formatting';
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  DollarSign,
  FileText
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: {
    id: string;
    title: string;
    amount: number;
    currency: string;
  };
  contract: {
    id: string;
    title: string;
    freelancerId: string;
    clientId: string;
  };
  platformFeePercentage: number;
  onPaymentSuccess: (payment: any) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentFormProps {
  milestone: PaymentModalProps['milestone'];
  contract: PaymentModalProps['contract'];
  platformFeePercentage: number;
  onSuccess: (payment: any) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  milestone,
  contract,
  platformFeePercentage,
  onSuccess,
  onError,
  onClose
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate fees - client pays milestone amount + platform fee
  // Stripe fees are deducted from the payment automatically, not added to client's payment
  const platformFee = (milestone.amount * platformFeePercentage) / 100;
  const totalAmount = milestone.amount + platformFee;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create payment intent on backend
      const paymentIntentData = {
        contractId: contract.id,
        amount: milestone.amount,
        currency: milestone.currency,
        description: `Payment for milestone: ${milestone.title}`,
        metadata: {
          milestoneId: milestone.id,
          milestoneTitle: milestone.title,
          contractId: contract.id,
        }
      };

      const paymentIntent = await paymentService.createPaymentIntent(paymentIntentData);

      // 2. Confirm payment with Stripe using the client secret
      const { error: stripeError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (stripeError) {
        // Payment failed - show error to user
        setError(stripeError.message || 'Payment failed');
        onError(stripeError.message || 'Payment failed');
      } else if (confirmedPayment && confirmedPayment.status === 'succeeded') {
        // Payment succeeded! 
        // Webhook will handle updating the payment record, contract, and balances
        // Just show success to user
        onSuccess({ id: paymentIntent.paymentId, status: 'succeeded' });
        onClose();
      } else if (confirmedPayment && confirmedPayment.status === 'requires_action') {
        // 3D Secure or other authentication required
        setError('Payment requires additional authentication');
        onError('Payment requires additional authentication');
      } else {
        // Unknown payment status
        setError('Payment could not be completed');
        onError('Payment could not be completed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment');
      onError(err.message || 'An error occurred during payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Milestone Amount</span>
          <span className="font-medium">{formatCurrency(milestone.amount, milestone.currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Platform Fee ({platformFeePercentage}%)</span>
          <span className="font-medium">{formatCurrency(platformFee, milestone.currency)}</span>
        </div>
        {/* Stripe processing fee is handled automatically - not shown to client */}
        <hr className="border-gray-200" />
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(totalAmount, milestone.currency)}
          </span>
        </div>
      </div>

      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CreditCard className="inline h-4 w-4 mr-1" />
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Error Display */}
      {error && (
        <Alert type="error" message={error} className="text-sm" />
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              Pay {formatCurrency(totalAmount, milestone.currency)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  milestone,
  contract,
  platformFeePercentage,
  onPaymentSuccess,
  onPaymentError
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment"
      size="md"
    >
      <div className="space-y-4">
        {/* Milestone Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{milestone.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Contract: {contract.title}
              </p>
              <p className="text-sm font-medium text-green-600 mt-2">
                Amount: {formatCurrency(milestone.amount, milestone.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Stripe Elements Provider */}
        <Elements stripe={stripePromise}>
          <PaymentForm
            milestone={milestone}
            contract={contract}
            platformFeePercentage={platformFeePercentage}
            onSuccess={onPaymentSuccess}
            onError={onPaymentError}
            onClose={onClose}
          />
        </Elements>
      </div>
    </Modal>
  );
};

export default PaymentModal;