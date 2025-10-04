'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import DashboardLayout from '@/components/layouts/DashboardLayout';
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
  FileText,
  ArrowLeft
} from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentCollectionPageProps {}

const PaymentForm: React.FC<{
  payment: any;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ payment, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message || 'Failed to create payment method');
      }

      // Confirm payment with the payment method
      const { error: confirmError } = await stripe.confirmCardPayment(payment.stripePaymentIntentId, {
        payment_method: paymentMethod.id,
      });

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment failed');
      }

      // Payment succeeded
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      onError(err.message || 'Payment failed');
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
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
            <p className="text-sm text-gray-600">Secure payment powered by Stripe</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Amount</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(payment.amount, payment.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Platform Fee</span>
            <span className="text-sm text-gray-600">
              {formatCurrency(payment.platformFee, payment.currency)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm font-medium text-green-700">Freelancer Receives</span>
            <span className="text-lg font-semibold text-green-700">
              {formatCurrency(payment.freelancerAmount, payment.currency)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className="p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && (
            <Alert type="error" message={error} className="text-sm" />
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Pay {formatCurrency(payment.amount, payment.currency)}
              </div>
            )}
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <Shield className="h-3 w-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>
    </div>
  );
};

const PaymentCollectionPage: React.FC<PaymentCollectionPageProps> = () => {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.paymentId as string;

  const [payment, setPayment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const paymentData = await paymentService.getPayment(paymentId);
        setPayment(paymentData);
      } catch (err: any) {
        setError(err.message || 'Failed to load payment details');
      } finally {
        setIsLoading(false);
      }
    };

    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

  const handlePaymentSuccess = () => {
    setIsSuccess(true);
    // Redirect to success page after a short delay
    setTimeout(() => {
      router.push('/client/payments/success');
    }, 2000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !isSuccess) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="secondary" onClick={handleGoBack}>
              ← Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Payment Collection</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-800 mb-4">{error}</p>
              <Button variant="primary" onClick={() => router.push('/client/payments')}>
                Go to Payment History
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isSuccess) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
            <p className="text-green-700 mb-6">
              Your payment of {formatCurrency(payment.amount, payment.currency)} has been processed successfully.
            </p>
            <div className="text-sm text-green-600">
              Redirecting to confirmation page...
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="secondary" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <p className="text-gray-600">Secure payment for milestone completion</p>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm
            payment={payment}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
      </div>
    </DashboardLayout>
  );
};

export default PaymentCollectionPage;