'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contractService, ContractMilestonesResponse, MilestoneResponse } from '@/lib/api/contracts';
import { milestoneApi } from '@/lib/api/milestones';
import { Spinner } from '@/components/ui/Feedback';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Display';
import Dropdown from '@/components/ui/Dropdown';
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout';
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

// Status columns for the Kanban board
const STATUS_COLUMNS = [
  { id: 'pending', title: 'Pending', color: 'bg-gray-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'submitted', title: 'Submitted', color: 'bg-yellow-500' },
  { id: 'approved', title: 'Approved', color: 'bg-green-500' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500' },
];

// Status options for client dropdown (limited transitions)
const CLIENT_STATUS_OPTIONS = [
  { value: 'approved', label: 'Approved', color: 'bg-green-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

// Get valid status options for a milestone based on current status
const getValidStatusOptions = (currentStatus: string) => {
  // For clients, only allow transitions from SUBMITTED status
  if (currentStatus === 'submitted') {
    return CLIENT_STATUS_OPTIONS;
  }
  // For other statuses, show current status only (read-only)
  return [{ value: currentStatus, label: currentStatus.replace('-', ' ').toUpperCase(), color: STATUS_COLUMNS.find(col => col.id === currentStatus)?.color || 'bg-gray-500' }];
};

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
        className={`bg-secondary rounded-lg p-4 h-[600px] transition-all duration-200 overflow-y-auto ${  // Increased height from h-96 to h-[600px]
          isOver ? 'ring-2 ring-primary ring-opacity-50 bg-primary bg-opacity-5' : ''
        }`}
      >
        {/* Sticky column header */}
        <div className="sticky top-0 bg-secondary z-10 pb-2 mb-4 border-b border-light">
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

// Sortable Milestone Card Component
interface SortableMilestoneCardProps {
  milestone: MilestoneResponse;
  onStatusChange: (milestoneId: string, newStatus: string) => void;
  onPaymentClick?: (milestone: MilestoneResponse) => void;
  isUpdating: boolean;
}

function SortableMilestoneCard({ milestone, onStatusChange, onPaymentClick, isUpdating }: SortableMilestoneCardProps) {
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

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'submitted':
        return 'primary';
      case 'in-progress':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const isOverdue = () => {
    const dueDate = new Date(milestone.dueDate);
    const now = new Date();
    return dueDate < now && milestone.status !== 'approved';
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(milestone.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card-default p-3 cursor-move w-64 flex-shrink-0 mb-3 ${
        isDragging ? 'opacity-50 shadow-lg scale-105 rotate-2' : ''
      } ${isOverdue() ? 'border-l-4 border-red-500' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-primary">
            #{milestone.order}
          </div>
          {isOverdue() && (
            <Badge variant="error" className="text-xs">Overdue</Badge>
          )}
        </div>
        <div className="text-xs font-semibold text-success">
          {formatCurrency(milestone.amount, milestone.currency)}
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-sm font-medium text-primary line-clamp-2">
            {milestone.title}
          </div>
        </div>

        <div>
          <div className="text-xs text-secondary line-clamp-3">
            {milestone.description}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-secondary">
              Due: {formatDate(milestone.dueDate)}
              {getDaysUntilDue() > 0 && ` (${getDaysUntilDue()} days)`}
              {getDaysUntilDue() === 0 && ' (Today)'}
              {getDaysUntilDue() < 0 && ` (${Math.abs(getDaysUntilDue())} days ago)`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-light gap-2">
          <div className="flex-1">
            <Dropdown
              options={getValidStatusOptions(milestone.status)}
              value={milestone.status}
              onChange={(newStatus) => onStatusChange(milestone.id, newStatus)}
              className="text-xs"
              disabled={isUpdating || milestone.status !== 'submitted'}
            />
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

const ContractMilestonesPage = () => {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [milestones, setMilestones] = useState<MilestoneResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractTitle, setContractTitle] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectMilestoneId, setRejectMilestoneId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (contractId) {
      fetchMilestones();
    } else {
      setError('Contract ID not found in URL');
      setIsLoading(false);
    }
  }, [contractId]);

  const fetchMilestones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: ContractMilestonesResponse = await contractService.getContractMilestones(contractId);
      setMilestones(response.milestones);

      // Get contract title from the first milestone if available
      if (response.milestones.length > 0) {
        const firstMilestone = response.milestones[0];
        if (typeof firstMilestone.contractId === 'object') {
          setContractTitle(firstMilestone.contractId.title);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch milestones');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag end for status changes
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Extract milestone ID from the key (format: "columnId-milestoneId" or "columnId-fallback-index")
    const extractMilestoneId = (key: string) => {
      const parts = key.split('-');
      if (parts.length >= 2) {
        // If it starts with "fallback-", it's a fallback ID, return the full key
        if (parts[1] === 'fallback') {
          return key;
        }
        // Otherwise, return the milestone ID (everything after the first dash)
        return parts.slice(1).join('-');
      }
      return key;
    };

    const activeMilestoneId = extractMilestoneId(activeId);
    const overMilestoneId = extractMilestoneId(overId);

    // Find the active milestone
    const activeMilestone = milestones.find(m => m.id === activeMilestoneId);
    if (!activeMilestone) return;

    // If dropping on a column header (status change)
    if (STATUS_COLUMNS.some(col => col.id === overId)) {
      const newStatus = overId;

      // Validate client can only transition from SUBMITTED to APPROVED or REJECTED
      if (activeMilestone.status !== 'submitted' || (newStatus !== 'approved' && newStatus !== 'rejected')) {
        setError('Clients can only approve or reject submitted milestones');
        return;
      }

      // For rejections via drag-and-drop, show feedback modal
      if (newStatus === 'rejected') {
        setRejectMilestoneId(activeMilestoneId);
        setRejectFeedback('');
        setShowRejectModal(true);
        return;
      }

      // For approvals, proceed directly
      try {
        setIsUpdating(true);
        setError(null);

        // Optimistically update UI first
        setMilestones(prev => prev.map(m =>
          m.id === activeMilestoneId
            ? { ...m, status: newStatus as any }
            : m
        ));

        // Call appropriate API based on status transition
        if (newStatus === 'approved') {
          await milestoneApi.approve(activeMilestoneId);
        } else if (newStatus === 'rejected') {
          await milestoneApi.reject(activeMilestoneId, { feedback: rejectFeedback });
        }

        // Show success message
        const statusLabel = STATUS_COLUMNS.find(col => col.id === newStatus)?.title || newStatus;
        setSuccessMessage(`Milestone moved to ${statusLabel}`);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);

        // Refresh data to get updated milestone
        await fetchMilestones();
      } catch (error: any) {
        // Revert optimistic update on error
        setMilestones(prev => prev.map(m =>
          m.id === activeMilestoneId
            ? { ...m, status: activeMilestone.status }
            : m
        ));

        // Show error message
        setError(error.message || 'Failed to update milestone status');
        console.error('Status transition error:', error);
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    // If dropping on another milestone (reordering within same status)
    const overMilestone = milestones.find(m => m.id === overMilestoneId);
    if (overMilestone && activeMilestone.status === overMilestone.status) {
      // Get all milestones with the same status
      const statusMilestones = milestones
        .filter(m => m.status === activeMilestone.status)
        .sort((a, b) => a.order - b.order);

      const activeIndex = statusMilestones.findIndex((item) => item.id === activeMilestoneId);
      const overIndex = statusMilestones.findIndex((item) => item.id === overMilestoneId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const reorderedStatus = arrayMove(statusMilestones, activeIndex, overIndex);

        // Update the milestones array with the new order
        setMilestones(prev => {
          const otherMilestones = prev.filter(m => m.status !== activeMilestone.status);
          return [...otherMilestones, ...reorderedStatus];
        });
      }
    }
  };

  // Handle status change from dropdown
  const handleStatusChange = async (milestoneId: string, newStatus: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.status === newStatus) return;

    // For rejections, show feedback modal
    if (newStatus === 'rejected') {
      setRejectMilestoneId(milestoneId);
      setRejectFeedback('');
      setShowRejectModal(true);
      return;
    }

    // For approvals, proceed directly
    try {
      setIsUpdating(true);
      setError(null);

      // Check if contract has sufficient balance for approval (upfront payment system)
      if (newStatus === 'approved') {
        const totalContractAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
        const approvedAmount = milestones
          .filter(m => m.status === 'approved' || (m.id === milestoneId && newStatus === 'approved'))
          .reduce((sum, m) => sum + m.amount, 0);

        if (approvedAmount > totalContractAmount) {
          throw new Error('Insufficient contract balance to approve this milestone. The contract balance has been exhausted.');
        }
      }

      // Optimistically update UI first
      setMilestones(prev => prev.map(m =>
        m.id === milestoneId
          ? { ...m, status: newStatus as any }
          : m
      ));

      // Call appropriate API based on status transition
      if (newStatus === 'approved') {
        await milestoneApi.approve(milestoneId);
      } else if (newStatus === 'rejected') {
        await milestoneApi.reject(milestoneId, { feedback: rejectFeedback });
      }

      // Show success message
      const statusLabel = STATUS_COLUMNS.find(col => col.id === newStatus)?.title || newStatus;
      setSuccessMessage(`Milestone status changed to ${statusLabel}`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh data to get updated milestone
      await fetchMilestones();
    } catch (error: any) {
      // Revert optimistic update on error
      setMilestones(prev => prev.map(m =>
        m.id === milestoneId
          ? { ...m, status: milestone.status }
          : m
      ));

      // Show error message
      setError(error.message || 'Failed to update milestone status');
      console.error('Status change error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle rejection with feedback
  const handleRejectMilestone = async () => {
    if (!rejectMilestoneId || !rejectFeedback.trim()) return;

    const milestone = milestones.find(m => m.id === rejectMilestoneId);
    if (!milestone) return;

    try {
      setIsUpdating(true);
      setError(null);
      setShowRejectModal(false);

      // Optimistically update UI first
      setMilestones(prev => prev.map(m =>
        m.id === rejectMilestoneId
          ? { ...m, status: 'rejected' as any }
          : m
      ));

      // Call reject API with feedback
      await milestoneApi.reject(rejectMilestoneId, { feedback: rejectFeedback });

      // Show success message
      setSuccessMessage('Milestone rejected with feedback');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh data to get updated milestone
      await fetchMilestones();
    } catch (error: any) {
      // Revert optimistic update on error
      setMilestones(prev => prev.map(m =>
        m.id === rejectMilestoneId
          ? { ...m, status: milestone.status }
          : m
      ));

      // Show error message
      setError(error.message || 'Failed to reject milestone');
      console.error('Rejection error:', error);
    } finally {
      setIsUpdating(false);
      setRejectMilestoneId(null);
      setRejectFeedback('');
    }
  };

  const handleGoBack = () => {
    router.push(`/client/contracts/${contractId}`);
  };

  const getMilestoneStats = () => {
    const total = milestones.length;
    const pending = milestones.filter(m => m.status === 'pending').length;
    const inProgress = milestones.filter(m => m.status === 'in-progress').length;
    const submitted = milestones.filter(m => m.status === 'submitted').length;
    const completed = milestones.filter(m => m.status === 'approved').length;
    const overdue = milestones.filter(m => {
      const dueDate = new Date(m.dueDate);
      const now = new Date();
      return dueDate < now && m.status !== 'approved';
    }).length;

    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);

    return {
      total,
      pending,
      inProgress,
      submitted,
      completed,
      overdue,
      totalAmount,
      currency: milestones[0]?.currency || 'USD'
    };
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="secondary" onClick={handleGoBack}>
            ← Back to Contract
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Contract Milestones</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <Button variant="primary" onClick={() => fetchMilestones()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getMilestoneStats();

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="secondary" size="sm" onClick={handleGoBack}>
                ← Back to Contract
              </Button>
              <h1 className="text-2xl font-bold text-primary">Project Milestones</h1>
            </div>
            {contractTitle && (
              <p className="text-secondary text-sm">{contractTitle}</p>
            )}
          </div>

          {/* Stats Summary */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-primary">{stats.total}</div>
              <div className="text-secondary">Total</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">{stats.inProgress}</div>
              <div className="text-secondary">In Progress</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-yellow-600">{stats.submitted}</div>
              <div className="text-secondary">Submitted</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{stats.completed}</div>
              <div className="text-secondary">Completed</div>
            </div>
            {stats.overdue > 0 && (
              <div className="text-center">
                <div className="font-semibold text-red-600">{stats.overdue}</div>
                <div className="text-secondary">Overdue</div>
              </div>
            )}
          </div>
        </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-800">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <Button variant="primary" onClick={() => { setError(null); fetchMilestones(); }}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Spinner size="sm" />
            <span className="text-primary">Updating milestone...</span>
          </div>
        </div>
      )}

      {/* Rejection Feedback Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-primary mb-4">Reject Milestone</h3>
            <p className="text-secondary text-sm mb-4">
              Please provide feedback explaining why this milestone is being rejected. This will help the freelancer understand what needs to be improved.
            </p>
            <textarea
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="Enter your feedback here..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectMilestoneId(null);
                  setRejectFeedback('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRejectMilestone}
                disabled={!rejectFeedback.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Reject Milestone
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <Card variant="default">
        <CardHeader>
          <h3 className="text-lg font-semibold text-primary">Project Progress</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-secondary">Total Value</div>
              <div className="text-lg font-semibold text-primary">
                {formatCurrency(stats.totalAmount, stats.currency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary">Approved Amount</div>
              <div className="text-lg font-semibold text-success">
                {formatCurrency(milestones.filter(m => m.status === 'approved').reduce((sum, m) => sum + m.amount, 0), stats.currency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary">Pending Approval</div>
              <div className="text-lg font-semibold text-secondary">
                {formatCurrency(milestones.filter(m => m.status === 'submitted').reduce((sum, m) => sum + m.amount, 0), stats.currency)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-secondary mb-1">
              <span>Progress</span>
              <span>{stats.completed}/{stats.total} milestones</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Kanban Board */}
      <Card variant="default">
        <CardHeader>
          <h3 className="text-lg font-semibold text-primary">Milestone Board</h3>
          <p className="text-secondary text-sm mt-1">
            Drag milestones between columns to update their status. Milestones are automatically sorted by their order.
          </p>
        </CardHeader>
        <CardBody>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 overflow-x-auto pb-4">
              {STATUS_COLUMNS.map((column) => {
                const columnMilestones = milestones
                  .filter(m => m.status === column.id && m.id) // Filter out milestones without IDs
                  .sort((a, b) => a.order - b.order);
                return (
                  <DroppableColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    color={column.color}
                    count={columnMilestones.length}
                  >
                    <SortableContext
                      items={columnMilestones.map((m, index) => `${column.id}-${m.id || `fallback-${index}`}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {columnMilestones.map((milestone, index) => (
                          <SortableMilestoneCard
                            key={`${column.id}-${milestone.id || `fallback-${index}`}`}
                            milestone={milestone}
                            onStatusChange={handleStatusChange}
                            isUpdating={isUpdating}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DroppableColumn>
                );
              })}
            </div>
          </DndContext>
        </CardBody>
      </Card>

    </div>
    </DashboardLayout>
  );
};

export default ContractMilestonesPage;