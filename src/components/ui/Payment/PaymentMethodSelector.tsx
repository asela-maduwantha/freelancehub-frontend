import React from 'react';
import { PaymentMethod } from '../../../lib/api/payments';

interface PaymentMethodSelectorProps {
  savedCards: PaymentMethod[];
  selectedMethod: PaymentMethod | null;
  paymentOption: 'saved' | 'new' | 'checkout' | '';
  onMethodSelect: (method: PaymentMethod) => void;
  onOptionChange: (option: 'saved' | 'new' | 'checkout' | '') => void;
  loading?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  savedCards,
  selectedMethod,
  paymentOption,
  onMethodSelect,
  onOptionChange,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-method-selector space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-primary mb-4">Payment Method</h3>

        {/* Saved Cards Option */}
        {savedCards.length > 0 && (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                value="saved"
                checked={paymentOption === 'saved'}
                onChange={(e) => onOptionChange(e.target.value as 'saved')}
                className="w-4 h-4 text-accent focus:ring-accent border-gray-300"
              />
              <span className="text-primary font-medium">Use saved card</span>
            </label>

            {paymentOption === 'saved' && (
              <div className="ml-7 space-y-2">
                {savedCards.map(card => (
                  <div
                    key={card.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedMethod?.id === card.id
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onMethodSelect(card)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {card.card.brand === 'visa' && '💳'}
                          {card.card.brand === 'mastercard' && '💳'}
                          {card.card.brand === 'amex' && '💳'}
                          {!['visa', 'mastercard', 'amex'].includes(card.card.brand) && '💳'}
                        </div>
                        <div>
                          <div className="font-medium text-primary capitalize">
                            {card.card.brand} •••• {card.card.last4}
                          </div>
                          <div className="text-sm text-secondary">
                            Expires {card.card.expMonth}/{card.card.expYear}
                          </div>
                        </div>
                      </div>
                      {card.isDefault && (
                        <span className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save New Card Option */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              value="new"
              checked={paymentOption === 'new'}
              onChange={(e) => onOptionChange(e.target.value as 'new')}
              className="w-4 h-4 text-accent focus:ring-accent border-gray-300"
            />
            <span className="text-primary font-medium">Save card for future payments</span>
          </label>
          {paymentOption === 'new' && (
            <div className="ml-7 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Your card will be securely saved for future payments. You can manage saved cards in your account settings.
              </p>
            </div>
          )}
        </div>

        {/* One-time Payment Option */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              value="checkout"
              checked={paymentOption === 'checkout'}
              onChange={(e) => onOptionChange(e.target.value as 'checkout')}
              className="w-4 h-4 text-accent focus:ring-accent border-gray-300"
            />
            <span className="text-primary font-medium">Pay with new card (one-time)</span>
          </label>
          {paymentOption === 'checkout' && (
            <div className="ml-7 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-secondary">
                Your card details will not be saved. You'll be redirected to a secure checkout page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;