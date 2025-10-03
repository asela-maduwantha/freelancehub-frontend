'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { contractService, ContractResponse } from '@/lib/api/contracts';
import { milestoneApi, MilestoneResponse } from '@/lib/api/milestones';
import { Spinner } from '@/components/ui/Feedback';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';

// Timeline utilities
import {
  TimelineZoom,
  calculateDateRange,
  generateTimelineColumns,
  groupMilestonesByContract,
} from '@/lib/utils/timelineUtils';

// Components
import TimelineView from '@/components/features/milestones/TimelineView';
import MilestoneDetailPanel from '@/components/features/milestones/MilestoneDetailPanel';
import StatsCard from '@/components/features/milestones/StatsCard';
import CalendarView from '@/components/features/milestones/CalendarView';
import TableView from '@/components/features/milestones/TableView';
import DashboardView from '@/components/features/milestones/DashboardView';

const MilestoneTrackerPage = () => {
  const router = useRouter();

  // State
  const [milestones, setMilestones] = useState<MilestoneResponse[]>([]);
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectMilestoneId, setRejectMilestoneId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  // View state
  const [currentView, setCurrentView] = useState<'timeline' | 'calendar' | 'table' | 'dashboard'>('timeline');
  const [timelineZoom, setTimelineZoom] = useState<TimelineZoom>('month');
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneResponse | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Auth
  const { userRole: authUserRole } = useAuth();
  const userRole: 'client' | 'freelancer' = authUserRole === 'client' ? 'client' : 'freelancer';

  // Timeline calculations
  const dateRange = useMemo(() => calculateDateRange(timelineZoom), [timelineZoom]);
  const timelineColumns = useMemo(() => generateTimelineColumns(dateRange, timelineZoom), [dateRange, timelineZoom]);
  const projectSwimlanes = useMemo(() =>
    groupMilestonesByContract(milestones, contracts),
    [milestones, contracts]
  );

  // Stats calculations
  const stats = useMemo(() => {
    const total = milestones.length;
    const inProgress = milestones.filter(m => m.status === 'in-progress').length;
    const submitted = milestones.filter(m => m.status === 'submitted').length;
    const completed = milestones.filter(m => m.status === 'approved').length;
    
    return { total, inProgress, submitted, completed };
  }, [milestones]);

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    return milestones.filter(milestone => {
      if (selectedContractId && milestone.contractId !== selectedContractId) return false;
      if (statusFilter && milestone.status !== statusFilter) return false;
      return true;
    });
  }, [milestones, selectedContractId, statusFilter]);

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (contracts.length > 0) {
      fetchMilestones();
    }
  }, [selectedContractId, statusFilter, contracts]);

  const fetchContracts = async () => {
    try {
      const response = await contractService.getContracts();
      console.log('Fetched contracts in milestone tracker:', response.contracts);
      console.log('First contract jobId:', response.contracts[0]?.jobId);
      setContracts(response.contracts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contracts');
    }
  };

  const fetchMilestones = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedContractId) params.contractId = selectedContractId;
      if (statusFilter) params.status = statusFilter;

      const response = await milestoneApi.getAll(params);
      setMilestones(response.milestones);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch milestones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (milestoneId: string, newStatus: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone || milestone.status === newStatus) return;

    if (newStatus === 'rejected') {
      setRejectMilestoneId(milestoneId);
      setRejectFeedback('');
      setShowRejectModal(true);
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);

      setMilestones(prev => prev.map(m =>
        m.id === milestoneId ? { ...m, status: newStatus as any } : m
      ));

      await performStatusTransition(milestoneId, milestone.status, newStatus);
      await fetchMilestones();
    } catch (err: any) {
      setError(err.message || 'Failed to update milestone status');
      await fetchMilestones();
    } finally {
      setIsUpdating(false);
    }
  };

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

  const handleMilestoneDragEnd = async (milestoneId: string, newDueDate: Date) => {
    console.log('Milestone rescheduling preview:', milestoneId, 'to', newDueDate);
    // TODO: Implement API endpoint for updating milestone due dates
  };

  // Contract options for dropdown
  const contractOptions = [
    { value: '', label: 'All Projects' },
    ...contracts.map(contract => ({
      value: contract._id,
      label: contract.title
    }))
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  if (isLoading && milestones.length === 0) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Milestone Tracker</h1>
            <p className="text-sm text-gray-600">
              Track and manage your project milestones in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </Button>
            <Button variant="primary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Milestone
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Milestones"
            value={stats.total}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          <StatsCard
            title="Submitted"
            value={stats.submitted}
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* View Toggle & Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* View Toggle */}
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              {(['timeline', 'calendar', 'table', 'dashboard'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md transition-all capitalize
                    ${currentView === view
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-48">
                <Dropdown
                  options={contractOptions}
                  value={selectedContractId}
                  onChange={setSelectedContractId}
                  placeholder="Filter by project"
                />
              </div>
              <div className="w-40">
                <Dropdown
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Filter by status"
                />
              </div>
              {(selectedContractId || statusFilter) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedContractId('');
                    setStatusFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {currentView === 'timeline' && (
          <TimelineView
            swimlanes={projectSwimlanes}
            columns={timelineColumns}
            zoom={timelineZoom}
            onZoomChange={setTimelineZoom}
            onMilestoneClick={(milestone) => {
              setSelectedMilestone(milestone);
              setDetailPanelOpen(true);
            }}
            onMilestoneDragEnd={handleMilestoneDragEnd}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            milestones={filteredMilestones}
            onMilestoneClick={(milestone) => {
              setSelectedMilestone(milestone);
              setDetailPanelOpen(true);
            }}
          />
        )}

        {currentView === 'table' && (
          <TableView
            milestones={filteredMilestones}
            contracts={contracts}
            onMilestoneClick={(milestone) => {
              setSelectedMilestone(milestone);
              setDetailPanelOpen(true);
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            milestones={filteredMilestones}
            contracts={contracts}
            onMilestoneClick={(milestone) => {
              setSelectedMilestone(milestone);
              setDetailPanelOpen(true);
            }}
          />
        )}
      </div>

      {/* Detail Panel */}
      <MilestoneDetailPanel
        milestone={selectedMilestone}
        isOpen={detailPanelOpen}
        onClose={() => {
          setDetailPanelOpen(false);
          setSelectedMilestone(null);
        }}
        userRole={userRole}
        onStatusChange={handleStatusChange}
        isUpdating={isUpdating}
      />
    </DashboardLayout>
  );
};

export default MilestoneTrackerPage;
