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

  // Filter and sort withdrawals
  const filteredWithdrawals = useMemo(() => {
    let filtered = [...withdrawals];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }

    // Apply search filter (by amount or description)
    if (searchQuery) {
      filtered = filtered.filter((w) => {
        const query = searchQuery.toLowerCase();
        return (
          w.amount.toString().includes(query) ||
          w.description?.toLowerCase().includes(query) ||
          String(w._id).toLowerCase().includes(query)
        );
      });
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => {
      return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
    });

    return filtered;
  }, [withdrawals, statusFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No withdrawals yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your earnings are ready to withdraw! Click "Withdraw Funds" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Withdrawal History
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value={WithdrawalStatus.PENDING}>Pending</option>
              <option value={WithdrawalStatus.PROCESSING}>Processing</option>
              <option value={WithdrawalStatus.COMPLETED}>Completed</option>
              <option value={WithdrawalStatus.FAILED}>Failed</option>
              <option value={WithdrawalStatus.CANCELLED}>Cancelled</option>
            </select>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600 mt-3">
          Showing {filteredWithdrawals.length} of {withdrawals.length} withdrawals
        </p>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Final Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredWithdrawals.map((withdrawal) => (
              <tr
                key={withdrawal._id}
                className="hover:bg-primary-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(withdrawal.requestedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(withdrawal.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatCurrency(withdrawal.processingFee)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-secondary">
                  {formatCurrency(withdrawal.finalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadgeClasses(withdrawal.status)}>
                    {getStatusLabel(withdrawal.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onViewDetails(withdrawal)}
                    className="text-primary hover:text-primary-hover font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden divide-y divide-gray-200">
        {filteredWithdrawals.map((withdrawal) => (
          <div key={withdrawal._id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(withdrawal.finalAmount)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(withdrawal.requestedAt)}
                </p>
              </div>
              <span className={getStatusBadgeClasses(withdrawal.status)}>
                {getStatusLabel(withdrawal.status)}
              </span>
            </div>

            <div className="space-y-1 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(withdrawal.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee:</span>
                <span className="text-gray-600">
                  {formatCurrency(withdrawal.processingFee)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onViewDetails(withdrawal)}
              className="w-full py-2 text-sm text-primary hover:text-primary-hover font-medium border border-primary-100 rounded-lg hover:bg-primary-50 transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Empty state after filtering */}
      {filteredWithdrawals.length === 0 && withdrawals.length > 0 && (
        <div className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No withdrawals found matching your filters.
          </p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistoryTable;
