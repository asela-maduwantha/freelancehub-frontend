'use client';

import { useState, useEffect, memo, useMemo, lazy, Suspense, useCallback } from 'react';
import { usePaymentStore } from '../../lib/stores/payment.store';
import { paymentsService } from '../../lib/api/payments.service';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

// Lazy load the modal for better performance
const RefundRequestModal = lazy(() => import('./RefundRequestModal').then(module => ({ default: module.RefundRequestModal })));
import {
  Filter,
  Search,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Shield,
  DollarSign,
  RotateCcw
} from 'lucide-react';

interface PaymentDashboardProps {
  userType: 'client' | 'freelancer';
}

export const PaymentDashboard = memo(function PaymentDashboard({ userType }: PaymentDashboardProps) {
  const {
    payments,
    filteredPayments,
    stats,
    isLoading,
    error,
    statusFilter,
    escrowStatusFilter,
    setPayments,
    setStats,
    setLoading,
    setError,
    setStatusFilter,
    setEscrowStatusFilter,
    resetFilters
  } = usePaymentStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refundModal, setRefundModal] = useState<{
    isOpen: boolean;
    paymentId: string;
    amount: number;
  } | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const paymentData = await paymentsService.getPayments();
      setPayments(paymentData);
    } catch (error) {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await paymentsService.getPaymentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load payment stats:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEscrowBadgeColor = (escrowStatus?: string) => {
    switch (escrowStatus) {
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'held':
        return 'bg-blue-100 text-blue-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPaymentsWithSearch = useMemo(() => {
    return filteredPayments.filter(payment =>
      payment.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      payment.contract?.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      payment.freelancer?.firstName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      payment.freelancer?.lastName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [filteredPayments, debouncedSearchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {userType === 'client' ? 'My Payments' : 'Received Payments'}
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadPayments}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalSpent?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingPayments || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Escrow</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.heldInEscrow?.toFixed(2) || '0.00'}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedPayments || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={escrowStatusFilter}
              onChange={(e) => setEscrowStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Escrow Status</option>
              <option value="held">Held</option>
              <option value="released">Released</option>
              <option value="disputed">Disputed</option>
            </select>

            <Button variant="secondary" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600">Loading payments...</p>
          </div>
        ) : filteredPaymentsWithSearch.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No payments found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPaymentsWithSearch.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.contract?.title || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.description || 'No description'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(payment.status)}`}>
                            {payment.status}
                          </span>
                          {payment.escrowStatus && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEscrowBadgeColor(payment.escrowStatus)}`}>
                              {payment.escrowStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {userType === 'client' && payment.status === 'completed' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setRefundModal({
                                isOpen: true,
                                paymentId: payment.id,
                                amount: payment.amount
                              })}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Refund
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredPaymentsWithSearch.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {payment.contract?.title || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {payment.description || 'No description'}
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(payment.status)}`}>
                          {payment.status}
                        </span>
                        {payment.escrowStatus && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEscrowBadgeColor(payment.escrowStatus)}`}>
                            {payment.escrowStatus}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-gray-900">
                        ${payment.amount?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {userType === 'client' && payment.status === 'completed' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => setRefundModal({
                          isOpen: true,
                          paymentId: payment.id,
                          amount: payment.amount
                        })}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Refund
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {refundModal?.isOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><LoadingSpinner className="w-8 h-8" /></div>}>
          <RefundRequestModal
            paymentId={refundModal.paymentId}
            paymentAmount={refundModal.amount}
            onClose={() => setRefundModal(null)}
            onSuccess={() => {
              setRefundModal(null);
              loadPayments(); // Refresh the payments list
            }}
          />
        </Suspense>
      )}
    </div>
  );
});
