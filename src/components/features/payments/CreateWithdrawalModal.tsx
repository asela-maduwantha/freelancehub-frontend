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

      setCreatedWithdrawalId(withdrawal._id);
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

  // Success state
  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md" title="Withdrawal Requested">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-secondary-light rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-secondary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Withdrawal Submitted!
          </h3>
          <p className="text-gray-600 mb-4">
            Your withdrawal request has been successfully submitted.
          </p>

          {createdWithdrawalId && (
            <div className="bg-primary-50 rounded-lg p-4 mb-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">
                Withdrawal ID:
              </p>
              <p className="text-sm font-mono text-gray-900">
                #{String(createdWithdrawalId).slice(-8)}
              </p>
            </div>
          )}

          <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-primary">
              Your withdrawal will be processed within 1-2 business days. You'll receive the
              funds in your Stripe account.
            </p>
          </div>

          <p className="text-xs text-gray-500">
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
        <div className="mb-6 p-4 bg-primary-50 border border-primary-100 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              Available Balance:
            </span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(availableBalance)}
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Withdrawal Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
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
              className={`w-full pl-8 pr-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                validationError
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            />
          </div>
          {validationError && (
            <p className="mt-2 text-sm text-red-600">{validationError}</p>
          )}

          {/* Quick Amount Buttons */}
          <div className="mt-3 flex gap-2">
            {[25, 50, 100].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                disabled={isSubmitting || quickAmount > availableBalance}
                className="px-3 py-1 text-xs font-medium text-primary border border-primary-100 rounded-md hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ${quickAmount}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount(availableBalance.toFixed(2))}
              disabled={isSubmitting}
              className="px-3 py-1 text-xs font-medium text-primary border border-primary-100 rounded-md hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Max
            </button>
          </div>
        </div>

        {/* Fee Calculation Display */}
        {feeCalculation && (
          <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(feeCalculation.fee)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">
                  You'll Receive:
                </span>
                <span className="text-lg font-bold text-secondary">
                  {formatCurrency(feeCalculation.finalAmount)}
                </span>
              </div>
            </div>

            {!feeCalculation.meetsMinimum && (
              <div className="mt-3 p-2 bg-accent-light border border-accent rounded">
                <p className="text-xs text-gray-700">
                  ⚠️ Minimum withdrawal after fees is $10.00
                </p>
              </div>
            )}
          </div>
        )}

        {/* Description Input */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Invoice #1234"
            rows={3}
            maxLength={200}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {description.length}/200 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            variant="secondary"
            className="flex-1"
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
            variant="primary"
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              'Confirm Withdrawal'
            )}
          </Button>
        </div>

        {/* Info Note */}
        <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> Withdrawals are processed within 1-2 business days. A 2.9%
            + $0.30 processing fee applies. Minimum withdrawal after fees is $10.00.
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWithdrawalModal;
