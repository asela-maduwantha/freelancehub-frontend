import React, { useState } from 'react';
import { ProposalResponse } from '@/lib/api/proposals';
import { CreateContractRequest, contractService } from '@/lib/api/contracts';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Feedback';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposalResponse;
  onContractCreated?: () => void;
}

const CreateContractModal: React.FC<CreateContractModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onContractCreated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    terms: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        throw new Error('End date must be after start date');
      }

      if (startDate < new Date()) {
        throw new Error('Start date cannot be in the past');
      }

      const contractData: CreateContractRequest = {
        proposalId: proposal._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        terms: formData.terms || undefined
      };

      await contractService.createContract(contractData);
      
      // Call the callback to refresh the proposals
      if (onContractCreated) {
        onContractCreated();
      }
      
      // Reset form and close modal
      setFormData({ startDate: '', endDate: '', terms: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create contract');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ startDate: '', endDate: '', terms: '' });
      setError(null);
      onClose();
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-primary">Create Contract</h2>
            <p className="text-secondary mt-1">
              Create a contract for the accepted proposal
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ✕
          </Button>
        </div>

        {/* Proposal Summary */}
        <div className="bg-light rounded-lg p-4 mb-6">
          <h3 className="font-medium text-primary mb-2">Proposal Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">Proposal ID:</span>
              <span className="text-primary">#{proposal._id.slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Rate:</span>
              <span className="text-emerald font-medium">
                {formatCurrency(proposal.proposedRate.amount, proposal.proposedRate.currency)}
              </span>
            </div>
            {proposal.estimatedDuration && (
              <div className="flex justify-between">
                <span className="text-secondary">Duration:</span>
                <span className="text-primary">
                  {proposal.estimatedDuration.value} {proposal.estimatedDuration.unit}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="alert-warning mb-4 p-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-primary mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="input-default"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-primary mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="input-default"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label htmlFor="terms" className="block text-sm font-medium text-primary mb-2">
              Contract Terms (Optional)
            </label>
            <textarea
              id="terms"
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={4}
              className="input-default resize-none"
              placeholder="Enter any specific terms and conditions for this contract..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !formData.startDate || !formData.endDate}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating Contract...
                </>
              ) : (
                'Create Contract'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateContractModal;