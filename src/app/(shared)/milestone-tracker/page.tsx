'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contractService, ContractResponse } from '@/lib/api/contracts';
import { milestoneApi, MilestoneResponse } from '@/lib/api/milestones';
import { Spinner } from '@/components/ui/Feedback';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Display';
import Dropdown from '@/components/ui/Dropdown';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
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
  { id: 'pending', title: 'To Do', color: 'bg-gray-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'submitted', title: 'Submitted', color: 'bg-yellow-500' },
  { id: 'approved', title: 'Approved', color: 'bg-green-500' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500' },
];

// Status options based on user role
const getStatusOptionsForRole = (userRole: 'client' | 'freelancer', currentStatus: string) => {
  if (userRole === 'freelancer') {
    // Freelancers can move from pending to in-progress, and in-progress to submitted
    if (currentStatus === 'pending') {
      return [{ value: 'in-progress', label: 'Start Work', color: 'bg-blue-500' }];
    }
    if (currentStatus === 'in-progress') {
      return [{ value: 'submitted', label: 'Submit Work', color: 'bg-yellow-500' }];
    }
    return [{ value: currentStatus, label: currentStatus.replace('-', ' ').toUpperCase() }];
  } else {
    // Clients can only approve or reject submitted milestones
    if (currentStatus === 'submitted') {
      return [
        { value: 'approved', label: 'Approve', color: 'bg-green-500' },
        { value: 'rejected', label: 'Reject', color: 'bg-red-500' },
      ];
    }
    return [{ value: currentStatus, label: currentStatus.replace('-', ' ').toUpperCase() }];
  }
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
        className={`bg-secondary rounded-lg p-4 h-[600px] transition-all duration-200 overflow-y-auto ${
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
  userRole: 'client' | 'freelancer';
  onStatusChange: (milestoneId: string, newStatus: string) => void;
  isUpdating: boolean;
}

function SortableMilestoneCard({ milestone, userRole, onStatusChange, isUpdating }: SortableMilestoneCardProps) {
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
              options={getStatusOptionsForRole(userRole, milestone.status)}
              value={milestone.status}
              onChange={(newStatus) => onStatusChange(milestone.id, newStatus)}
              className="text-xs"
              disabled={isUpdating || (userRole === 'client' && milestone.status !== 'submitted')}
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

const MilestoneTrackerPage = () => {
  const router = useRouter();

  const [milestones, setMilestones] = useState<MilestoneResponse[]>([]);
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectMilestoneId, setRejectMilestoneId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get user role from auth context
  const { userRole: authUserRole } = useAuth();
  // Ensure userRole is either 'client' or 'freelancer' (default to 'freelancer' if admin or undefined)
  const userRole: 'client' | 'freelancer' = authUserRole === 'client' ? 'client' : 'freelancer';

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (contracts.length > 0) {
      fetchMilestones();
    }
  }, [selectedContractId, statusFilter, showOverdueOnly, contracts]);

  // Periodic refresh for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (contracts.length > 0 && !isUpdating) {
        fetchMilestones();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [contracts, selectedContractId, statusFilter, showOverdueOnly, isUpdating]);

  const fetchContracts = async () => {
    try {
      const response = await contractService.getContracts();
      setContracts(response.contracts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contracts');
    }
  };

  const fetchMilestones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let milestonesData: MilestoneResponse[] = [];

      if (selectedContractId) {
        // Get milestones for specific contract
        const response = await milestoneApi.getByContract(selectedContractId);
        milestonesData = response.milestones;
      } else {
        // Get all milestones for user's contracts
        const allMilestones = await Promise.all(
          contracts.map(contract => milestoneApi.getByContract(contract._id))
        );
        milestonesData = allMilestones.flatMap(response => response.milestones);
      }

      // Apply filters
      let filteredMilestones = milestonesData;

      if (statusFilter) {
        filteredMilestones = filteredMilestones.filter(m => m.status === statusFilter);
      }

      if (showOverdueOnly) {
        filteredMilestones = filteredMilestones.filter(m => {
          const dueDate = new Date(m.dueDate);
          const now = new Date();
          return dueDate < now && m.status !== 'approved' && m.status !== 'paid';
        });
      }

      setMilestones(filteredMilestones);
      setLastUpdated(new Date());
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

    // Find the active milestone
    const activeMilestone = milestones.find(m => m.id === activeId);
    if (!activeMilestone) return;

    // If dropping on a column header (status change)
    if (STATUS_COLUMNS.some(col => col.id === overId)) {
      const newStatus = overId;

      // Validate status transitions based on role
      if (!isValidStatusTransition(userRole, activeMilestone.status, newStatus)) {
        setError(`Invalid status transition for ${userRole}`);
        return;
      }

      // For rejections via drag-and-drop, show feedback modal
      if (newStatus === 'rejected') {
        setRejectMilestoneId(activeId);
        setRejectFeedback('');
        setShowRejectModal(true);
        return;
      }

      try {
        setIsUpdating(true);
        setError(null);

        // Optimistically update UI first
        setMilestones(prev => prev.map(m =>
          m.id === activeId
            ? { ...m, status: newStatus as any }
            : m
        ));

        // Call appropriate API based on status transition
        await performStatusTransition(activeId, activeMilestone.status, newStatus);

        setSuccessMessage(`Milestone moved to ${STATUS_COLUMNS.find(col => col.id === newStatus)?.title}`);
        setTimeout(() => setSuccessMessage(null), 3000);

        await fetchMilestones();
      } catch (error: any) {
        // Revert optimistic update on error
        setMilestones(prev => prev.map(m =>
          m.id === activeId
            ? { ...m, status: activeMilestone.status }
            : m
        ));

        setError(error.message || 'Failed to update milestone status');
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    // If dropping on another milestone (reordering within same status)
    const overMilestone = milestones.find(m => m.id === overId);
    if (overMilestone && activeMilestone.status === overMilestone.status) {
      // Get all milestones with the same status
      const statusMilestones = milestones
        .filter(m => m.status === activeMilestone.status)
        .sort((a, b) => a.order - b.order);

      const activeIndex = statusMilestones.findIndex((item) => item.id === activeId);
      const overIndex = statusMilestones.findIndex((item) => item.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const reorderedStatus = arrayMove(statusMilestones, activeIndex, overIndex);

        setMilestones(prev => {
          const otherMilestones = prev.filter(m => m.status !== activeMilestone.status);
          return [...otherMilestones, ...reorderedStatus];
        });
      }
    }
  };

  // Validate status transitions based on user role
  const isValidStatusTransition = (role: 'client' | 'freelancer', currentStatus: string, newStatus: string): boolean => {
    if (role === 'freelancer') {
      return (
        (currentStatus === 'pending' && newStatus === 'in-progress') ||
        (currentStatus === 'in-progress' && newStatus === 'submitted')
      );
    } else {
      return (
        currentStatus === 'submitted' &&
        (newStatus === 'approved' || newStatus === 'rejected')
      );
    }
  };

  // Perform status transition API calls
  const performStatusTransition = async (milestoneId: string, currentStatus: string, newStatus: string, feedback?: string) => {
    switch (newStatus) {
      case 'in-progress':
        if (currentStatus === 'pending') {
          await milestoneApi.startWork(milestoneId);
        }
        break;

      case 'submitted':
        if (currentStatus === 'in-progress') {
          await milestoneApi.submitWork(milestoneId, { deliverables: [] });
        }
        break;

      case 'approved':
        if (currentStatus === 'submitted') {
          await milestoneApi.approve(milestoneId);
        }
        break;

      case 'rejected':
        if (currentStatus === 'submitted') {
          if (!feedback || feedback.trim() === '') {
            throw new Error('Feedback is required when rejecting a milestone');
          }
          await milestoneApi.reject(milestoneId, { feedback });
        }
        break;

      default:
        throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
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

    try {
      setIsUpdating(true);
      setError(null);

      // Optimistically update UI first
      setMilestones(prev => prev.map(m =>
        m.id === milestoneId
          ? { ...m, status: newStatus as any }
          : m
      ));

      await performStatusTransition(milestoneId, milestone.status, newStatus);

      setSuccessMessage(`Milestone status changed to ${STATUS_COLUMNS.find(col => col.id === newStatus)?.title}`);
      setTimeout(() => setSuccessMessage(null), 3000);

      await fetchMilestones();
    } catch (error: any) {
      // Revert optimistic update on error
      setMilestones(prev => prev.map(m =>
        m.id === milestoneId
          ? { ...m, status: milestone.status }
          : m
      ));

      setError(error.message || 'Failed to update milestone status');
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

      setMilestones(prev => prev.map(m =>
        m.id === rejectMilestoneId
          ? { ...m, status: 'rejected' as any }
          : m
      ));

      await performStatusTransition(rejectMilestoneId, milestone.status, 'rejected', rejectFeedback);

      setSuccessMessage('Milestone rejected with feedback');
      setTimeout(() => setSuccessMessage(null), 3000);

      await fetchMilestones();
    } catch (error: any) {
      setMilestones(prev => prev.map(m =>
        m.id === rejectMilestoneId
          ? { ...m, status: milestone.status }
          : m
      ));

      setError(error.message || 'Failed to reject milestone');
    } finally {
      setIsUpdating(false);
      setRejectMilestoneId(null);
      setRejectFeedback('');
    }
  };

  const getMilestoneStats = () => {
    // Get all milestones (unfiltered) for accurate stats
    const allMilestones = milestones; // This is already filtered in fetchMilestones

    const total = allMilestones.length;
    const pending = allMilestones.filter(m => m.status === 'pending').length;
    const inProgress = allMilestones.filter(m => m.status === 'in-progress').length;
    const submitted = allMilestones.filter(m => m.status === 'submitted').length;
    const completed = allMilestones.filter(m => m.status === 'approved').length;
    const overdue = allMilestones.filter(m => {
      const dueDate = new Date(m.dueDate);
      const now = new Date();
      return dueDate < now && m.status !== 'approved';
    }).length;

    const totalAmount = allMilestones.reduce((sum, m) => sum + m.amount, 0);
    const approvedAmount = allMilestones.filter(m => m.status === 'approved').reduce((sum, m) => sum + m.amount, 0);

    return {
      total,
      pending,
      inProgress,
      submitted,
      completed,
      overdue,
      totalAmount,
      approvedAmount,
      currency: allMilestones[0]?.currency || 'USD'
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

  const stats = getMilestoneStats();

  // Contract options for dropdown
  const contractOptions = [
    { value: '', label: 'All Projects' },
    ...contracts.map(contract => ({
      value: contract._id,
      label: contract.title
    }))
  ];

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-primary">Milestone Tracker</h1>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchMilestones()}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
            <p className="text-secondary text-sm">
              Track and manage milestones across your projects
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Contract Filter */}
          <div className="w-full sm:w-64">
            <Dropdown
              options={contractOptions}
              value={selectedContractId}
              onChange={setSelectedContractId}
              placeholder="Select Project"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-primary">Status:</label>
            <Dropdown
              options={[
                { value: '', label: 'All Statuses' },
                ...STATUS_COLUMNS.map(col => ({ value: col.id, label: col.title }))
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-medium text-primary">
              <input
                type="checkbox"
                checked={showOverdueOnly}
                onChange={(e) => setShowOverdueOnly(e.target.checked)}
                className="rounded border-border-default text-accent focus:ring-accent"
              />
              Show Overdue Only
            </label>
          </div>

          {(selectedContractId || statusFilter || showOverdueOnly) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedContractId('');
                setStatusFilter('');
                setShowOverdueOnly(false);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="default">
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-secondary text-sm">Total Milestones</div>
            </CardBody>
          </Card>
          <Card variant="default">
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
              <div className="text-secondary text-sm">In Progress</div>
            </CardBody>
          </Card>
          <Card variant="default">
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.submitted}</div>
              <div className="text-secondary text-sm">Submitted</div>
            </CardBody>
          </Card>
          <Card variant="default">
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <div className="text-secondary text-sm">Completed</div>
            </CardBody>
          </Card>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-success bg-opacity-10 border border-success border-opacity-20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-success">{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-error bg-opacity-10 border border-error border-opacity-20 rounded-lg p-6">
            <div className="text-center">
              <p className="text-error mb-4">{error}</p>
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
                className="w-full p-3 border border-border-default rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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
                  className="flex-1 bg-error hover:bg-error text-white"
                >
                  Reject Milestone
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <Card variant="default">
          <CardHeader>
            <h3 className="text-lg font-semibold text-primary">Milestone Board</h3>
            <p className="text-secondary text-sm mt-1">
              Drag milestones between columns to update their status. {userRole === 'freelancer' ? 'Move from To Do → In Progress → Submitted' : 'Approve or reject submitted milestones'}
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
                    .filter(m => m.status === column.id)
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
                        items={columnMilestones.map((m) => m.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {columnMilestones.map((milestone) => (
                            <SortableMilestoneCard
                              key={milestone.id}
                              milestone={milestone}
                              userRole={userRole}
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

export default MilestoneTrackerPage;