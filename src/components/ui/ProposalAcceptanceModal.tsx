'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, FileText, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { clientAPI } from '@/lib/api';
import { Contract } from '@/lib/api/types';

interface ProposalAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  proposalId: string;
  onSuccess: (contract: Contract) => void;
}

export default function ProposalAcceptanceModal({
  isOpen,
  onClose,
  projectId,
  proposalId,
  onSuccess
}: ProposalAcceptanceModalProps) {
  const [message, setMessage] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!message.trim()) {
      setError('Please enter a message for the freelancer');
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      const response = await clientAPI.acceptProposal(projectId, proposalId, message.trim());
      onSuccess(response.contract);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to accept proposal');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 font-poppins">
                Accept Proposal
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
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-lg font-medium text-gray-900">
                    You're about to accept this proposal
                  </span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        What happens next?
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• A contract will be automatically created</li>
                        <li>• You'll need to approve the contract first</li>
                        <li>• The freelancer will then review and approve</li>
                        <li>• Once both parties approve, a PDF will be generated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to Freelancer <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Express your excitement about working together and any specific expectations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be sent to the freelancer along with the contract
                </p>
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
                  disabled={isAccepting}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleAccept}
                  variant="premium"
                  disabled={isAccepting || !message.trim()}
                  className="min-w-[120px]"
                >
                  {isAccepting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Accepting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Proposal
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
