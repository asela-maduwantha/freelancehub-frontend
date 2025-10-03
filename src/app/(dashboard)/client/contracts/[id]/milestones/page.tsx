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
import { Calendar, CheckCircle, Clock, AlertCircle, TrendingUp, DollarSign, BarChart3, List, GanttChart, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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
  return [{ value: currentStatus, label: currentStatus.replace('-', ' ').toUpperCase(), color: getStatusColor(currentStatus) }];
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-500';
    case 'submitted': return 'bg-yellow-500';
    case 'in-progress': return 'bg-blue-500';
    case 'rejected': return 'bg-red-500';
    case 'pending':
    default: return 'bg-gray-500';
  }
};

// Droppable Column Component - REMOVED

// Sortable Milestone Card Component - REMOVED

// Shared Components

// StatusBadge Component
interface StatusBadgeProps {
  status: string;
  className?: string;
}

function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-green-500', text: 'Approved' };
      case 'submitted':
        return { color: 'bg-yellow-500', text: 'Submitted' };
      case 'in-progress':
        return { color: 'bg-blue-500', text: 'In Progress' };
      case 'rejected':
        return { color: 'bg-red-500', text: 'Rejected' };
      case 'pending':
      default:
        return { color: 'bg-gray-500', text: 'Pending' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${config.color} ${className}`}>
      {config.text}
    </span>
  );
}

// ProgressOverview Component
interface ProgressOverviewProps {
  milestones: MilestoneResponse[];
  contractTitle?: string;
}

function ProgressOverview({ milestones, contractTitle }: ProgressOverviewProps) {
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'approved').length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const projectStartDate = milestones.length > 0 ? new Date(Math.min(...milestones.map(m => new Date(m.createdAt || m.dueDate).getTime()))) : new Date();
  const projectEndDate = milestones.length > 0 ? new Date(Math.max(...milestones.map(m => new Date(m.dueDate).getTime()))) : new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card variant="default" className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">Project Progress</h3>
            {contractTitle && (
              <p className="text-sm text-secondary mt-1">{contractTitle}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{completedMilestones}/{totalMilestones}</div>
            <div className="text-sm text-secondary">Milestones Completed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-secondary mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex justify-between text-sm text-secondary">
          <span>Start: {formatDate(projectStartDate)}</span>
          <span>Target: {formatDate(projectEndDate)}</span>
        </div>
      </CardBody>
    </Card>
  );
}

// StatsCards Component
interface StatsCardsProps {
  milestones: MilestoneResponse[];
}

function StatsCards({ milestones }: StatsCardsProps) {
  const totalValue = milestones.reduce((sum, m) => sum + m.amount, 0);
  const completedValue = milestones.filter(m => m.status === 'approved').reduce((sum, m) => sum + m.amount, 0);
  const inProgressValue = milestones.filter(m => m.status === 'in-progress').reduce((sum, m) => sum + m.amount, 0);
  const pendingValue = milestones.filter(m => m.status === 'submitted').reduce((sum, m) => sum + m.amount, 0);

  const currency = milestones[0]?.currency || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const stats = [
    {
      title: 'Total Value',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Completed',
      value: formatCurrency(completedValue),
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'In Progress',
      value: formatCurrency(inProgressValue),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Pending Review',
      value: formatCurrency(pendingValue),
      icon: AlertCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} variant="default" className="border-0 shadow-sm">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary">{stat.title}</p>
                <p className="text-lg font-semibold text-primary">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// ViewToggle Component
interface ViewToggleProps {
  viewMode: 'timeline' | 'gantt' | 'table';
  onViewModeChange: (mode: 'timeline' | 'gantt' | 'table') => void;
}

function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  const views = [
    { id: 'timeline' as const, label: 'Timeline', icon: Calendar },
    { id: 'gantt' as const, label: 'Gantt Chart', icon: GanttChart },
    { id: 'table' as const, label: 'Table', icon: List }
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg mb-6">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewModeChange(view.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            viewMode === view.id
              ? 'bg-white text-primary shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <view.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </div>
  );
}

// Timeline View Components

// MilestoneTimelineCard Component
interface MilestoneTimelineCardProps {
  milestone: MilestoneResponse;
  index: number;
  onStatusChange: (milestoneId: string, newStatus: string) => void;
  onViewDetails: (milestone: MilestoneResponse) => void;
  isUpdating: boolean;
}

function MilestoneTimelineCard({ milestone, index, onStatusChange, onViewDetails, isUpdating }: MilestoneTimelineCardProps) {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const getNodeStyle = () => {
    switch (milestone.status) {
      case 'approved':
        return 'w-6 h-6 rounded-full bg-green-500 border-4 border-green-200';
      case 'submitted':
      case 'in-progress':
        return 'w-6 h-6 rounded-full bg-blue-500 border-4 border-blue-200 animate-pulse';
      case 'pending':
      default:
        return 'w-6 h-6 rounded-full border-4 border-gray-300 bg-white';
    }
  };

  const getCardBorderStyle = () => {
    if (isOverdue()) return 'border-l-4 border-red-500';
    switch (milestone.status) {
      case 'approved':
        return 'border-green-200';
      case 'submitted':
      case 'in-progress':
        return 'border-blue-300';
      case 'pending':
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="relative flex items-start gap-8 mb-8">
      {/* Timeline Node */}
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center ${getNodeStyle()}`}>
          {milestone.status === 'approved' && (
            <CheckCircle className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Milestone Card */}
      <div
        className={`flex-1 bg-white rounded-xl border-2 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer ${getCardBorderStyle()}`}
        onClick={() => onViewDetails(milestone)}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {milestone.order}
              </div>
              <StatusBadge status={milestone.status} />
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(milestone.amount, milestone.currency)}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-primary mb-2">{milestone.title}</h3>

          {/* Description */}
          <p className="text-secondary mb-4 line-clamp-2">{milestone.description}</p>

          {/* Progress Bar (mock for now) */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-secondary mb-1">
              <span>Progress</span>
              <span>{milestone.status === 'approved' ? '100%' : milestone.status === 'in-progress' ? '60%' : '0%'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  milestone.status === 'approved' ? 'bg-green-500' :
                  milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                style={{
                  width: milestone.status === 'approved' ? '100%' :
                         milestone.status === 'in-progress' ? '60%' : '0%'
                }}
              ></div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <div className="text-secondary">Start Date</div>
              <div className="font-medium text-primary">
                {formatDate(milestone.createdAt || milestone.dueDate)}
              </div>
            </div>
            <div>
              <div className="text-secondary">Due Date</div>
              <div className={`font-medium ${isOverdue() ? 'text-red-600' : 'text-primary'}`}>
                {formatDate(milestone.dueDate)}
              </div>
            </div>
            <div>
              <div className="text-secondary">Time Left</div>
              <div className={`font-medium ${isOverdue() ? 'text-red-600' : 'text-primary'}`}>
                {isOverdue() ? `${Math.abs(getDaysUntilDue())}d overdue` :
                 getDaysUntilDue() === 0 ? 'Due today' :
                 getDaysUntilDue() === 1 ? '1 day left' :
                 `${getDaysUntilDue()} days left`}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e?.stopPropagation();
                  onViewDetails(milestone);
                }}
              >
                View Details
              </Button>
              {milestone.status === 'submitted' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onStatusChange(milestone.id, 'approved');
                    }}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onStatusChange(milestone.id, 'rejected');
                    }}
                    disabled={isUpdating}
                    className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600"
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
            {isOverdue() && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Overdue</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// TimelineView Component
interface TimelineViewProps {
  milestones: MilestoneResponse[];
  onStatusChange: (milestoneId: string, newStatus: string) => void;
  onViewDetails: (milestone: MilestoneResponse) => void;
  isUpdating: boolean;
}

function TimelineView({ milestones, onStatusChange, onViewDetails, isUpdating }: TimelineViewProps) {
  // Sort milestones by order
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  if (sortedMilestones.length === 0) {
    return (
      <div className="text-center py-12 text-secondary">
        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No milestones found</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-gray-300"></div>

      {/* Milestones */}
      <div className="space-y-0">
        {sortedMilestones.map((milestone, index) => (
          <MilestoneTimelineCard
            key={milestone.id}
            milestone={milestone}
            index={index}
            onStatusChange={onStatusChange}
            onViewDetails={onViewDetails}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}

// Gantt Chart View Components

// GanttBar Component
interface GanttBarProps {
  milestone: MilestoneResponse;
  projectStartDate: Date;
  projectEndDate: Date;
  onViewDetails: (milestone: MilestoneResponse) => void;
  onStatusChange: (milestoneId: string, newStatus: string) => void;
  isUpdating: boolean;
}

function GanttBar({ milestone, projectStartDate, projectEndDate, onViewDetails, onStatusChange, isUpdating }: GanttBarProps) {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate position and width based on dates
  const totalProjectDuration = projectEndDate.getTime() - projectStartDate.getTime();
  const milestoneStartDate = new Date(milestone.createdAt || milestone.dueDate);
  const milestoneEndDate = new Date(milestone.dueDate);

  const startOffset = Math.max(0, (milestoneStartDate.getTime() - projectStartDate.getTime()) / totalProjectDuration * 100);
  const duration = Math.max(1, (milestoneEndDate.getTime() - milestoneStartDate.getTime()) / totalProjectDuration * 100);

  const isOverdue = () => {
    const dueDate = new Date(milestone.dueDate);
    const now = new Date();
    return dueDate < now && milestone.status !== 'approved';
  };

  const getBarColor = () => {
    if (isOverdue()) return 'bg-red-500';
    switch (milestone.status) {
      case 'approved':
        return 'bg-green-500';
      case 'submitted':
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending':
      default:
        return 'bg-gray-400';
    }
  };

  const getProgressWidth = () => {
    switch (milestone.status) {
      case 'approved':
        return '100%';
      case 'in-progress':
        return '60%';
      case 'submitted':
        return '80%';
      default:
        return '0%';
    }
  };

  return (
    <div className="relative mb-10 pb-8 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        {/* Left Section: Milestone Info */}
        <div className="w-56 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {milestone.order}
            </div>
            <StatusBadge status={milestone.status} />
          </div>
          <h4 className="text-sm font-semibold text-primary mb-1 line-clamp-1">{milestone.title}</h4>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-green-600">{formatCurrency(milestone.amount, milestone.currency)}</span>
            {isOverdue() && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>
        </div>

        {/* Middle Section: Gantt Timeline */}
        <div className="flex-1 relative min-h-[5rem]">
          <div className="relative h-20 flex items-center">
            {/* Background Track */}
            <div className="absolute left-0 right-0 top-6 h-6 bg-gray-100 rounded-md"></div>
            
            {/* Gantt Bar */}
            <div
              className={`absolute h-6 top-6 ${getBarColor()} rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer group/bar z-10`}
              style={{
                left: `${startOffset}%`,
                width: `${Math.max(2, duration)}%`,
              }}
              onClick={() => onViewDetails(milestone)}
            >
              {/* Progress Fill */}
              <div
                className="h-full bg-white bg-opacity-25 rounded-md transition-all duration-500"
                style={{ width: getProgressWidth() }}
              ></div>
              
              {/* Progress Text */}
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
                {milestone.status === 'approved' ? '100%' : 
                 milestone.status === 'submitted' ? '80%' :
                 milestone.status === 'in-progress' ? '60%' : '0%'}
              </div>

              {/* Overdue Badge */}
              {isOverdue() && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></div>
              )}

              {/* Tooltip on Hover */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                {milestone.title}
              </div>
            </div>

            {/* Date Labels */}
            <div className="absolute -bottom-5 text-xs text-gray-500" style={{ left: `${startOffset}%`, transform: 'translateX(-25%)' }}>
              {formatDate(milestone.createdAt || milestone.dueDate)}
            </div>
            <div className="absolute -bottom-5 text-xs text-gray-500" style={{ left: `${Math.min(98, startOffset + duration)}%`, transform: 'translateX(25%)' }}>
              {formatDate(milestone.dueDate)}
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="w-52 flex-shrink-0 flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewDetails(milestone)}
            className="text-xs"
          >
            View
          </Button>
          {milestone.status === 'submitted' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e?.stopPropagation();
                  onStatusChange(milestone.id, 'approved');
                }}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3"
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e?.stopPropagation();
                  onStatusChange(milestone.id, 'rejected');
                }}
                disabled={isUpdating}
                className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600 text-xs px-3"
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// GanttView Component
interface GanttViewProps {
  milestones: MilestoneResponse[];
  onViewDetails: (milestone: MilestoneResponse) => void;
  onStatusChange: (milestoneId: string, newStatus: string) => void;
  isUpdating: boolean;
}

function GanttView({ milestones, onViewDetails, onStatusChange, isUpdating }: GanttViewProps) {
  // Calculate project date range
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.createdAt || a.dueDate).getTime() - new Date(b.createdAt || b.dueDate).getTime()
  );

  const projectStartDate = sortedMilestones.length > 0
    ? new Date(Math.min(...sortedMilestones.map(m => new Date(m.createdAt || m.dueDate).getTime())))
    : new Date();

  const projectEndDate = sortedMilestones.length > 0
    ? new Date(Math.max(...sortedMilestones.map(m => new Date(m.dueDate).getTime())))
    : new Date();

  // Generate month markers
  const generateMonthMarkers = () => {
    const markers = [];
    const start = new Date(projectStartDate);
    start.setDate(1); // Start of month
    const end = new Date(projectEndDate);

    let current = new Date(start);
    while (current <= end) {
      markers.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return markers;
  };

  const monthMarkers = generateMonthMarkers();

  // Today marker position
  const today = new Date();
  const totalDuration = projectEndDate.getTime() - projectStartDate.getTime();
  const todayPosition = totalDuration > 0
    ? ((today.getTime() - projectStartDate.getTime()) / totalDuration) * 100
    : 0;

  if (sortedMilestones.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <GanttChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-primary mb-2">No Milestones</h3>
        <p className="text-secondary">No milestones have been created yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-primary mb-2">Project Schedule</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary">
            {projectStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {projectEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="flex items-center gap-4 text-xs text-secondary">
            <span>Duration: {Math.ceil(totalDuration / (1000 * 60 * 60 * 24))} days</span>
            <span>•</span>
            <span>{sortedMilestones.length} milestones</span>
          </div>
        </div>
      </div>

      {/* Month Timeline Header */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-56 flex-shrink-0"></div>
          <div className="flex-1 relative h-12">
            {monthMarkers.map((month, index) => {
              const monthPosition = totalDuration > 0
                ? ((month.getTime() - projectStartDate.getTime()) / totalDuration) * 100
                : 0;

              return (
                <div
                  key={index}
                  className="absolute top-0 text-xs font-semibold text-gray-600"
                  style={{ left: `${monthPosition}%`, transform: 'translateX(-50%)' }}
                >
                  {month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </div>
              );
            })}
            
            {/* Today Marker in Header */}
            {today >= projectStartDate && today <= projectEndDate && (
              <div
                className="absolute top-6 w-0.5 bg-red-500 z-10"
                style={{ left: `${todayPosition}%`, height: '0.75rem' }}
              >
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  Today
                </div>
              </div>
            )}
          </div>
          <div className="w-52 flex-shrink-0"></div>
        </div>
      </div>

      {/* Gantt Bars Container */}
      <div className="space-y-2 mb-6 pt-8">
        {sortedMilestones.map((milestone) => (
          <GanttBar
            key={milestone.id}
            milestone={milestone}
            projectStartDate={projectStartDate}
            projectEndDate={projectEndDate}
            onViewDetails={onViewDetails}
            onStatusChange={onStatusChange}
            isUpdating={isUpdating}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="text-gray-600 font-medium">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-700">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-700">In Progress / Submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 bg-gray-400 rounded"></div>
            <span className="text-gray-700">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-700">Overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Table View Components

// MilestoneTableRow Component
interface MilestoneTableRowProps {
  milestone: MilestoneResponse;
  onStatusChange: (milestoneId: string, newStatus: string) => void;
  onViewDetails: (milestone: MilestoneResponse) => void;
  isUpdating: boolean;
}

function MilestoneTableRow({ milestone, onStatusChange, onViewDetails, isUpdating }: MilestoneTableRowProps) {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = () => {
    const dueDate = new Date(milestone.dueDate);
    const now = new Date();
    return dueDate < now && milestone.status !== 'approved';
  };

  const getProgressPercentage = () => {
    // Mock progress calculation - in real app this would come from milestone data
    switch (milestone.status) {
      case 'approved':
        return 100;
      case 'in-progress':
        return 60;
      case 'submitted':
        return 80;
      default:
        return 0;
    }
  };

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${isOverdue() ? 'bg-red-50' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {milestone.order}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="max-w-xs">
          <div className="text-sm font-medium text-primary truncate">{milestone.title}</div>
          <div className="text-sm text-secondary line-clamp-1">{milestone.description}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={milestone.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
        {formatCurrency(milestone.amount, milestone.currency)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isOverdue() ? 'text-red-600 font-medium' : 'text-primary'}`}>
          {formatDate(milestone.dueDate)}
          {isOverdue() && (
            <div className="text-xs text-red-500 mt-1">Overdue</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                milestone.status === 'approved' ? 'bg-green-500' :
                milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <span className="text-xs text-secondary w-8 text-right">
            {getProgressPercentage()}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewDetails(milestone)}
          >
            View
          </Button>
          {milestone.status === 'submitted' && (
            <Dropdown
              options={getValidStatusOptions(milestone.status)}
              value={milestone.status}
              onChange={(newStatus) => onStatusChange(milestone.id, newStatus)}
              className="text-xs"
              disabled={isUpdating}
            />
          )}
        </div>
      </td>
    </tr>
  );
}

// TableView Component
interface TableViewProps {
  milestones: MilestoneResponse[];
  sortField: 'order' | 'dueDate' | 'amount';
  sortDirection: 'asc' | 'desc';
  filterStatus: string;
  onSortChange: (field: 'order' | 'dueDate' | 'amount') => void;
  onFilterChange: (status: string) => void;
  onStatusChange: (milestoneId: string, newStatus: string) => void;
  onViewDetails: (milestone: MilestoneResponse) => void;
  isUpdating: boolean;
}

function TableView({
  milestones,
  sortField,
  sortDirection,
  filterStatus,
  onSortChange,
  onFilterChange,
  onStatusChange,
  onViewDetails,
  isUpdating
}: TableViewProps) {
  // Filter milestones
  const filteredMilestones = filterStatus === 'all'
    ? milestones
    : milestones.filter(m => m.status === filterStatus);

  // Sort milestones
  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortField) {
      case 'order':
        aValue = a.order;
        bValue = b.order;
        break;
      case 'dueDate':
        aValue = new Date(a.dueDate).getTime();
        bValue = new Date(b.dueDate).getTime();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  const statusFilters = [
    { value: 'all', label: 'All', count: milestones.length },
    { value: 'pending', label: 'Pending', count: milestones.filter(m => m.status === 'pending').length },
    { value: 'in-progress', label: 'In Progress', count: milestones.filter(m => m.status === 'in-progress').length },
    { value: 'submitted', label: 'Submitted', count: milestones.filter(m => m.status === 'submitted').length },
    { value: 'approved', label: 'Approved', count: milestones.filter(m => m.status === 'approved').length },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === filter.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSortChange('order')}
              >
                <div className="flex items-center gap-1">
                  Order
                  {getSortIcon('order')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Milestone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSortChange('amount')}
              >
                <div className="flex items-center gap-1">
                  Amount
                  {getSortIcon('amount')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSortChange('dueDate')}
              >
                <div className="flex items-center gap-1">
                  Due Date
                  {getSortIcon('dueDate')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedMilestones.map((milestone) => (
              <MilestoneTableRow
                key={milestone.id}
                milestone={milestone}
                onStatusChange={onStatusChange}
                onViewDetails={onViewDetails}
                isUpdating={isUpdating}
              />
            ))}
          </tbody>
        </table>
      </div>

      {sortedMilestones.length === 0 && (
        <div className="text-center py-12">
          <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">No milestones found</h3>
          <p className="text-secondary">
            {filterStatus === 'all'
              ? 'No milestones have been created for this contract yet.'
              : `No milestones with status "${filterStatus}" found.`
            }
          </p>
        </div>
      )}
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

  // View mode and filtering state
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt' | 'table'>('timeline');
  const [sortField, setSortField] = useState<'order' | 'dueDate' | 'amount'>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Milestone detail modal state
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneResponse | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneModalTab, setMilestoneModalTab] = useState<'details' | 'comments' | 'history' | 'attachments'>('details');
  const [newComment, setNewComment] = useState('');
  const [milestoneComments, setMilestoneComments] = useState<any[]>([]); // Mock data for now
  const [milestoneActivities, setMilestoneActivities] = useState<any[]>([]); // Mock data for now

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
        const statusLabel = newStatus.replace('-', ' ').toUpperCase();
        setSuccessMessage(`Milestone status changed to ${statusLabel}`);      // Clear success message after 3 seconds
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

  // Milestone modal handlers
  const handleViewMilestoneDetails = (milestone: MilestoneResponse) => {
    setSelectedMilestone(milestone);
    setShowMilestoneModal(true);
    setMilestoneModalTab('details');

    // Mock data for comments and activities
    setMilestoneComments([
      {
        id: '1',
        author: 'John Doe',
        content: 'Working on this milestone now. Should be completed by tomorrow.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        avatar: '/avatars/default.png'
      },
      {
        id: '2',
        author: 'Client',
        content: 'Great! Please make sure to include the documentation as well.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        avatar: '/avatars/client.png'
      }
    ]);

    setMilestoneActivities([
      {
        id: '1',
        type: 'status_change',
        description: 'Status changed from Pending to In Progress',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        user: 'John Doe'
      },
      {
        id: '2',
        type: 'comment',
        description: 'Added a comment',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        user: 'John Doe'
      },
      {
        id: '3',
        type: 'status_change',
        description: 'Status changed from In Progress to Submitted',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        user: 'John Doe'
      }
    ]);
  };

  const handleCloseMilestoneModal = () => {
    setShowMilestoneModal(false);
    setSelectedMilestone(null);
    setNewComment('');
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedMilestone) return;

    const comment = {
      id: Date.now().toString(),
      author: 'Client', // Current user
      content: newComment,
      timestamp: new Date(),
      avatar: '/avatars/client.png'
    };

    setMilestoneComments(prev => [comment, ...prev]);
    setNewComment('');

    // Add to activities
    const activity = {
      id: Date.now().toString(),
      type: 'comment',
      description: 'Added a comment',
      timestamp: new Date(),
      user: 'Client'
    };
    setMilestoneActivities(prev => [activity, ...prev]);
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
        <div className="mb-6">
          <button
            onClick={handleGoBack}
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-all mb-4"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Contract</span>
          </button>
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
        <div className="space-y-4">
          <button
            onClick={handleGoBack}
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-all"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Contract</span>
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary mb-2">Project Milestones</h1>
              {contractTitle && (
                <p className="text-secondary text-sm">{contractTitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="space-y-4">
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

      {/* View Toggle and Milestones */}
      <div className="space-y-6">
        {/* View Toggle */}
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

        {/* Stats Cards */}
        <StatsCards milestones={milestones} />

        {/* Progress Overview */}
        <ProgressOverview milestones={milestones} contractTitle={contractTitle} />

        {/* Milestones View */}
        {viewMode === 'timeline' && (
          <TimelineView
            milestones={milestones}
            onStatusChange={handleStatusChange}
            onViewDetails={handleViewMilestoneDetails}
            isUpdating={isUpdating}
          />
        )}

        {viewMode === 'gantt' && (
          <GanttView
            milestones={milestones}
            onViewDetails={handleViewMilestoneDetails}
            onStatusChange={handleStatusChange}
            isUpdating={isUpdating}
          />
        )}

        {viewMode === 'table' && (
          <TableView
            milestones={milestones}
            sortField={sortField}
            sortDirection={sortDirection}
            filterStatus={filterStatus}
            onSortChange={setSortField}
            onFilterChange={setFilterStatus}
            onStatusChange={handleStatusChange}
            onViewDetails={handleViewMilestoneDetails}
            isUpdating={isUpdating}
          />
        )}
      </div>

      {/* Milestone Detail Modal */}
      {showMilestoneModal && selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-light">
              <div>
                <h2 className="text-xl font-semibold text-primary">Milestone #{selectedMilestone.order}</h2>
                <p className="text-secondary mt-1">{selectedMilestone.title}</p>
              </div>
              <button
                onClick={handleCloseMilestoneModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-light">
              {[
                { id: 'details', label: 'Details', icon: '📋' },
                { id: 'comments', label: 'Comments', icon: '💬', count: milestoneComments.length },
                { id: 'history', label: 'History', icon: '📊' },
                { id: 'attachments', label: 'Attachments', icon: '📎', count: 3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMilestoneModalTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                    milestoneModalTab === tab.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                const formatDate = (dateString: string) => {
                  return new Date(dateString).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                };

                return (
                  <>
                    {milestoneModalTab === 'details' && (
                      <div className="space-y-6">
                        {/* Status and Amount */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="text-sm text-secondary">Status</div>
                              <div className="font-medium text-primary capitalize">{selectedMilestone.status.replace('-', ' ')}</div>
                            </div>
                            <div>
                              <div className="text-sm text-secondary">Amount</div>
                              <div className="font-medium text-success">
                                {formatCurrency(selectedMilestone.amount, selectedMilestone.currency)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-secondary">Due Date</div>
                              <div className="font-medium text-primary">
                                {formatDate(selectedMilestone.dueDate)}
                              </div>
                            </div>
                          </div>
                          <Dropdown
                            options={getValidStatusOptions(selectedMilestone.status)}
                            value={selectedMilestone.status}
                            onChange={(newStatus) => {
                              handleStatusChange(selectedMilestone.id, newStatus);
                              handleCloseMilestoneModal();
                            }}
                            className="text-sm"
                            disabled={isUpdating || selectedMilestone.status !== 'submitted'}
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-medium text-primary mb-3">Description</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-secondary whitespace-pre-wrap">{selectedMilestone.description}</p>
                          </div>
                        </div>

                        {/* Deliverables */}
                        <div>
                          <h3 className="text-lg font-medium text-primary mb-3">Deliverables</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-green-800">Source code implementation</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-green-800">Unit tests</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-yellow-800">Documentation</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {milestoneModalTab === 'comments' && (
                      <div className="space-y-4">
                        {/* Add Comment */}
                        <div className="border border-light rounded-lg p-4">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            rows={3}
                          />
                          <div className="flex justify-end mt-3">
                            <Button
                              variant="primary"
                              onClick={handleAddComment}
                              disabled={!newComment.trim()}
                            >
                              Add Comment
                            </Button>
                          </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-4">
                          {milestoneComments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-gray-600">
                                  {comment.author.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-primary">{comment.author}</span>
                                  <span className="text-xs text-secondary">
                                    {comment.timestamp.toLocaleDateString()} at {comment.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-secondary">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {milestoneModalTab === 'history' && (
                      <div className="space-y-4">
                        {/* Activity Timeline */}
                        <div className="space-y-4">
                          {milestoneActivities.map((activity, index) => (
                            <div key={activity.id} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">
                                    {activity.type === 'status_change' ? '📊' : activity.type === 'comment' ? '💬' : '📎'}
                                  </span>
                                </div>
                                {index < milestoneActivities.length - 1 && (
                                  <div className="w-px h-8 bg-gray-200 mt-2"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-primary">{activity.user}</span>
                                  <span className="text-xs text-secondary">
                                    {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-secondary">{activity.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {milestoneModalTab === 'attachments' && (
                      <div className="space-y-4">
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-secondary mb-2">Drop files here or click to upload</p>
                          <p className="text-xs text-gray-500">Supports: PDF, DOC, XLS, JPG, PNG (Max 10MB each)</p>
                          <Button variant="secondary" className="mt-4">
                            Choose Files
                          </Button>
                        </div>

                        {/* Attachments List */}
                        <div className="space-y-2">
                          {[
                            { name: 'design-spec.pdf', size: '2.4 MB', uploaded: '2 days ago' },
                            { name: 'wireframes.png', size: '1.8 MB', uploaded: '1 day ago' },
                            { name: 'requirements.docx', size: '856 KB', uploaded: '3 hours ago' }
                          ].map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                  <div className="font-medium text-primary">{file.name}</div>
                                  <div className="text-xs text-secondary">{file.size} • Uploaded {file.uploaded}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button className="p-1 hover:bg-gray-200 rounded">
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </button>
                                <button className="p-1 hover:bg-gray-200 rounded">
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
    </DashboardLayout>
  );
};

export default ContractMilestonesPage;