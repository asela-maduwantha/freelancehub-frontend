'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  CreditCard,
  Receipt,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { paymentAPI, authAPI } from '@/lib/api';
import Header from '@/components/ui/Header';

interface Payment {
  id: string;
  payeeId: string;
  payerId: string;
  projectId: string;
  milestoneId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  stripePaymentIntentId?: string;
  createdAt: string;
  completedAt?: string;
  contract: {
    id: string;
    title: string;
  };
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  totalFailed: number;
  paymentCount: number;
  averagePayment: number;
  monthlyStats: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

export default function FreelancerPayments() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    loadPayments();
  }, [router]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load payments
      const paymentsResponse = await paymentAPI.getPayments({
        limit: 50
      });
      setPayments(paymentsResponse as Payment[]);

      // Load stats
      const statsResponse = await paymentAPI.getPaymentStats();
      setStats(statsResponse as PaymentStats);
    } catch (error) {
      console.error('Failed to load payments:', error);
      setError('Failed to load payments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const filteredPayments = payments.filter(payment =>
    payment.contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing': return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-gray-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Payments</h1>
          <p className="text-gray-600">Track your earnings and payment history</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPaid)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPending)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <Receipt className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.paymentCount}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Payment</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averagePayment)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Monthly Stats Chart Placeholder */}
        {stats && stats.monthlyStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Earnings</h2>
            <div className="h-64 flex items-end justify-between space-x-2">
              {stats.monthlyStats.slice(-6).map((month, index) => (
                <div key={month.month} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-green-500 rounded-t w-full mb-2 transition-all duration-300 hover:bg-green-600"
                    style={{
                      height: `${Math.max((month.amount / Math.max(...stats.monthlyStats.map(m => m.amount))) * 200, 20)}px`
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 text-center">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-xs text-gray-500">{formatCurrency(month.amount)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'processing', 'completed', 'failed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payments List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPayments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms.' : 'You haven\'t received any payments yet.'}
                </p>
              </div>
            ) : (
              filteredPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {payment.contract.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>Payment ID: {payment.id.slice(-8)}</span>
                          <span>•</span>
                          <span>{formatDate(payment.createdAt)}</span>
                          {payment.completedAt && (
                            <>
                              <span>•</span>
                              <span>Completed: {formatDate(payment.completedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Milestone Payment</span>
                      <span>•</span>
                      <span>Via Stripe</span>
                      {payment.stripePaymentIntentId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-xs">
                            {payment.stripePaymentIntentId.slice(-8)}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      {payment.status === 'completed' && (
                        <button className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm">
                          <Download className="h-4 w-4" />
                          Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
