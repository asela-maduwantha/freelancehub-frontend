'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { contractsService } from '@/lib/api';
import { IContract } from '@/lib/types';

interface ContractApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: IContract;
  userRole: 'client' | 'freelancer';
  onApprovalSuccess: (updatedContract: IContract) => void;
}

export default function ContractApprovalModal({
  isOpen,
  onClose,
  contract,
  userRole,
  onApprovalSuccess
}: ContractApprovalModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { approvalWorkflow } = contract;

  const canApprove = () => {
    if (userRole === 'client') {
      return !approvalWorkflow.clientApproved;
    } else {
      return approvalWorkflow.clientApproved && !approvalWorkflow.freelancerApproved;
    }
  };

  const getApprovalStatus = () => {
    if (approvalWorkflow.clientApproved && approvalWorkflow.freelancerApproved) {
      return { status: 'approved', message: 'Contract fully approved and signed!' };
    } else if (approvalWorkflow.clientApproved) {
      return { status: 'client_approved', message: 'Client approved. Waiting for freelancer approval.' };
    } else {
      return { status: 'pending', message: 'Waiting for client approval.' };
    }
  };

  const handleApprove = async () => {
    if (!canApprove()) return;

    setIsApproving(true);
    setError(null);

    try {
      let response;
      if (userRole === 'client') {
        response = await contractsService.clientApproveContract(contract._id);
      } else {
        response = await contractsService.freelancerApproveContract(contract._id);
      }

      if (response.data?.contract) {
        onApprovalSuccess(response.data.contract);
      } else {
        throw new Error('Contract data not found in response');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to approve contract');
    } finally {
      setIsApproving(false);
    }
  };

  const approvalStatus = getApprovalStatus();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 font-poppins">
                Contract Approval
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Contract Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
                  {contract.projectId.title}
                </h3>
                <p className="text-gray-600 mb-4">{contract.projectId.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Budget</span>
                    <p className="text-lg font-semibold text-gray-900">
                      ${contract.terms.budget}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Duration</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(contract.terms.startDate).toLocaleDateString()} - {new Date(contract.terms.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Status */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  {approvalStatus.status === 'approved' && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                  {approvalStatus.status === 'client_approved' && (
                    <Clock className="h-6 w-6 text-blue-500" />
                  )}
                  {approvalStatus.status === 'pending' && (
                    <Clock className="h-6 w-6 text-yellow-500" />
                  )}
                  <span className="text-lg font-medium text-gray-900">
                    {approvalStatus.message}
                  </span>
                </div>

                {/* Approval Steps */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {approvalWorkflow.clientApproved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={`text-sm ${approvalWorkflow.clientApproved ? 'text-green-700' : 'text-gray-500'}`}>
                      Client Approval
                      {approvalWorkflow.clientApproved && approvalWorkflow.clientApprovedAt && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({new Date(approvalWorkflow.clientApprovedAt).toLocaleDateString()})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {approvalWorkflow.freelancerApproved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : approvalWorkflow.clientApproved ? (
                      <Clock className="h-5 w-5 text-blue-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={`text-sm ${approvalWorkflow.freelancerApproved ? 'text-green-700' : approvalWorkflow.clientApproved ? 'text-blue-700' : 'text-gray-500'}`}>
                      Freelancer Approval
                      {approvalWorkflow.freelancerApproved && approvalWorkflow.freelancerApprovedAt && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({new Date(approvalWorkflow.freelancerApprovedAt).toLocaleDateString()})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestones Preview */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3 font-poppins">
                  Contract Milestones
                </h4>
                <div className="space-y-2">
                  {contract.milestones.map((milestone, index) => (
                    <div key={milestone._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{milestone.title}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ${milestone.amount} • Due {new Date(milestone.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {index + 1} of {contract.milestones.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isApproving}
                >
                  {canApprove() ? 'Review Later' : 'Close'}
                </Button>

                {canApprove() && (
                  <Button
                    onClick={handleApprove}
                    variant="premium"
                    disabled={isApproving}
                    className="min-w-[120px]"
                  >
                    {isApproving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Approving...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Contract
                      </div>
                    )}
                  </Button>
                )}

                {approvalWorkflow.clientApproved && approvalWorkflow.freelancerApproved && (
                  <Button
                    variant="premium"
                    className="min-w-[120px]"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View PDF
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
