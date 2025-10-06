'use client';

import React, { useState, useMemo } from 'react';
import { Withdrawal, WithdrawalStatus } from '@/types/withdrawals';
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClasses,
  getStatusLabel,
} from '@/lib/utils/withdrawal.utils';

interface WithdrawalHistoryTableProps {
  withdrawals: Withdrawal[];
  onViewDetails: (withdrawal: Withdrawal) => void;
  isLoading?: boolean;
}

const WithdrawalHistoryTable: React.FC<WithdrawalHistoryTableProps> = ({
  withdrawals,
  onViewDetails,
  isLoading = false,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWithdrawals = useMemo(() => {
    let filtered = [...withdrawals];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((w) => {
        const query = searchQuery.toLowerCase();
        return (
          w.amount.toString().includes(query) ||
          w.description?.toLowerCase().includes(query) ||
          String(w.id).toLowerCase().includes(query)
        );
      });
    }

    filtered.sort((a, b) => {
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });

    return filtered;
  }, [withdrawals, statusFilter, searchQuery]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: string; colorClass: string }> = {
      completed: { 
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        colorClass: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      processing: { 
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        colorClass: 'bg-amber-100 text-amber-800 border-amber-200'
      },
      pending: { 
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        colorClass: 'bg-amber-100 text-amber-800 border-amber-200'
      },
      failed: { 
        icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        colorClass: 'bg-blue-100 text-blue-800 border-blue-200'
      },
    };
    return configs[status] || configs.pending;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
        <div className="p-6">
          <div className="h-8 w-48 bg-blue-100 animate-pulse rounded-lg mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-blue-50 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-blue-100">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-50 rounded-full">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-blue-900 mb-2">
          No withdrawals yet
        </h3>
        <p className="text-blue-700">
          Your earnings are ready to withdraw! Click "Withdraw Funds" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
      
      {/* Header with Filters */}
      <div className="p-6 border-b border-blue-100 bg-blue-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold text-blue-900">
            Withdrawal History
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-blue-200 rounded-lg bg-white text-blue-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent w-full sm:w-48 transition-shadow"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-blue-200 rounded-lg bg-white text-blue-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value={WithdrawalStatus.PENDING}>Pending</option>
                <option value={WithdrawalStatus.PROCESSING}>Processing</option>
                <option value={WithdrawalStatus.COMPLETED}>Completed</option>
                <option value={WithdrawalStatus.FAILED}>Failed</option>
                <option value={WithdrawalStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <p className="text-sm text-blue-600 mt-3">
          Showing {filteredWithdrawals.length} of {withdrawals.length} withdrawals
        </p>
      </div>

      {/* Withdrawals List */}
      <div className="divide-y divide-blue-100">
        {filteredWithdrawals.map((withdrawal) => {
          const statusConfig = getStatusConfig(withdrawal.status);
          
          return (
            <div 
              key={withdrawal.id}
              className="p-6 hover:bg-blue-50/50 transition-colors cursor-pointer group"
              onClick={() => onViewDetails(withdrawal)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Left: Amount & Date */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-900">
                      {formatCurrency(withdrawal.finalAmount)}
                    </p>
                    <p className="text-sm text-blue-600">
                      {formatDate(withdrawal.requestedAt)}
                    </p>
                  </div>
                </div>

                {/* Middle: Fee Breakdown */}
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-blue-600 mb-1">Requested</p>
                    <p className="font-semibold text-blue-900">{formatCurrency(withdrawal.amount)}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 mb-1">Fee</p>
                    <p className="font-semibold text-blue-900">-{formatCurrency(withdrawal.processingFee)}</p>
                  </div>
                </div>

                {/* Right: Status */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border ${statusConfig.colorClass}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusConfig.icon} />
                    </svg>
                    {getStatusLabel(withdrawal.status)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state after filtering */}
      {filteredWithdrawals.length === 0 && withdrawals.length > 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-blue-700 mb-2">No withdrawals found matching your filters.</p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistoryTable;