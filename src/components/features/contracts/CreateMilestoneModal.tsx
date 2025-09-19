import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContractResponse, CreateMilestoneRequest, contractService } from '@/lib/api/contracts';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Feedback';

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractResponse;
  onMilestoneCreated?: () => void;
}

const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({
  isOpen,
  onClose,
  contract,
  onMilestoneCreated
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: ''
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
      // Validate form data
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const dueDate = new Date(formData.dueDate);
      if (dueDate < new Date()) {
        throw new Error('Due date cannot be in the past');
      }

      const milestoneData: CreateMilestoneRequest = {
        contractId: contract._id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: amount,
        currency: contract.currency,
        order: contract.milestoneCount + 1, // Next milestone order
        dueDate: dueDate.toISOString()
      };

      const response = await contractService.createMilestone(milestoneData);
      
      // Call the callback to refresh the contracts
      if (onMilestoneCreated) {
        onMilestoneCreated();
      }
      
      // Reset form and close modal
      setFormData({ title: '', description: '', amount: '', dueDate: '' });
      onClose();
      
      // Navigate to the contract milestones page
      router.push(`/client/contracts/${contract._id}/milestones`);
    } catch (err: any) {
      setError(err.message || 'Failed to create milestone');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ title: '', description: '', amount: '', dueDate: '' });
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

  const getRemainingAmount = () => {
    return contract.totalAmount - contract.totalPaid;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-primary">Create Milestone</h2>
            <p className="text-secondary mt-1">
              Add a new milestone to track progress
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

        {/* Contract Summary */}
        <div className="bg-light rounded-lg p-4 mb-6">
          <h3 className="font-medium text-primary mb-2">Contract Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">Contract:</span>
              <span className="text-primary font-medium">{contract.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Total Amount:</span>
              <span className="text-emerald font-medium">
                {formatCurrency(contract.totalAmount, contract.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Amount Paid:</span>
              <span className="text-primary">
                {formatCurrency(contract.totalPaid, contract.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Remaining:</span>
              <span className="text-accent font-medium">
                {formatCurrency(getRemainingAmount(), contract.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Existing Milestones:</span>
              <span className="text-primary">{contract.milestoneCount}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert-warning mb-4 p-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-primary mb-2">
              Milestone Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="input-default"
              placeholder="Enter milestone title..."
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-primary mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              rows={3}
              className="input-default resize-none"
              placeholder="Describe what needs to be completed for this milestone..."
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-primary mb-2">
                Amount ({contract.currency}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="input-default"
                placeholder="0.00"
                min="0.01"
                max={getRemainingAmount()}
                step="0.01"
              />
              <p className="text-xs text-muted mt-1">
                Maximum: {formatCurrency(getRemainingAmount(), contract.currency)}
              </p>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-primary mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="input-default"
                min={new Date().toISOString().split('T')[0]}
                max={contract.endDate.split('T')[0]}
              />
              <p className="text-xs text-muted mt-1">
                Contract ends: {new Date(contract.endDate).toLocaleDateString()}
              </p>
            </div>
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
              disabled={isLoading || !formData.title || !formData.description || !formData.amount || !formData.dueDate}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating Milestone...
                </>
              ) : (
                'Create Milestone'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateMilestoneModal;