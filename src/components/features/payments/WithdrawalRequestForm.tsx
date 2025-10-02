'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWithdrawals } from '@/lib/hooks/useWithdrawals';
import { useBalance } from '@/lib/hooks/useBalance';
import { useStripeAccount } from '@/lib/hooks/useStripeAccount';
import Button from '@/components/ui/Button/Button';
import { WithdrawalMethod } from '@/types/withdrawals';

interface WithdrawalRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

interface FormData {
  amount: string;
  method: WithdrawalMethod;
  // Bank transfer fields
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankAccountHolderName?: string;
  // PayPal field
  paypalEmail?: string;
}

interface FormErrors {
  amount?: string;
  method?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankAccountHolderName?: string;
  paypalEmail?: string;
}

export const WithdrawalRequestForm: React.FC<WithdrawalRequestFormProps> = ({
  onSuccess,
  onCancel,
  className = '',
}) => {
  const { createWithdrawal, loading, error, calculateFee, validateWithdrawal } = useWithdrawals();
  const { availableBalance, canWithdraw, constraints, formattedAvailableBalance } = useBalance();
  const { canWithdraw: stripeEnabled } = useStripeAccount();

  const [formData, setFormData] = useState<FormData>({
    amount: '',
    method: WithdrawalMethod.STRIPE,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Calculate fee and net amount
  const feeCalculation = useMemo(() => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      return { processingFee: 0, finalAmount: 0, feePercentage: 0 };
    }
    return calculateFee(amount, formData.method);
  }, [formData.amount, formData.method, calculateFee]);

  const calculatedFee = feeCalculation.processingFee;
  const netAmount = feeCalculation.finalAmount;

  // Validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const amount = parseFloat(formData.amount);

    // Amount validation
    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Amount must be a positive number';
    } else {
      const validation = validateWithdrawal(amount, availableBalance || 0, formData.method);
      if (!validation.isValid && validation.errors.length > 0) {
        errors.amount = validation.errors[0];
      }
    }

    // Method-specific validation
    if (formData.method === WithdrawalMethod.BANK_TRANSFER) {
      if (!formData.bankAccountNumber?.trim()) {
        errors.bankAccountNumber = 'Account number is required';
      } else if (formData.bankAccountNumber.length < 8 || formData.bankAccountNumber.length > 17) {
        errors.bankAccountNumber = 'Account number must be between 8 and 17 digits';
      }

      if (!formData.bankRoutingNumber?.trim()) {
        errors.bankRoutingNumber = 'Routing number is required';
      } else if (!/^\d{9}$/.test(formData.bankRoutingNumber)) {
        errors.bankRoutingNumber = 'Routing number must be 9 digits';
      }

      if (!formData.bankAccountHolderName?.trim()) {
        errors.bankAccountHolderName = 'Account holder name is required';
      } else if (formData.bankAccountHolderName.length < 2) {
        errors.bankAccountHolderName = 'Name is too short';
      }
    }

    if (formData.method === WithdrawalMethod.PAYPAL) {
      if (!formData.paypalEmail?.trim()) {
        errors.paypalEmail = 'PayPal email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalEmail)) {
        errors.paypalEmail = 'Invalid email format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Auto-validate on change if field has been touched
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm();
    }
  }, [formData, touched]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleMethodChange = (method: WithdrawalMethod) => {
    setFormData((prev) => ({
      ...prev,
      method,
      // Clear method-specific fields
      bankAccountNumber: undefined,
      bankRoutingNumber: undefined,
      bankAccountHolderName: undefined,
      paypalEmail: undefined,
    }));
    setFormErrors({});
    setTouched({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      amount: true,
      method: true,
      bankAccountNumber: true,
      bankRoutingNumber: true,
      bankAccountHolderName: true,
      paypalEmail: true,
    });

    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      const amount = parseFloat(formData.amount);
      
      const payload: any = {
        amount,
        method: formData.method,
      };

      // Add method-specific details
      if (formData.method === WithdrawalMethod.BANK_TRANSFER) {
        payload.bankDetails = {
          accountNumber: formData.bankAccountNumber,
          routingNumber: formData.bankRoutingNumber,
          accountHolderName: formData.bankAccountHolderName,
        };
      }

      if (formData.method === WithdrawalMethod.PAYPAL) {
        payload.paypalEmail = formData.paypalEmail;
      }

      await createWithdrawal(payload);
      
      // Reset form
      setFormData({
        amount: '',
        method: WithdrawalMethod.STRIPE,
      });
      setFormErrors({});
      setTouched({});
      setShowConfirmation(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Withdrawal request failed:', err);
      setShowConfirmation(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  // Check if form can be submitted
  const isFormDisabled = !canWithdraw || loading;

  // Get fee percentage for display
  const getFeePercentage = (method: WithdrawalMethod): string => {
    switch (method) {
      case WithdrawalMethod.STRIPE:
      case WithdrawalMethod.PAYPAL:
        return '2.9% + $0.30';
      case WithdrawalMethod.BANK_TRANSFER:
        return '2%';
      default:
        return '';
    }
  };

  if (showConfirmation) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Confirm Withdrawal
          </h3>
          <p className="text-gray-600 text-sm">
            Please review your withdrawal details before confirming
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Withdrawal Amount:</span>
            <span className="text-lg font-semibold text-gray-900">
              ${parseFloat(formData.amount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Processing Fee:</span>
            <span className="text-gray-900">
              ${calculatedFee.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-gray-900 font-medium">You'll Receive:</span>
            <span className="text-xl font-bold text-green-600">
              ${netAmount.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Method:</span>
              <span className="text-gray-900 font-medium">
                {formData.method === WithdrawalMethod.STRIPE && 'Stripe Transfer'}
                {formData.method === WithdrawalMethod.BANK_TRANSFER && 'Bank Transfer'}
                {formData.method === WithdrawalMethod.PAYPAL && 'PayPal'}
              </span>
            </div>
            {formData.method === WithdrawalMethod.BANK_TRANSFER && formData.bankAccountNumber && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Account:</span>
                <span className="text-gray-900">
                  ****{formData.bankAccountNumber.slice(-4)}
                </span>
              </div>
            )}
            {formData.method === WithdrawalMethod.PAYPAL && formData.paypalEmail && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">PayPal Email:</span>
                <span className="text-gray-900">{formData.paypalEmail}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Processing Time:</strong> Withdrawals typically take 2-5 business days to complete.
            You'll receive an email notification when your funds are on the way.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleCancelConfirmation}
            disabled={loading}
            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
          >
            {loading ? 'Processing...' : 'Confirm Withdrawal'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Request Withdrawal
        </h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Available Balance:</span>
          <span className="text-lg font-semibold text-green-600">
            {formattedAvailableBalance}
          </span>
        </div>
      </div>

      {!canWithdraw && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-amber-900 mb-1">Withdrawals Not Available</p>
              <p className="text-sm text-amber-800">
                {!stripeEnabled
                  ? 'Please complete your Stripe account setup to enable withdrawals.'
                  : 'You need a minimum balance of $10.00 to request a withdrawal.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-red-900 mb-1">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              disabled={isFormDisabled}
              className={`block w-full pl-7 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.amount && touched.amount
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              } ${isFormDisabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          {formErrors.amount && touched.amount && (
            <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
          )}
          {constraints?.minimumAmount && (
            <p className="mt-1 text-xs text-gray-500">
              Minimum withdrawal: ${constraints.minimumAmount.toFixed(2)}
            </p>
          )}
        </div>

        {/* Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Withdrawal Method
          </label>
          <div className="space-y-3">
            {/* Stripe */}
            <label
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.method === WithdrawalMethod.STRIPE
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="method"
                value={WithdrawalMethod.STRIPE}
                checked={formData.method === WithdrawalMethod.STRIPE}
                onChange={() => handleMethodChange(WithdrawalMethod.STRIPE)}
                disabled={isFormDisabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">Stripe Transfer</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {getFeePercentage(WithdrawalMethod.STRIPE)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Fast and secure transfer via Stripe. Funds typically arrive in 2-3 business days.
                </p>
              </div>
            </label>

            {/* Bank Transfer */}
            <label
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.method === WithdrawalMethod.BANK_TRANSFER
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="method"
                value={WithdrawalMethod.BANK_TRANSFER}
                checked={formData.method === WithdrawalMethod.BANK_TRANSFER}
                onChange={() => handleMethodChange(WithdrawalMethod.BANK_TRANSFER)}
                disabled={isFormDisabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">Bank Transfer</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {getFeePercentage(WithdrawalMethod.BANK_TRANSFER)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Direct transfer to your bank account. Takes 3-5 business days.
                </p>
              </div>
            </label>

            {/* PayPal */}
            <label
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.method === WithdrawalMethod.PAYPAL
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="method"
                value={WithdrawalMethod.PAYPAL}
                checked={formData.method === WithdrawalMethod.PAYPAL}
                onChange={() => handleMethodChange(WithdrawalMethod.PAYPAL)}
                disabled={isFormDisabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">PayPal</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {getFeePercentage(WithdrawalMethod.PAYPAL)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Transfer to your PayPal account. Usually processed within 1-2 business days.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Bank Transfer Fields */}
        {formData.method === WithdrawalMethod.BANK_TRANSFER && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 text-sm mb-3">Bank Account Details</h4>
            
            <div>
              <label htmlFor="accountHolder" className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                id="accountHolder"
                placeholder="John Doe"
                value={formData.bankAccountHolderName || ''}
                onChange={(e) => handleInputChange('bankAccountHolderName', e.target.value)}
                disabled={isFormDisabled}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.bankAccountHolderName && touched.bankAccountHolderName
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {formErrors.bankAccountHolderName && touched.bankAccountHolderName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.bankAccountHolderName}</p>
              )}
            </div>

            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                id="accountNumber"
                placeholder="123456789"
                value={formData.bankAccountNumber || ''}
                onChange={(e) => handleInputChange('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
                disabled={isFormDisabled}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.bankAccountNumber && touched.bankAccountNumber
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {formErrors.bankAccountNumber && touched.bankAccountNumber && (
                <p className="mt-1 text-sm text-red-600">{formErrors.bankAccountNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Routing Number
              </label>
              <input
                type="text"
                id="routingNumber"
                placeholder="021000021"
                maxLength={9}
                value={formData.bankRoutingNumber || ''}
                onChange={(e) => handleInputChange('bankRoutingNumber', e.target.value.replace(/\D/g, ''))}
                disabled={isFormDisabled}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.bankRoutingNumber && touched.bankRoutingNumber
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {formErrors.bankRoutingNumber && touched.bankRoutingNumber && (
                <p className="mt-1 text-sm text-red-600">{formErrors.bankRoutingNumber}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">9-digit routing number (ABA number)</p>
            </div>
          </div>
        )}

        {/* PayPal Field */}
        {formData.method === WithdrawalMethod.PAYPAL && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 text-sm mb-3">PayPal Account</h4>
            <div>
              <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                PayPal Email Address
              </label>
              <input
                type="email"
                id="paypalEmail"
                placeholder="your-email@example.com"
                value={formData.paypalEmail || ''}
                onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
                disabled={isFormDisabled}
                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.paypalEmail && touched.paypalEmail
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                } ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {formErrors.paypalEmail && touched.paypalEmail && (
                <p className="mt-1 text-sm text-red-600">{formErrors.paypalEmail}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter the email address associated with your PayPal account
              </p>
            </div>
          </div>
        )}

        {/* Fee Calculation Display */}
        {formData.amount && !isNaN(parseFloat(formData.amount)) && parseFloat(formData.amount) > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Withdrawal Amount:</span>
                <span className="font-medium text-gray-900">${parseFloat(formData.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Processing Fee ({getFeePercentage(formData.method)}):</span>
                <span className="font-medium text-gray-900">-${calculatedFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-300 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">You'll Receive:</span>
                <span className="font-bold text-green-600 text-base">${netAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isFormDisabled}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Review Withdrawal'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WithdrawalRequestForm;
