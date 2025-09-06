'use client';

import { useState } from 'react';
import { usePaymentStore } from '../../lib/stores/payment.store';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { AlertTriangle, FileText, MessageSquare } from 'lucide-react';

interface RefundRequestModalProps {
  paymentId: string;
  paymentAmount: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RefundRequestModal({
  paymentId,
  paymentAmount,
  onClose,
  onSuccess
}: RefundRequestModalProps) {
  const { requestRefund, isLoading, error } = usePaymentStore();
  const [reason, setReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      return;
    }

    try {
      await requestRefund(paymentId, reason + (additionalDetails ? `\n\nAdditional details: ${additionalDetails}` : ''));
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Refund request failed:', error);
    }
  };

  const refundReasons = [
    'Project cancelled',
    'Work not completed as agreed',
    'Quality issues',
    'Communication problems',
    'Freelancer unresponsive',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Request Refund</h2>
          </div>

          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800">
              <strong>Payment Amount:</strong> ${paymentAmount.toFixed(2)}
            </p>
            <p className="text-xs text-orange-700 mt-1">
              Refunds are subject to review and may take 3-5 business days to process.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Refund
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a reason...</option>
                {refundReasons.map((refundReason) => (
                  <option key={refundReason} value={refundReason}>
                    {refundReason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Please provide more details about why you're requesting a refund..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !reason.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Request Refund'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Our team will review your request</li>
                  <li>We'll contact both parties if needed</li>
                  <li>You'll receive an email with the decision</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
