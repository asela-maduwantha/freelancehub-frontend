'use client';

import React, { useMemo } from 'react';
import { MilestoneResponse } from '@/lib/api/milestones';
import { ContractResponse } from '@/lib/api/contracts';
import { Badge } from '@/components/ui/Display';

interface DashboardViewProps {
  milestones: MilestoneResponse[];
  contracts: ContractResponse[];
  onMilestoneClick: (milestone: MilestoneResponse) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ milestones, contracts, onMilestoneClick }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === 'approved').length;
    const inProgress = milestones.filter(m => m.status === 'in-progress').length;
    const pending = milestones.filter(m => m.status === 'pending').length;
    const overdue = milestones.filter(m => {
      const dueDate = new Date(m.dueDate);
      return dueDate < now && m.status !== 'approved';
    }).length;

    const totalValue = milestones.reduce((sum, m) => sum + m.amount, 0);
    const completedValue = milestones
      .filter(m => m.status === 'approved')
      .reduce((sum, m) => sum + m.amount, 0);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      totalValue,
      completedValue,
      completionRate,
    };
  }, [milestones]);

  // Get upcoming milestones (next 7 days)
  const upcomingMilestones = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return milestones
      .filter(m => {
        const dueDate = new Date(m.dueDate);
        return dueDate >= now && dueDate <= nextWeek && m.status !== 'approved';
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [milestones]);

  // Get overdue milestones
  const overdueMilestones = useMemo(() => {
    const now = new Date();
    return milestones
      .filter(m => {
        const dueDate = new Date(m.dueDate);
        return dueDate < now && m.status !== 'approved';
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [milestones]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    return [...milestones]
      .sort((a, b) => new Date(b.createdAt || b.dueDate).getTime() - new Date(a.createdAt || a.dueDate).getTime())
      .slice(0, 5);
  }, [milestones]);

  // Status distribution for chart
  const statusDistribution = useMemo(() => {
    const approved = milestones.filter(m => m.status === 'approved').length;
    const inProgress = milestones.filter(m => m.status === 'in-progress').length;
    const pending = milestones.filter(m => m.status === 'pending').length;
    const submitted = milestones.filter(m => m.status === 'submitted').length;
    const rejected = milestones.filter(m => m.status === 'rejected').length;

    return [
      { label: 'Approved', count: approved, color: 'bg-green-500' },
      { label: 'In Progress', count: inProgress, color: 'bg-blue-500' },
      { label: 'Submitted', count: submitted, color: 'bg-yellow-500' },
      { label: 'Pending', count: pending, color: 'bg-gray-400' },
      { label: 'Rejected', count: rejected, color: 'bg-red-500' },
    ];
  }, [milestones]);

  const getContractTitle = (contractId: string | any) => {
    // Check if contractId is already populated as an object
    if (typeof contractId === 'object' && contractId !== null) {
      return contractId.title || 'Unknown Project';
    }
    // Otherwise lookup from contracts array
    const contract = contracts.find(c => c._id === contractId);
    if (contract && typeof contract.jobId === 'object' && contract.jobId?.title) {
      return contract.jobId.title;
    }
    return contract?.title || 'Unknown Project';
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'primary' | 'secondary' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'submitted':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const formatDaysUntil = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Milestones</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-50 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">{stats.completed} completed</span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-600">{stats.completionRate}% done</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
            </div>
            <div className="bg-blue-50 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}</p>
            </div>
            <div className="bg-red-50 rounded-full p-3">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {stats.overdue > 0 ? 'Requires immediate attention' : 'All on track!'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${(stats.totalValue / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="bg-green-50 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-green-600 font-medium">${(stats.completedValue / 1000).toFixed(1)}k earned</span>
          </div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Distribution</h3>
          <div className="space-y-4">
            {statusDistribution.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Completion Progress</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - stats.completionRate / 100)}`}
                  className="text-green-500 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">{stats.completionRate}%</span>
                <span className="text-sm text-gray-600 mt-1">Complete</span>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-600 mt-1">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-gray-600 mt-1">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
              <p className="text-xs text-gray-600 mt-1">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming & Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Milestones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming This Week</h3>
            <Badge variant="primary" size="sm">{upcomingMilestones.length}</Badge>
          </div>
          {upcomingMilestones.length > 0 ? (
            <div className="space-y-3">
              {upcomingMilestones.map((milestone) => (
                <button
                  key={milestone.id}
                  onClick={() => onMilestoneClick(milestone)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-blue-700">
                        {milestone.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {getContractTitle(milestone.contractId)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(milestone.status)} size="sm">
                      {milestone.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-gray-600">${milestone.amount.toLocaleString()}</span>
                    <span className="text-blue-600 font-medium">{formatDaysUntil(milestone.dueDate)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">No upcoming milestones this week</p>
            </div>
          )}
        </div>

        {/* Overdue Milestones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Overdue</h3>
            <Badge variant="error" size="sm">{overdueMilestones.length}</Badge>
          </div>
          {overdueMilestones.length > 0 ? (
            <div className="space-y-3">
              {overdueMilestones.map((milestone) => (
                <button
                  key={milestone.id}
                  onClick={() => onMilestoneClick(milestone)}
                  className="w-full text-left p-4 rounded-lg border border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-red-700">
                        {milestone.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {getContractTitle(milestone.contractId)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(milestone.status)} size="sm">
                      {milestone.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-gray-600">${milestone.amount.toLocaleString()}</span>
                    <span className="text-red-600 font-medium">{formatDaysUntil(milestone.dueDate)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">All milestones are on track!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((milestone) => (
              <button
                key={milestone.id}
                onClick={() => onMilestoneClick(milestone)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group flex items-center gap-4"
              >
                <Badge variant={getStatusBadgeVariant(milestone.status)} size="sm">
                  {milestone.status}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate group-hover:text-blue-700">
                    {milestone.title}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {getContractTitle(milestone.contractId)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${milestone.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(milestone.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
