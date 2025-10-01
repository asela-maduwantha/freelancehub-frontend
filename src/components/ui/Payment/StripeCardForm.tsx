import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import Button from '../Button';

interface StripeCardFormProps {
  setupIntent: {
    clientSecret: string;
    setupIntentId: string;
  };
  contractId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const StripeCardForm: React.FC<StripeCardFormProps> = ({
  setupIntent,
  contractId,
  onSuccess,
  onError,
  onCancel,
  isSubmitting = false
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

      // Now confirm the setup intent with the payment method
      const { error, setupIntent: confirmedSetupIntent } = await stripe.confirmSetup({
        clientSecret: setupIntent.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/contracts/${contractId}`,
          payment_method: paymentMethod.id,
        },
        redirect: 'if_required'
      });

      if (error) {
        onError(error.message || 'Payment method setup failed');
        return;
      }

      if (confirmedSetupIntent.status === 'succeeded') {
        // The setup intent was successful, now we need to confirm it with our backend
        try {
          const response = await fetch(`/api/contracts/${contractId}/confirm-payment-method`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              setupIntentId: confirmedSetupIntent.id,
              paymentMethodId: confirmedSetupIntent.payment_method
            })
          });

          if (!response.ok) {
            throw new Error('Failed to confirm payment method');
          }

          onSuccess();
        } catch (apiError: any) {
          onError(apiError.message || 'Failed to save payment method');
        }
      } else {
        onError('Payment method setup was not completed');
      }
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-card-form">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">Save Payment Method</h3>
        <p className="text-secondary text-sm">
          Your card will be securely saved for future payments on this platform.
        </p>
      </div>

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

        <div className="flex space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading || isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={!stripe || loading || isSubmitting}
            className="flex-1"
          >
            {loading ? 'Saving...' : 'Save Card & Complete Contract'}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-xs text-secondary">
        <p>
          Your payment information is encrypted and secure. We use Stripe to process payments
          and do not store your card details on our servers.
        </p>
      </div>
    </div>
  );
};

export default StripeCardForm;