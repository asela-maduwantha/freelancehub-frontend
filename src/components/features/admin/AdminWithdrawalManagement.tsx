'use client';

import React, { useState, useEffect } from 'react';
import { useWithdrawals } from '@/lib/hooks/useWithdrawals';
import { WithdrawalStatus, WithdrawalMethod, Withdrawal } from '@/types';
import { formatDate } from '@/lib/utils/formatting';
import Button from '@/components/ui/Button/Button';

interface AdminWithdrawalManagementProps {
  className?: string;
}

export const AdminWithdrawalManagement: React.FC<AdminWithdrawalManagementProps> = ({
  className = '',
}) => {
  const {
    withdrawals,
    loading,
    error,
    pagination,
    loadWithdrawals,
    loadPendingWithdrawals,
    processWithdrawal,
    completeWithdrawal,
    failWithdrawal,
  } = useWithdrawals();

  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'process' | 'complete' | 'fail' | null>(null);
  const [failureReason, setFailureReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 25;

  // Fetch withdrawals on mount and when filters change
  useEffect(() => {
    if (statusFilter === 'all') {
      loadWithdrawals({ page: currentPage, limit, sortBy: 'requestedAt', sortOrder: 'desc' });
    } else if (statusFilter === WithdrawalStatus.PENDING) {
      loadPendingWithdrawals(currentPage, limit);
    } else {
      loadWithdrawals({
        page: currentPage,
        limit,
        status: statusFilter,
        sortBy: 'requestedAt',
        sortOrder: 'desc',
      });
    }
  }, [statusFilter, currentPage, loadWithdrawals, loadPendingWithdrawals]);

  const handleAction = (withdrawal: Withdrawal, type: 'process' | 'complete' | 'fail') => {
    setSelectedWithdrawal(withdrawal);
    setActionType(type);
    setShowActionModal(true);
    setFailureReason('');
  };

  const confirmAction = async () => {
    if (!selectedWithdrawal || !actionType) return;

    setActionLoading(true);
    try {
      switch (actionType) {
        case 'process':
          await processWithdrawal(selectedWithdrawal._id, {});
          break;
        case 'complete':
          await completeWithdrawal(selectedWithdrawal._id);
          break;
        case 'fail':
          if (!failureReason.trim()) {
            alert('Please provide a failure reason');
            setActionLoading(false);
            return;
          }
          await failWithdrawal(selectedWithdrawal._id, { errorMessage: failureReason });
          break;
      }

      // Refresh the list
      if (statusFilter === 'all') {
        loadWithdrawals({ page: currentPage, limit, sortBy: 'requestedAt', sortOrder: 'desc' });
      } else if (statusFilter === WithdrawalStatus.PENDING) {
        loadPendingWithdrawals(currentPage, limit);
      } else {
        loadWithdrawals({
          page: currentPage,
          limit,
          status: statusFilter,
          sortBy: 'requestedAt',
          sortOrder: 'desc',
        });
      }

      // Close modal
      setShowActionModal(false);
      setSelectedWithdrawal(null);
      setActionType(null);
      setFailureReason('');
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAction = () => {
    setShowActionModal(false);
    setSelectedWithdrawal(null);
    setActionType(null);
    setFailureReason('');
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: WithdrawalStatus }> = ({ status }) => {
    const getStatusStyles = () => {
      switch (status) {
        case WithdrawalStatus.PENDING:
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case WithdrawalStatus.PROCESSING:
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case WithdrawalStatus.COMPLETED:
          return 'bg-green-100 text-green-800 border-green-200';
        case WithdrawalStatus.FAILED:
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
        {status}
      </span>
    );
  };

  // Method display
  const getMethodDisplay = (method?: WithdrawalMethod) => {
    if (!method) return '—';
    switch (method) {
      case WithdrawalMethod.STRIPE:
        return 'Stripe';
      default:
        return method;
    }
  };

  // Action buttons based on status
  const getActionButtons = (withdrawal: Withdrawal) => {
    switch (withdrawal.status) {
      case WithdrawalStatus.PENDING:
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => handleAction(withdrawal, 'process')}
              className="bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 py-1"
            >
              Process
            </Button>
            <Button
              onClick={() => handleAction(withdrawal, 'fail')}
              className="bg-red-600 text-white hover:bg-red-700 text-xs px-3 py-1"
            >
              Reject
            </Button>
          </div>
        );
      case WithdrawalStatus.PROCESSING:
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => handleAction(withdrawal, 'complete')}
              className="bg-green-600 text-white hover:bg-green-700 text-xs px-3 py-1"
            >
              Complete
            </Button>
            <Button
              onClick={() => handleAction(withdrawal, 'fail')}
              className="bg-red-600 text-white hover:bg-red-700 text-xs px-3 py-1"
            >
              Fail
            </Button>
          </div>
        );
      case WithdrawalStatus.COMPLETED:
      case WithdrawalStatus.FAILED:
        return <span className="text-gray-400 text-xs">No actions</span>;
      default:
        return null;
    }
  };

  // Stats summary
  const stats = [
    {
      label: 'Total Withdrawals',
      value: pagination?.total || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Pending',
      value: withdrawals.filter((w: Withdrawal) => w.status === WithdrawalStatus.PENDING).length,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'Processing',
      value: withdrawals.filter((w: Withdrawal) => w.status === WithdrawalStatus.PROCESSING).length,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Completed',
      value: withdrawals.filter((w: Withdrawal) => w.status === WithdrawalStatus.COMPLETED).length,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-100 text-green-600',
    },
  ];

  return (
    <div className={className}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Withdrawal Management</h3>
            <Button
              onClick={() => {
                if (statusFilter === 'all') {
                  loadWithdrawals({ page: currentPage, limit, sortBy: 'requestedAt', sortOrder: 'desc' });
                } else if (statusFilter === WithdrawalStatus.PENDING) {
                  loadPendingWithdrawals(currentPage, limit);
                } else {
                  loadWithdrawals({
                    page: currentPage,
                    limit,
                    status: statusFilter,
                    sortBy: 'requestedAt',
                    sortOrder: 'desc',
                  });
                }
              }}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {Object.values(WithdrawalStatus).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">Loading withdrawals...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && withdrawals.length === 0 && (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No withdrawals</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter !== 'all'
                ? `No ${statusFilter.toLowerCase()} withdrawals found.`
                : 'No withdrawal requests yet.'}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && withdrawals.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Freelancer
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawals.map((withdrawal: Withdrawal) => (
                  <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(withdrawal.requestedAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">
                        {typeof withdrawal.freelancerId === 'object' ? (
                          <>
                            <div className="font-medium text-gray-900">
                              {withdrawal.freelancerId.firstName} {withdrawal.freelancerId.lastName}
                            </div>
                            <div className="text-gray-500">{withdrawal.freelancerId.email}</div>
                          </>
                        ) : (
                          <div className="text-gray-900">{withdrawal.freelancerId}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${withdrawal.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      ${withdrawal.processingFee.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${withdrawal.finalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {getMethodDisplay(withdrawal.method)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={withdrawal.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {getActionButtons(withdrawal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {pagination.totalPages} ({pagination.total} total)
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasMore}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedWithdrawal && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
            </h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Withdrawal ID:</span>
                  <span className="font-medium text-gray-900">{selectedWithdrawal._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-900">${selectedWithdrawal.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Freelancer:</span>
                  <span className="font-medium text-gray-900">
                    {typeof selectedWithdrawal.freelancerId === 'object'
                      ? `${selectedWithdrawal.freelancerId.firstName} ${selectedWithdrawal.freelancerId.lastName}`
                      : selectedWithdrawal.freelancerId}
                  </span>
                </div>
              </div>
            </div>

            {actionType === 'fail' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Failure Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  rows={3}
                  placeholder="Enter the reason for rejecting this withdrawal..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                {actionType === 'process' && 'This will mark the withdrawal as processing and initiate the transfer if applicable.'}
                {actionType === 'complete' && 'This will mark the withdrawal as completed and deduct the amount from the freelancer\'s balance.'}
                {actionType === 'fail' && 'This will mark the withdrawal as failed. The freelancer\'s balance will NOT be deducted.'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={cancelAction}
                disabled={actionLoading}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={actionLoading || (actionType === 'fail' && !failureReason.trim())}
                className={`flex-1 text-white ${
                  actionType === 'fail'
                    ? 'bg-red-600 hover:bg-red-700'
                    : actionType === 'complete'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawalManagement;
