'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ProposalResponse, proposalService } from '../../../../../../lib/api/proposals';
import { JobResponse, jobService } from '../../../../../../lib/api/jobs';
import { CreateContractRequest, CreateContractMilestoneRequest, contractService } from '../../../../../../lib/api/contracts';
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout';
import Button from '../../../../../../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../../../../components/ui/Card';
import { Spinner } from '../../../../../../components/ui/Feedback';
import { Badge } from '../../../../../../components/ui/Display';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface MilestoneFormData {
  id: string;
  title: string;
  description: string;
  amount: number;
  durationDays: number;
  isSelected: boolean;
  column: 'proposal' | 'custom' | 'contract';
  isFromProposal?: boolean; // To distinguish proposal vs custom milestones
}

// Add Milestone Modal Component
interface AddMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (milestone: Omit<MilestoneFormData, 'id' | 'isSelected' | 'column'>) => void;
  isSubmitting: boolean;
  formatCurrency: (amount: number, currency?: string) => string;
}

function AddMilestoneModal({ isOpen, onClose, onAdd, isSubmitting, formatCurrency }: AddMilestoneModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: 0,
    durationDays: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onAdd({
      ...formData,
      isFromProposal: false,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      amount: 0,
      durationDays: 1,
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      amount: 0,
      durationDays: 1,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-primary">Add New Milestone</h3>
            <button
              onClick={handleClose}
              className="text-secondary hover:text-primary transition-colors"
              disabled={isSubmitting}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Milestone Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-default w-full"
                placeholder="e.g., Design Phase, Development, Testing..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-default w-full resize-none"
                rows={3}
                placeholder="Describe what will be delivered in this milestone..."
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="input-default w-full"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationDays: parseInt(e.target.value) || 1 }))}
                  className="input-default w-full"
                  min="1"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {formData.amount > 0 && (
              <div className="text-sm text-secondary">
                Amount: <span className="font-semibold text-primary">{formatCurrency(formData.amount)}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !formData.title.trim()}
                className="flex-1"
              >
                {isSubmitting ? 'Adding...' : 'Add Milestone'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Droppable Column Component
interface DroppableColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: React.ReactNode;
}

function DroppableColumn({ id, title, color, count, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div
        ref={setNodeRef}
        className={`bg-secondary rounded-lg p-4 h-96 transition-all duration-200 overflow-y-auto ${
          isOver ? 'ring-2 ring-primary ring-opacity-50 bg-primary bg-opacity-5' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-light">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <h4 className="font-medium text-primary">{title}</h4>
            <span className="text-xs text-secondary bg-light px-2 py-1 rounded-full">
              {count}
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
interface SortableMilestoneCardProps {
  milestone: MilestoneFormData;
  index: number;
  onChange: (index: number, field: keyof MilestoneFormData, value: any) => void;
  onRemove: (index: number) => void;
  isSubmitting: boolean;
  formatCurrency: (amount: number, currency?: string) => string;
}

function SortableMilestoneCard({
  milestone,
  index,
  onChange,
  onRemove,
  isSubmitting,
  formatCurrency
}: SortableMilestoneCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card-default p-3 cursor-move w-64 flex-shrink-0 ${
        isDragging ? 'opacity-50 shadow-lg scale-105 rotate-2' : ''
      } ${!milestone.isSelected && milestone.column === 'contract' ? 'opacity-60' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-primary">
            #{index}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-xs font-semibold" style={{color: 'var(--color-success)'}}>
            {formatCurrency(milestone.amount)}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e?.stopPropagation();
              onRemove(index);
            }}
            disabled={isSubmitting}
            className="text-error hover:text-error hover:bg-error-light p-0.5"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          {milestone.column === 'contract' ? (
            <input
              type="text"
              value={milestone.title}
              onChange={(e) => onChange(index, 'title', e.target.value)}
              className="input-default text-xs w-full"
              placeholder="Milestone title"
              disabled={isSubmitting}
            />
          ) : (
            <div className="text-xs font-medium text-primary line-clamp-2">
              {milestone.title || 'Untitled Milestone'}
            </div>
          )}
        </div>

        <div>
          {milestone.column === 'contract' ? (
            <textarea
              value={milestone.description}
              onChange={(e) => onChange(index, 'description', e.target.value)}
              className="input-default text-xs w-full resize-none"
              rows={2}
              placeholder="Milestone description"
              disabled={isSubmitting}
            />
          ) : (
            <div className="text-xs text-secondary line-clamp-3">
              {milestone.description || 'No description provided'}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {milestone.column === 'contract' ? (
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1">
                <input
                  type="number"
                  value={milestone.amount}
                  onChange={(e) => onChange(index, 'amount', parseFloat(e.target.value) || 0)}
                  className="input-default text-xs w-full"
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={milestone.durationDays}
                  onChange={(e) => onChange(index, 'durationDays', parseInt(e.target.value) || 1)}
                  className="input-default text-xs w-full"
                  placeholder="Days"
                  min="1"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <svg className="h-3 w-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-secondary">{milestone.durationDays} days</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-light">
          <div className="flex items-center gap-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              milestone.column === 'contract'
                ? 'bg-success-light text-success'
                : 'bg-secondary text-secondary'
            }`}>
              {milestone.column === 'contract' ? 'In Contract' : 'Available'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-secondary">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Drag</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateContractPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;
  const proposalId = searchParams.get('proposalId');

  const [job, setJob] = useState<JobResponse | null>(null);
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [terms, setTerms] = useState('');
  const [milestones, setMilestones] = useState<MilestoneFormData[]>([]);

  // Modal state
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active milestone
    const activeMilestone = milestones.find(m => m.id === activeId);
    if (!activeMilestone) return;

    // If dropping on a column header
    if (overId === 'proposal-column' || overId === 'custom-column' || overId === 'contract-column') {
      const columnMap: { [key: string]: 'proposal' | 'custom' | 'contract' } = {
        'proposal-column': 'proposal',
        'custom-column': 'custom',
        'contract-column': 'contract'
      };
      const newColumn = columnMap[overId];
      if (activeMilestone.column !== newColumn) {
        setMilestones(prev => prev.map(m =>
          m.id === activeId
            ? { ...m, column: newColumn, isSelected: newColumn === 'contract' }
            : m
        ));
      }
      return;
    }

    // If dropping on another milestone
    const overMilestone = milestones.find(m => m.id === overId);
    if (overMilestone) {
      // If moving within the same column, reorder
      if (activeMilestone.column === overMilestone.column) {
        setMilestones((items) => {
          const columnItems = items.filter(m => m.column === activeMilestone.column);
          const otherItems = items.filter(m => m.column !== activeMilestone.column);

          const activeIndex = columnItems.findIndex((item) => item.id === activeId);
          const overIndex = columnItems.findIndex((item) => item.id === overId);

          const reorderedColumn = arrayMove(columnItems, activeIndex, overIndex);

          return [...otherItems, ...reorderedColumn].sort((a, b) => {
            // Sort by column first, then by original order
            const columnOrder = { proposal: 0, custom: 1, contract: 2 };
            if (columnOrder[a.column] !== columnOrder[b.column]) {
              return columnOrder[a.column] - columnOrder[b.column];
            }
            return 0; // Keep original order within columns
          });
        });
      } else {
        // Moving between columns - insert at the position of the over milestone
        setMilestones((items) => {
          const sourceColumnItems = items.filter(m => m.column === activeMilestone.column);
          const targetColumnItems = items.filter(m => m.column === overMilestone.column);
          const otherItems = items.filter(m => m.column !== activeMilestone.column && m.column !== overMilestone.column);

          // Remove the active item from source column
          const updatedSourceColumn = sourceColumnItems.filter(m => m.id !== activeId);

          // Find the position in target column where to insert
          const overIndexInTarget = targetColumnItems.findIndex((item) => item.id === overId);

          // Insert the active item at the correct position in target column
          const updatedTargetColumn = [
            ...targetColumnItems.slice(0, overIndexInTarget),
            { ...activeMilestone, column: overMilestone.column, isSelected: overMilestone.column === 'contract' },
            ...targetColumnItems.slice(overIndexInTarget)
          ];

          return [...otherItems, ...updatedSourceColumn, ...updatedTargetColumn].sort((a, b) => {
            // Sort by column first, then by position within column
            const columnOrder = { proposal: 0, custom: 1, contract: 2 };
            if (columnOrder[a.column] !== columnOrder[b.column]) {
              return columnOrder[a.column] - columnOrder[b.column];
            }
            // For same column, maintain the order we just set
            return 0;
          });
        });
      }
      return;
    }
  };

  // Initialize milestones from proposal
  const initializeMilestones = (proposedMilestones?: any[]) => {
    if (!proposedMilestones || proposedMilestones.length === 0) {
      setMilestones([]);
      return;
    }

    const initializedMilestones = proposedMilestones.map((milestone, index) => ({
      id: `milestone-${Date.now()}-${index}`,
      title: milestone.title || '',
      description: milestone.description || '',
      amount: milestone.amount || 0,
      durationDays: milestone.durationDays || 1,
      isSelected: true, // Default to selected
      column: 'proposal' as const,
      isFromProposal: true
    }));

    setMilestones(initializedMilestones);
  };

  // Fetch job and proposal data
  useEffect(() => {
    const fetchData = async () => {
      if (!jobId || !proposalId) {
        setError('Missing job ID or proposal ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch job details
        const jobData = await jobService.getJob(jobId);
        setJob(jobData);

        // Fetch proposal details
        const proposalData = await proposalService.getProposal(proposalId);
        setProposal(proposalData);

        // Initialize milestones from proposal
        initializeMilestones(proposalData.proposedMilestones);

        // Set default dates (start tomorrow, end in 3 months)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setStartDate(tomorrow.toISOString().split('T')[0]);

        const threeMonthsLater = new Date(tomorrow);
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        setEndDate(threeMonthsLater.toISOString().split('T')[0]);

      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobId, proposalId]);

  const handleMilestoneChange = (index: number, field: keyof MilestoneFormData, value: any) => {
    setMilestones(prev => prev.map((milestone, i) =>
      i === index ? { ...milestone, [field]: value } : milestone
    ));
  };

  const handleAddMilestone = () => {
    setMilestones(prev => [...prev, {
      id: `milestone-${Date.now()}-${prev.length}`,
      title: '',
      description: '',
      amount: 0,
      durationDays: 1,
      isSelected: true,
      column: 'custom'
    }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): string | null => {
    if (!startDate || !endDate) {
      return 'Start date and end date are required';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return 'Start date cannot be in the past';
    }

    if (end <= start) {
      return 'End date must be after start date';
    }

    // Validate selected milestones (those in 'contract' column)
    const selectedMilestones = milestones.filter(m => m.column === 'contract');
    if (selectedMilestones.length === 0) {
      return 'At least one milestone must be moved to the "Contract Milestones" column';
    }

    for (const milestone of selectedMilestones) {
      if (!milestone.title.trim()) {
        return 'All contract milestones must have a title';
      }
      if (!milestone.description.trim()) {
        return 'All contract milestones must have a description';
      }
      if (milestone.amount <= 0) {
        return 'All contract milestones must have a positive amount';
      }
      if (milestone.durationDays <= 0) {
        return 'All contract milestones must have a positive duration';
      }
    }

    // Check total milestone amount doesn't exceed proposal amount
    const totalMilestoneAmount = selectedMilestones.reduce((sum, m) => sum + m.amount, 0);
    if (proposal && totalMilestoneAmount > proposal.proposedRate.amount) {
      return `Total milestone amount (${formatCurrency(totalMilestoneAmount)}) cannot exceed proposal amount (${formatCurrency(proposal.proposedRate.amount)})`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!proposal) {
      setError('Proposal data not available');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedMilestones = milestones
        .filter(m => m.column === 'contract')
        .map(m => ({
          title: m.title.trim(),
          description: m.description.trim(),
          amount: m.amount,
          currency: proposal.proposedRate.currency || 'USD',
          durationDays: m.durationDays
        }));

      const contractData: CreateContractRequest = {
        proposalId: proposal._id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        terms: terms.trim() || undefined,
        milestones: selectedMilestones
      };

      const result = await contractService.createContract(contractData);

      // Redirect to contract details or success page
      router.push(`/client/contracts/${result._id}`);

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getTotalMilestoneAmount = () => {
    return milestones
      .filter(m => m.column === 'contract')
      .reduce((sum, m) => sum + m.amount, 0);
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !job && !proposal) {
    return (
      <DashboardLayout userRole="client">
        <div className="alert-error p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <svg className="h-6 w-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">Error Loading Data</span>
          </div>
          <p className="text-secondary mb-4">{error}</p>
          <Button variant="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.back()}
              >
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-primary">Create Contract</h1>
            </div>
            {job && (
              <div>
                <p className="text-lg text-primary font-medium">{job.title}</p>
                <p className="text-secondary text-sm mt-1">
                  {job.category} • {formatCurrency(job.budget.min)} {job.budget.max ? `- ${formatCurrency(job.budget.max)}` : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Proposal Summary */}
        {proposal && (
          <Card variant="default">
            <CardHeader>
              <h2 className="text-lg font-semibold text-primary">Proposal Summary</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-secondary">Proposal ID</div>
                  <div className="font-medium text-primary">#{proposal._id.slice(-6)}</div>
                </div>
                <div>
                  <div className="text-sm text-secondary">Proposed Rate</div>
                  <div className="font-medium" style={{color: 'var(--color-success)'}}>
                    {formatCurrency(proposal.proposedRate.amount, proposal.proposedRate.currency)}
                    {proposal.proposedRate.type === 'hourly' ? '/hr' : ''}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-secondary">Status</div>
                  <Badge variant="success">Accepted</Badge>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Contract Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contract Dates */}
          <Card variant="default">
            <CardHeader>
              <h3 className="text-lg font-semibold text-primary">Contract Timeline</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">
                    Start Date <span className="text-error">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="input-default"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <div className="form-help">When work should begin</div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    End Date <span className="text-error">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="input-default"
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                  <div className="form-help">When the project should be completed</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Milestones Kanban Board */}
          <Card variant="default">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-primary">Project Milestones</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddMilestoneModalOpen(true)}
                  disabled={isSubmitting}
                >
                  + Add Milestone
                </Button>
              </div>
              <p className="text-secondary text-sm mt-1">
                Drag milestones between columns to organize them. Only milestones in "Contract Milestones" will be included.
              </p>
            </CardHeader>
            <CardBody>
              {milestones.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-secondary mb-4">No milestones defined yet.</p>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddMilestoneModalOpen(true)}
                    disabled={isSubmitting}
                  >
                    Add First Milestone
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={milestones.map(m => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex gap-6 overflow-x-auto pb-4">
                        {/* Proposal Column */}
                        <DroppableColumn
                          id="proposal-column"
                          title="Proposal Milestones"
                          color="bg-blue-500"
                          count={milestones.filter(m => m.column === 'proposal').length}
                        >
                          <div className="space-y-3">
                            {milestones
                              .filter(m => m.column === 'proposal')
                              .map((milestone, index) => (
                                <SortableMilestoneCard
                                  key={milestone.id}
                                  milestone={milestone}
                                  index={milestones.findIndex(m => m.id === milestone.id)}
                                  onChange={handleMilestoneChange}
                                  onRemove={handleRemoveMilestone}
                                  isSubmitting={isSubmitting}
                                  formatCurrency={formatCurrency}
                                />
                              ))}
                          </div>
                        </DroppableColumn>

                        {/* Custom Column */}
                        <DroppableColumn
                          id="custom-column"
                          title="Custom Milestones"
                          color="bg-orange-500"
                          count={milestones.filter(m => m.column === 'custom').length}
                        >
                          <div className="space-y-3">
                            {milestones
                              .filter(m => m.column === 'custom')
                              .map((milestone, index) => (
                                <SortableMilestoneCard
                                  key={milestone.id}
                                  milestone={milestone}
                                  index={milestones.findIndex(m => m.id === milestone.id)}
                                  onChange={handleMilestoneChange}
                                  onRemove={handleRemoveMilestone}
                                  isSubmitting={isSubmitting}
                                  formatCurrency={formatCurrency}
                                />
                              ))}
                          </div>
                        </DroppableColumn>

                        {/* Contract Column */}
                        <DroppableColumn
                          id="contract-column"
                          title="Contract Milestones"
                          color="bg-green-500"
                          count={milestones.filter(m => m.column === 'contract').length}
                        >
                          <div className="space-y-3">
                            {milestones
                              .filter(m => m.column === 'contract')
                              .map((milestone, contractIndex) => (
                                <SortableMilestoneCard
                                  key={milestone.id}
                                  milestone={milestone}
                                  index={contractIndex + 1}
                                  onChange={handleMilestoneChange}
                                  onRemove={handleRemoveMilestone}
                                  isSubmitting={isSubmitting}
                                  formatCurrency={formatCurrency}
                                />
                              ))}
                          </div>
                        </DroppableColumn>
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Total Summary */}
                  {milestones.filter(m => m.isSelected).length > 0 && (
                    <div className="bg-secondary rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-primary">
                          Total Contract Amount ({milestones.filter(m => m.column === 'contract').length} milestones)
                        </span>
                        <span className="text-lg font-semibold" style={{color: 'var(--color-success)'}}>
                          {formatCurrency(getTotalMilestoneAmount())}
                        </span>
                      </div>
                      {proposal && (
                        <div className="text-sm text-secondary mt-1">
                          Proposal total: {formatCurrency(proposal.proposedRate.amount)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Contract Terms */}
          <Card variant="default">
            <CardHeader>
              <h3 className="text-lg font-semibold text-primary">Contract Terms</h3>
            </CardHeader>
            <CardBody>
              <div className="form-group">
                <label className="form-label">Additional Terms & Conditions (Optional)</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  disabled={isSubmitting}
                  className="input-default resize-none"
                  rows={4}
                  placeholder="Enter any specific terms, conditions, or requirements for this contract..."
                />
                <div className="form-help">
                  These terms will be added to the standard contract template.
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Submit Actions */}
          <CardFooter>
            {/* Error Display */}
            {error && (
              <div className="w-full mb-4">
                <div className="alert-error p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-end w-full">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !startDate || !endDate}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Creating Contract...
                  </>
                ) : (
                  'Create Contract'
                )}
              </Button>
            </div>
          </CardFooter>
        </form>

        {/* Add Milestone Modal */}
        <AddMilestoneModal
          isOpen={isAddMilestoneModalOpen}
          onClose={() => setIsAddMilestoneModalOpen(false)}
          onAdd={(milestoneData) => {
            const newMilestone: MilestoneFormData = {
              id: `milestone-${Date.now()}-${milestones.length}`,
              ...milestoneData,
              isSelected: true,
              column: 'custom',
            };
            setMilestones(prev => [...prev, newMilestone]);
          }}
          isSubmitting={isSubmitting}
          formatCurrency={formatCurrency}
        />
      </div>
    </DashboardLayout>
  );
}