'use client';

import React, { useState, useMemo } from 'react';
import { MilestoneResponse } from '@/lib/api/milestones';
import { Badge } from '@/components/ui/Display';
import Button from '@/components/ui/Button';

interface TableViewProps {
  milestones: MilestoneResponse[];
  contracts: any[];
  onMilestoneClick: (milestone: MilestoneResponse) => void;
}

type SortField = 'order' | 'title' | 'dueDate' | 'amount' | 'status' | 'contract';
type SortDirection = 'asc' | 'desc';

const TableView: React.FC<TableViewProps> = ({ milestones, contracts, onMilestoneClick }) => {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Contract map for quick lookup
  const contractMap = useMemo(() => {
    return new Map(contracts.map(c => [c._id, c]));
  }, [contracts]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort milestones
  const filteredAndSortedMilestones = useMemo(() => {
    let filtered = [...milestones];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'order':
          aValue = a.order;
          bValue = b.order;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'contract':
          // Handle both populated object and string contractId
          if (typeof a.contractId === 'object' && a.contractId !== null) {
            aValue = (a.contractId as any).title || '';
          } else {
            const contractA = contractMap.get(a.contractId as string);
            aValue = (contractA && typeof contractA.jobId === 'object' && contractA.jobId?.title) ? contractA.jobId.title : contractA?.title || '';
          }
          
          if (typeof b.contractId === 'object' && b.contractId !== null) {
            bValue = (b.contractId as any).title || '';
          } else {
            const contractB = contractMap.get(b.contractId as string);
            bValue = (contractB && typeof contractB.jobId === 'object' && contractB.jobId?.title) ? contractB.jobId.title : contractB?.title || '';
          }
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [milestones, searchQuery, statusFilter, sortField, sortDirection, contractMap]);

  // Get status badge variant
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Check if overdue
  const isOverdue = (milestone: MilestoneResponse) => {
    const dueDate = new Date(milestone.dueDate);
    const now = new Date();
    return dueDate < now && milestone.status !== 'approved';
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Milestones Table</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredAndSortedMilestones.length} of {milestones.length} milestones
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milestones..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent w-64"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || statusFilter) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('order')}
              >
                <div className="flex items-center gap-2">
                  <span>#</span>
                  <SortIcon field="order" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-2">
                  <span>Title</span>
                  <SortIcon field="title" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('contract')}
              >
                <div className="flex items-center gap-2">
                  <span>Project</span>
                  <SortIcon field="contract" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center gap-2">
                  <span>Due Date</span>
                  <SortIcon field="dueDate" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-2">
                  <span>Amount</span>
                  <SortIcon field="amount" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredAndSortedMilestones.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No milestones found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedMilestones.map((milestone) => (
                <tr
                  key={milestone.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onMilestoneClick(milestone)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">#{milestone.order}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-semibold text-gray-900 truncate">{milestone.title}</div>
                      <div className="text-xs text-gray-500 truncate mt-1">{milestone.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {(() => {
                        // Check if contractId is already populated as an object
                        if (typeof milestone.contractId === 'object' && milestone.contractId !== null) {
                          return (milestone.contractId as any).title || 'Unknown';
                        }
                        // Otherwise lookup from contract map
                        const contract = contractMap.get(milestone.contractId as string);
                        if (contract && typeof contract.jobId === 'object' && contract.jobId?.title) {
                          return contract.jobId.title;
                        }
                        return contract?.title || 'Unknown';
                      })()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isOverdue(milestone) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                        {formatDate(milestone.dueDate)}
                      </span>
                      {isOverdue(milestone) && (
                        <Badge variant="error" className="text-xs">Overdue</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">
                      {milestone.currency} ${milestone.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(milestone.status)} className="capitalize">
                      {milestone.status.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMilestoneClick(milestone);
                      }}
                      className="text-primary hover:text-accent font-medium text-sm transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {filteredAndSortedMilestones.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Total Value: <span className="font-semibold text-green-600">
                ${filteredAndSortedMilestones.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div>
                Approved: <span className="font-semibold text-green-600">
                  {filteredAndSortedMilestones.filter(m => m.status === 'approved').length}
                </span>
              </div>
              <div>
                In Progress: <span className="font-semibold text-blue-600">
                  {filteredAndSortedMilestones.filter(m => m.status === 'in-progress').length}
                </span>
              </div>
              <div>
                Pending: <span className="font-semibold text-gray-600">
                  {filteredAndSortedMilestones.filter(m => m.status === 'pending').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableView;
