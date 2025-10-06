'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import { withdrawalAPI } from '@/lib/api/withdrawals';
import {
  calculateWithdrawalFee,
  formatCurrency,
  validateWithdrawalAmount,
  getErrorMessage,
} from '@/lib/utils/withdrawal.utils';

interface CreateWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  stripeAccountId: string;
  onSuccess: () => void;
}

const CreateWithdrawalModal: React.FC<CreateWithdrawalModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  stripeAccountId,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdWithdrawalId, setCreatedWithdrawalId] = useState<string | null>(null);

  // Generate idempotency key once when modal opens
  const idempotencyKey = useMemo(() => uuidv4(), [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setError(null);
      setValidationError(null);
      setShowSuccess(false);
      setCreatedWithdrawalId(null);
    }
  }, [isOpen]);

  // Calculate fee in real-time
  const feeCalculation = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return null;
    }
    return calculateWithdrawalFee(numAmount);
  }, [amount]);

  // Validate amount on change
  useEffect(() => {
    if (!amount || amount === '') {
      setValidationError(null);
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter a valid amount');
      return;
    }

    const validation = validateWithdrawalAmount(numAmount, availableBalance);
    setValidationError(validation.isValid ? null : validation.error || null);
  }, [amount, availableBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);

    // Final validation
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter a valid amount');
      return;
    }

    const validation = validateWithdrawalAmount(numAmount, availableBalance);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const withdrawal = await withdrawalAPI.createWithdrawal({
        amount: numAmount,
        method: 'stripe',
        stripeAccountId,
        description: description.trim() || undefined,
        idempotencyKey,
      });

      setCreatedWithdrawalId(withdrawal.id);
      setShowSuccess(true);

      // Auto-close and refresh after 3 seconds
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create withdrawal';
      setError(getErrorMessage(errorMsg));
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleQuickAmount = (percent: number) => {
    const quickAmount = (availableBalance * percent).toFixed(2);
    setAmount(quickAmount);
  };

  // Success state
  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md" title="Withdrawal Requested">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-blue-900 mb-2">
            Withdrawal Submitted!
          </h3>
          <p className="text-blue-700 mb-4">
            Your withdrawal request has been successfully submitted.
          </p>

          {createdWithdrawalId && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">
                Withdrawal ID:
              </p>
              <p className="text-sm font-mono text-blue-900">
                #{String(createdWithdrawalId).slice(-8)}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Your withdrawal will be processed within 1-2 business days. You'll receive the
              funds in your Stripe account.
            </p>
          </div>

          <p className="text-xs text-blue-600">
            Redirecting to withdrawal history...
          </p>
        </div>
      </Modal>
    );
  }

  // Form state
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" title="Withdraw Funds">
      <form onSubmit={handleSubmit} className="p-6">
        {/* Available Balance Display */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">
              Available Balance:
            </span>
            <span className="text-xl font-bold text-blue-900">
              {formatCurrency(availableBalance)}
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium text-blue-900 mb-2">
            Withdrawal Amount <span className="text-blue-600">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 font-semibold text-lg">
              $
            </span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={availableBalance}
              disabled={isSubmitting}
              className={`w-full pl-8 pr-4 py-3 border rounded-lg bg-white text-blue-900 font-semibold text-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                validationError ? 'border-blue-600' : 'border-blue-200'
              }`}
            />
          </div>
          {validationError && (
            <p className="mt-2 text-sm text-blue-800">{validationError}</p>
          )}

          {/* Quick Amount Buttons */}
          <div className="mt-3 flex gap-2">
            {[0.25, 0.5, 0.75, 1].map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => handleQuickAmount(percent)}
                disabled={isSubmitting}
                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {percent === 1 ? 'Max' : `${percent * 100}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Fee Calculation Display */}
        {feeCalculation && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">
              Fee Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Withdrawal Amount:</span>
                <span className="font-semibold text-blue-900">
                  {formatCurrency(parseFloat(amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Processing Fee (2.9% + $0.30):</span>
                <span className="text-blue-900">
                  -{formatCurrency(feeCalculation.fee)}
                </span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-semibold text-blue-900">You'll Receive:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(feeCalculation.finalAmount)}
                </span>
              </div>
            </div>

            {!feeCalculation.meetsMinimum && (
              <div className="mt-3 p-2 bg-amber-100 border border-amber-200 rounded">
                <p className="text-xs text-amber-800">
                  Minimum withdrawal after fees is $10.00
                </p>
              </div>
            )}
          </div>
        )}

        {/* Description Input */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-blue-900 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a note about this withdrawal..."
            rows={3}
            maxLength={200}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-blue-200 rounded-lg bg-white text-blue-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          <p className="mt-1 text-xs text-blue-600">
            {description.length}/200 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-800">{error}</p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !amount ||
              !!validationError ||
              !feeCalculation ||
              !feeCalculation.meetsMinimum
            }
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </div>
            ) : (
              'Confirm Withdrawal'
            )}
          </Button>
        </div>

        {/* Info Note */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Withdrawals are processed within 1-2 business days. A 2.9%
            + $0.30 processing fee applies. Minimum withdrawal after fees is $10.00.
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWithdrawalModal;