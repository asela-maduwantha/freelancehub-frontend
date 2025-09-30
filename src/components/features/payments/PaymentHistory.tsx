'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Feedback';
import { contractService } from '@/lib/api/contracts';
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
  TrendingDown
} from 'lucide-react';

interface TransactionHistoryProps {
  userType: 'client' | 'freelancer';
}

interface TransactionItem {
  id: string;
  type: 'contract_payment' | 'fund_release' | 'refund' | 'adjustment';
  amount: number;
  currency: string;
  description: string;
  contractTitle: string;
  milestoneTitle?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  completedAt?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userType }) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    type: undefined as 'contract_payment' | 'fund_release' | 'refund' | undefined,
    status: undefined as 'completed' | 'pending' | 'failed' | undefined
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // For upfront payment system, get contracts and their transaction history
      const contractsResponse = await contractService.getContracts(filters.page, filters.limit);

      // Transform contract data into transaction items
      const transactionItems: TransactionItem[] = [];

      contractsResponse.contracts.forEach((contract: any) => {
        // Add initial contract payment
        transactionItems.push({
          id: `contract-${contract._id}`,
          type: 'contract_payment',
          amount: contract.totalPaid,
          currency: contract.currency,
          description: `Upfront payment for contract: ${contract.title}`,
          contractTitle: contract.title,
          status: 'completed',
          createdAt: contract.createdAt || contract.startDate
        });

        // Add fund releases for approved milestones
        contract.milestones?.forEach((milestone: any) => {
          if (milestone.status === 'approved') {
            transactionItems.push({
              id: `release-${milestone._id}`,
              type: 'fund_release',
              amount: milestone.amount,
              currency: contract.currency,
              description: `Funds released for milestone: ${milestone.title}`,
              contractTitle: contract.title,
              milestoneTitle: milestone.title,
              status: 'completed',
              createdAt: milestone.updatedAt || milestone.createdAt
            });
          }
        });
      });

      // Sort transactions by date
      transactionItems.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });

      setTransactions(transactionItems);
      setTotalPages(Math.ceil(transactionItems.length / filters.limit));
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contract_payment':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'fund_release':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'refund':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && transactions.length === 0) {
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
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          <p className="text-sm text-gray-600 mt-1">
            View fund movements and releases for your contracts
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange({
                  type: e.target.value as any || undefined
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Types</option>
                <option value="contract_payment">Contract Payment</option>
                <option value="fund_release">Fund Release</option>
                <option value="refund">Refund</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({
                  status: e.target.value as any || undefined
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="createdAt">Date</option>
                <option value="amount">Amount</option>
                <option value="type">Type</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange({
                  sortOrder: e.target.value as 'asc' | 'desc'
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        {transactions.length === 0 && !loading ? (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.status || filters.type
                ? 'Try adjusting your filters to see more results.'
                : 'Your transaction history will appear here once you have contracts with fund movements.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        {transaction.type === 'contract_payment' ? (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {transaction.description}
                        {transaction.milestoneTitle && (
                          <span> • {transaction.milestoneTitle}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                    {transaction.completedAt && (
                      <div className="text-xs text-gray-400 mt-1">
                        Completed: {new Date(transaction.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {filters.page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => handlePageChange((filters.page || 1) - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange((filters.page || 1) + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TransactionHistory;