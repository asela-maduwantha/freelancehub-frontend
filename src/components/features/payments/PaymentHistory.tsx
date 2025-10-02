'use client';

import React, { useState } from 'react';
import { usePayments } from '@/lib/hooks/usePayments';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Feedback';
import { formatCurrency } from '@/lib/utils/formatting';
import {
  CreditCard,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw
} from 'lucide-react';

interface PaymentHistoryProps {
  userType: 'client' | 'freelancer';
}

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
type PaymentFilter = 'all' | 'completed' | 'pending' | 'failed';

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userType }) => {
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const {
    payments,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
    getPaymentById
  } = usePayments({
    status: filter === 'all' ? undefined : filter,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleFilterChange = (newFilter: PaymentFilter) => {
    setFilter(newFilter);
    setFilters({
      status: newFilter === 'all' ? undefined : newFilter,
      page: 1
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const handleViewDetails = async (paymentId: string) => {
    const paymentDetails = await getPaymentById(paymentId);
    if (paymentDetails) {
      // In a real app, you might open a modal or navigate to a detail page
      console.log('Payment details:', paymentDetails);
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'refunded':
        return <TrendingDown className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100';
      case 'pending':
        return 'text-yellow-800 bg-yellow-100';
      case 'processing':
        return 'text-blue-800 bg-blue-100';
      case 'failed':
        return 'text-red-800 bg-red-100';
      case 'refunded':
        return 'text-orange-800 bg-orange-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const filteredPayments = payments.filter(payment =>
    searchTerm === '' ||
    (payment.contractId?.title && payment.contractId.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (payment.id && payment.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (payment.description && payment.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
          <p className="text-gray-600 mt-1">
            Track all your payment transactions and their status
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value as PaymentFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('_');
                  setFilters({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Payments List */}
      {filteredPayments.length > 0 ? (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(payment.status)}
                  </div>

                  {/* Payment Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {payment.contractId?.title || payment.description || 'Payment'}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(payment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                      {payment.id && (
                        <span className="font-mono text-xs">
                          ID: {payment.id.slice(0, 8)}...
                        </span>
                      )}
                    </div>

                    {payment.description && !payment.contractId && (
                      <div className="text-sm text-gray-500 mt-1">
                        {payment.description}
                      </div>
                    )}

                    {payment.milestoneId && (
                      <div className="text-sm text-gray-500 mt-1">
                        Milestone: {payment.milestoneId.title}
                      </div>
                    )}

                    {payment.platformFee !== undefined && (
                      <div className="text-sm text-gray-500 mt-1">
                        Platform Fee: {formatCurrency(payment.platformFee, payment.currency)}
                        {userType === 'freelancer' && payment.freelancerAmount && (
                          <span className="ml-2 text-green-600 font-medium">
                            You receive: {formatCurrency(payment.freelancerAmount, payment.currency)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {payment.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(payment.id!)}
                      className="flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <CreditCard className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No payments found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm || filter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'You haven\'t made any payments yet. Payments will appear here once you start working with freelancers.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} payments
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;