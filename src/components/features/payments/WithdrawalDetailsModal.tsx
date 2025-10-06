'use client';

import React from 'react';
import Modal from '@/components/ui/Modal/Modal';
import { Withdrawal } from '@/types/withdrawals';
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClasses,
  getStatusLabel,
  maskStripeAccountId,
} from '@/lib/utils/withdrawal.utils';

interface WithdrawalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: Withdrawal | null;
}

const WithdrawalDetailsModal: React.FC<WithdrawalDetailsModalProps> = ({
  isOpen,
  onClose,
  withdrawal,
}) => {
  if (!withdrawal) {
    return null;
  }

  const freelancerName =
    typeof withdrawal.freelancerId === 'object'
      ? `${withdrawal.freelancerId.firstName} ${withdrawal.freelancerId.lastName}`
      : 'N/A';

  const getStatusConfig = (status: string) => {
    const configs: Record<string, string> = {
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-amber-100 text-amber-800 border-amber-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      failed: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return configs[status] || configs.pending;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Withdrawal Details">
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-blue-900">
            Withdrawal #{String(withdrawal.id).slice(-8)}
          </h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-lg font-medium text-sm border ${getStatusConfig(withdrawal.status)}`}>
            {getStatusLabel(withdrawal.status)}
          </span>
        </div>

        {/* Error Message if Failed */}
        {withdrawal.status === 'failed' && withdrawal.errorMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Withdrawal Failed
                </p>
                <p className="text-sm text-blue-800">
                  {withdrawal.errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Amount Breakdown */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-blue-900 mb-3">
            Amount Breakdown
          </h4>
          <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-200">
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">
                Requested Amount:
              </span>
              <span className="text-sm font-semibold text-blue-900">
                {formatCurrency(withdrawal.amount, withdrawal.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">
                Processing Fee (2.9% + $0.30):
              </span>
              <span className="text-sm text-blue-900">
                -{formatCurrency(withdrawal.processingFee, withdrawal.currency)}
              </span>
            </div>
            <div className="border-t border-blue-200 pt-2">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-blue-900">
                  Final Amount:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(withdrawal.finalAmount, withdrawal.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-blue-900 mb-3">
            Payment Information
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-blue-100">
              <span className="text-sm text-blue-700">
                Payment Method:
              </span>
              <span className="text-sm font-medium text-blue-900">
                Stripe Transfer
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100">
              <span className="text-sm text-blue-700">
                Stripe Account:
              </span>
              <span className="text-sm font-mono text-blue-900">
                {maskStripeAccountId(withdrawal.stripeAccountId)}
              </span>
            </div>
            {withdrawal.stripeTransferId && (
              <div className="flex justify-between py-2 border-b border-blue-100">
                <span className="text-sm text-blue-700">
                  Transaction ID:
                </span>
                <span className="text-sm font-mono text-blue-900">
                  {withdrawal.stripeTransferId}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-sm text-blue-700">
                Freelancer:
              </span>
              <span className="text-sm font-medium text-blue-900">
                {freelancerName}
              </span>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-blue-900 mb-3">
            Status Timeline
          </h4>
          <div className="space-y-3">
            {/* Requested */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Requested
                </p>
                <p className="text-xs text-blue-600">
                  {formatDate(withdrawal.requestedAt)}
                </p>
              </div>
            </div>

            {/* Processing */}
            {withdrawal.processedAt && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Processing
                  </p>
                  <p className="text-xs text-blue-600">
                    {formatDate(withdrawal.processedAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Completed */}
            {withdrawal.completedAt && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Completed
                  </p>
                  <p className="text-xs text-blue-600">
                    {formatDate(withdrawal.completedAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Failed */}
            {withdrawal.failedAt && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Failed</p>
                  <p className="text-xs text-blue-600">
                    {formatDate(withdrawal.failedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {withdrawal.description && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Description
            </h4>
            <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
              {withdrawal.description}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-blue-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawalDetailsModal;