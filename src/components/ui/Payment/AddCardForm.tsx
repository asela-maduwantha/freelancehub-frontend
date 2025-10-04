import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentService } from '@/lib/api/payments';
import Button from '../Button';
import { Spinner } from '../Feedback';

interface AddCardFormProps {
  onSuccess: (paymentMethodId: string) => void;
  onCancel: () => void;
  setAsDefault?: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
      iconColor: '#6366f1',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: false,
};

const AddCardForm: React.FC<AddCardFormProps> = ({ 
  onSuccess, 
  onCancel,
  setAsDefault = false 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleCardChange = (event: any) => {
    setError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  const handleSubmit = async () => {

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    if (!cardComplete) {
      setError('Please complete the card details.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create setup intent from backend
      const { clientSecret, setupIntentId } = await paymentService.createSetupIntent();

      if (!clientSecret) {
        throw new Error('Failed to create setup intent - no client secret returned');
      }

      // Step 2: Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Step 3: Confirm card setup with Stripe
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Failed to confirm card setup');
      }

      if (!setupIntent || !setupIntent.payment_method) {
        throw new Error('No payment method returned from Stripe');
      }

      // Step 4: Save payment method to backend
      const paymentMethodId = typeof setupIntent.payment_method === 'string' 
        ? setupIntent.payment_method 
        : setupIntent.payment_method.id;

      const response = await paymentService.savePaymentMethod({
        paymentMethodId,
        isDefault: setAsDefault,
      });

      // Step 5: Clear form and notify success
      cardElement.clear();
      onSuccess(response.id);

    } catch (err: any) {
      console.error('Error adding card:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to add card. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="add-card-form space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <h4 className="text-lg font-semibold text-primary">Add Payment Method</h4>
        <p className="text-sm text-secondary mt-1">
          Your card information is securely processed by Stripe. We never store your full card details.
        </p>
      </div>

      <div className="space-y-4">
        {/* Card Element */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Card Details
          </label>
          <div className="p-4 border border-gray-300 rounded-lg bg-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
            <CardElement 
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleCardChange}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm text-blue-700">
              {setAsDefault 
                ? 'This card will be set as your default payment method.'
                : 'This card will be saved for future payments.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="primary"
            disabled={!stripe || isProcessing || !cardComplete}
            onClick={handleSubmit}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Add Card'
            )}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>

        {/* Stripe Badge */}
        <div className="flex items-center justify-center pt-2 text-xs text-gray-500">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
          </svg>
          Secured by Stripe
        </div>
      </div>
    </div>
  );
};

export default AddCardForm;
