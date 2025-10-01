'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { contractService } from '../../../../../lib/api/contracts';
import { paymentService } from '../../../../../lib/api/payments';
import Button from '../../../../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../../../../components/ui/Card';
import { Spinner } from '../../../../../components/ui/Feedback';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface ContractSummaryProps {
  contract: any;
  formatCurrency: (amount: number, currency?: string) => string;
}

const ContractSummary: React.FC<ContractSummaryProps> = ({ contract, formatCurrency }) => {
  return (
    <Card variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold text-primary">Contract Summary</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Contract Title</span>
            <span className="text-primary">{contract.title || 'Contract'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Freelancer</span>
            <span className="text-primary">{contract.freelancerId?.fullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount</span>
            <span className="text-lg font-semibold text-success">
              {formatCurrency(contract.totalAmount, contract.currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Platform Fee</span>
            <span className="text-secondary">
              {formatCurrency(contract.platformFee, contract.currency)}
            </span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-primary">Amount to Pay</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(contract.totalAmount, contract.currency)}
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

interface StripeCheckoutFormProps {
  paymentIntent: any;
  contractId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  paymentIntent,
  contractId,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // First create a payment method from the card element
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (createError) {
        onError(createError.message || 'Failed to create payment method');
        return;
      }

      // Now confirm the payment intent with the payment method
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmPayment({
        clientSecret: paymentIntent.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?contractId=${contractId}`,
          payment_method: paymentMethod.id,
        },
        redirect: 'if_required'
      });

      if (error) {
        onError(error.message || 'Payment failed');
        return;
      }

      if (confirmedPayment.status === 'succeeded') {
        // Payment was successful - backend will handle payment record creation via webhooks
        onSuccess();
      } else {
        onError('Payment was not completed');
      }
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold text-primary">Payment Information</h3>
        <p className="text-sm text-secondary">Your payment is secured by Stripe</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Card Information
              </label>
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                    hidePostalCode: false,
                  }}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={!stripe || loading}
            className="w-full"
          >
            {loading ? 'Processing...' : `Pay ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: paymentIntent.currency
            }).format(paymentIntent.amount / 100)}`}
          </Button>
        </form>

        <div className="mt-4 text-xs text-secondary">
          <p>
            Your payment information is encrypted and secure. We use Stripe to process payments
            and do not store your card details on our servers.
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const contractId = params.contractId as string;

  const [contract, setContract] = useState<any>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeCheckout();
  }, [contractId]);

  const initializeCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get contract details
      const contractResponse = await contractService.getContract(contractId);
      setContract(contractResponse);

      // Create payment intent for the full contract amount
      const paymentResponse = await paymentService.createPaymentIntent({
        contractId,
        amount: contractResponse.totalAmount,
        description: `Full payment for contract: ${contractResponse.title || 'Contract'}`
      });

      setPaymentIntent({
        clientSecret: paymentResponse.clientSecret,
        amount: paymentResponse.amount,
        currency: paymentResponse.currency
      });

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    router.push(`/contracts/${contractId}?payment=success`);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-secondary">Initializing checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !contract || !paymentIntent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="default" className="max-w-md w-full">
          <CardBody>
            <div className="text-center">
              <div className="text-error mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">Checkout Error</h3>
              <p className="text-secondary mb-6">{error || 'Unable to load checkout'}</p>
              <Button variant="primary" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Complete Payment</h1>
          <p className="text-secondary">Secure payment for your contract</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <ContractSummary contract={contract} formatCurrency={formatCurrency} />
          </div>

          <div>
            <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.clientSecret }}>
              <StripeCheckoutForm
                paymentIntent={paymentIntent}
                contractId={contractId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;