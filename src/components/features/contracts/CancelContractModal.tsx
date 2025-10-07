'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button';
import { AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { ContractResponse } from '@/lib/api/contracts';

interface CancelContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  contract: ContractResponse | null;
  isAdmin?: boolean;
  userRole: 'client' | 'freelancer' | 'admin';
}

const CancelContractModal: React.FC<CancelContractModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contract,
  isAdmin = false,
  userRole
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (isAdmin && !reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(isAdmin ? reason : undefined);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel contract');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  if (!contract) return null;

  const isActiveContract = contract.status === 'active';
  const unreleaseAmount = (contract.totalPaid || 0) - (contract.releasedAmount || 0);
  const showRefundWarning = isActiveContract && unreleaseAmount > 0;

  const getWarningMessage = () => {
    if (isActiveContract) {
      return showRefundWarning 
        ? `Cancelling this active contract will refund ${formatCurrency(unreleaseAmount, contract.currency)} in unreleased payments to the client.`
        : 'Cancelling this active contract will mark it as cancelled.';
    }
    return 'Are you sure you want to cancel this contract? This action cannot be undone.';
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={isAdmin ? 'Admin Contract Cancellation' : 'Cancel Contract'} 
      size="md"
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className={`p-4 rounded-lg border-l-4 ${
          showRefundWarning 
            ? 'bg-orange-50 border-orange-500' 
            : 'bg-yellow-50 border-yellow-500'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              showRefundWarning ? 'text-orange-600' : 'text-yellow-600'
            }`} />
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${
                showRefundWarning ? 'text-orange-900' : 'text-yellow-900'
              }`}>
                Warning: Contract Cancellation
              </h4>
              <p className={`text-sm mt-1 ${
                showRefundWarning ? 'text-orange-700' : 'text-yellow-700'
              }`}>
                {getWarningMessage()}
              </p>
            </div>
          </div>
        </div>

        {/* Contract Details */}
        <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Contract Title:</span>
            <span className="text-sm font-medium text-gray-900">{contract.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status:</span>
            <span className="text-sm font-medium text-gray-900 capitalize">{contract.status}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(contract.totalAmount, contract.currency)}
            </span>
          </div>
          {showRefundWarning && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Paid:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(contract.totalPaid, contract.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Released Amount:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(contract.releasedAmount || 0, contract.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                <span className="text-sm font-semibold text-orange-600">Refund Amount:</span>
                <span className="text-sm font-bold text-orange-600">
                  {formatCurrency(unreleaseAmount, contract.currency)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Admin Reason Input */}
        {isAdmin && (
          <div>
            <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cancellation-reason"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
              placeholder="Please provide a detailed reason for cancelling this contract..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              required
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>
        )}

        {/* Confirmation Message */}
        {!isAdmin && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              By clicking <strong>&quot;Cancel Contract&quot;</strong>, you confirm that you want to proceed with cancelling this contract.
              {showRefundWarning && ' The client will be automatically refunded.'}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && !isAdmin && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2"
          >
            Keep Contract
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 px-4 py-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                {isAdmin ? 'Cancel Contract' : isActiveContract && showRefundWarning ? 'Cancel & Refund' : 'Cancel Contract'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelContractModal;
