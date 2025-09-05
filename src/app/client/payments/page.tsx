'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  DollarSign,
  CreditCard,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  User,
  Wallet,
  Shield,
  Zap,
  Plus,
  Settings,
  Receipt,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { paymentsService } from '@/lib/api/payments.service';
import { IPayment, IPaymentStats, IEscrowPayment } from '@/lib/types';
import { usePaymentStore } from '@/lib/stores/payment.store';

export default function ClientPaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [escrowPayments, setEscrowPayments] = useState<IEscrowPayment[]>([]);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [selectedEscrowPayment, setSelectedEscrowPayment] = useState<IEscrowPayment | null>(null);

  const {
    payments,
    stats,
    isLoading,
    error,
    statusFilter,
    projectFilter,
    filteredPayments,
    setPayments,
    setStats,
    setLoading,
    setError,
    setStatusFilter,
    setProjectFilter,
  } = usePaymentStore();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadPayments();
      loadStats();
      loadEscrowPayments();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const paymentsData = await paymentsService.getPayments();
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      console.error('Failed to load payments:', error);
      setError('Failed to load payments. Please try again.');
      setPayments([]);
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
      setError('Failed to load payment statistics. Please try again.');
      setStats(null);
    }
  };

  const loadEscrowPayments = async () => {
    try {
      const escrowData = await paymentsService.getEscrowPayments();
      setEscrowPayments(Array.isArray(escrowData) ? escrowData : []);
    } catch (error) {
      console.error('Failed to load escrow payments:', error);
      // Don't show error to user for escrow, just set empty array
      setEscrowPayments([]);
    }
  };

  const handleReleaseEscrow = async (paymentId: string) => {
    try {
      await paymentsService.releaseEscrowPayment(paymentId);
      loadEscrowPayments();
      loadPayments();
      loadStats();
    } catch (error) {
      console.error('Failed to release escrow:', error);
      setError('Failed to release payment from escrow.');
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const blob = await paymentsService.downloadReceipt(paymentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      setError('Failed to download receipt.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const getUniqueProjects = () => {
    const projects = payments.map(payment => ({
      id: payment.projectId,
      title: payment.contract?.title || 'Unknown Project',
    }));
    return Array.from(new Set(projects.map(p => p.id)))
      .map(id => projects.find(p => p.id === id))
      .filter(Boolean);
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payments</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => { loadPayments(); loadStats(); }} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
              Payment History
            </h1>
            <p className="text-gray-600 font-inter">
              Monitor your payments and track expenses
            </p>
          </div>
          <div className="flex space-x-4 mt-4 lg:mt-0">
            <Link href="/client/payments/recurring">
              <Button variant="outline" className="font-inter">
                <Calendar className="h-4 w-4 mr-2" />
                Recurring
              </Button>
            </Link>
            <Link href="/client/payments/bulk">
              <Button variant="outline" className="font-inter">
                <Plus className="h-4 w-4 mr-2" />
                Bulk Payment
              </Button>
            </Link>
            <Button variant="outline" className="font-inter">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600 font-poppins">
                    {formatCurrency(stats.totalSpent, 'USD')}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-blue-600 font-poppins">
                    {formatCurrency(stats.availableBalance, 'USD')}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Held in Escrow</p>
                  <p className="text-2xl font-bold text-yellow-600 font-poppins">
                    {formatCurrency(stats.heldInEscrow, 'USD')}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                  <p className="text-2xl font-bold text-purple-600 font-poppins">
                    {formatCurrency(stats.platformFees, 'USD')}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/client/payments/create">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Make Payment</h3>
                  <p className="text-green-100">Pay for completed milestones</p>
                </div>
                <Plus className="h-8 w-8" />
              </div>
            </motion.div>
          </Link>

          <Link href="/client/payments/wallet">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Wallet</h3>
                  <p className="text-blue-100">Manage balance & methods</p>
                </div>
                <Wallet className="h-8 w-8" />
              </div>
            </motion.div>
          </Link>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowEscrowModal(true)}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Escrow Management</h3>
                <p className="text-yellow-100">Release held payments</p>
              </div>
              <Lock className="h-8 w-8" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="all">All Projects</option>
              {getUniqueProjects().map((project) => (
                <option key={project?.id} value={project?.id}>
                  {project?.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 font-poppins">
                Payment History ({filteredPayments.length})
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Processing</span>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      {/* Status Indicator */}
                      <div className={`flex-shrink-0 w-4 h-4 rounded-full ${
                        payment.status === 'completed' ? 'bg-green-500' :
                        payment.status === 'pending' ? 'bg-yellow-500' :
                        payment.status === 'processing' ? 'bg-blue-500' :
                        payment.status === 'failed' ? 'bg-red-500' :
                        payment.status === 'refunded' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>

                      {/* Payment Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-purple-600 rounded-full flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 font-poppins">
                            {formatCurrency(payment.amount, payment.currency)}
                          </h3>
                          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            payment.status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-2 capitalize">{payment.status}</span>
                          </div>
                          {payment.escrowStatus === 'held' && (
                            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              <Lock className="h-3 w-3 inline mr-1" />
                              Escrow
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 font-medium mb-1">{payment.contract?.title || 'Unknown Project'}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>{payment.freelancer?.firstName || 'Unknown'} {payment.freelancer?.lastName || 'Freelancer'}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(payment.createdAt)}</span>
                          </div>
                          {payment.platformFee > 0 && (
                            <div className="flex items-center">
                              <Receipt className="h-4 w-4 mr-1" />
                              <span>Fee: {formatCurrency(payment.platformFee, payment.currency)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/client/payments/${payment.id}`)}
                        className="px-4 py-2"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      {payment.status === 'completed' && payment.receipt && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment.id)}
                          className="border-green-300 text-green-600 hover:bg-green-50 px-4 py-2"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      )}
                      {payment.escrowStatus === 'held' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReleaseEscrow(payment.id)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Release
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-purple-100 rounded-full mb-6">
                  <CreditCard className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {statusFilter === 'all' && projectFilter === 'all' ? 'No payments yet' : 'No payments found'}
                </h3>
                <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
                  {statusFilter === 'all' && projectFilter === 'all'
                    ? 'Payments will appear here once you start making payments to freelancers'
                    : 'No payments match your current filters'
                  }
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link href="/client/contracts">
                    <Button variant="premium" className="px-8 py-3 text-lg">
                      View Contracts
                    </Button>
                  </Link>
                  {(statusFilter !== 'all' || projectFilter !== 'all') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStatusFilter('all');
                        setProjectFilter('all');
                      }}
                      className="px-6 py-3"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Escrow Management Modal */}
      {showEscrowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Escrow Management</h2>
                <button
                  onClick={() => setShowEscrowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {escrowPayments.length > 0 ? (
                <div className="space-y-4">
                  {escrowPayments.map((escrow) => (
                    <div key={escrow.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatCurrency(escrow.amount, 'USD')}
                          </h3>
                          <p className="text-gray-600">{escrow.milestone.title}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          escrow.status === 'held' ? 'bg-yellow-100 text-yellow-800' :
                          escrow.status === 'released' ? 'bg-green-100 text-green-800' :
                          escrow.status === 'disputed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {escrow.status === 'held' && <Lock className="h-4 w-4 inline mr-1" />}
                          {escrow.status === 'released' && <CheckCircle className="h-4 w-4 inline mr-1" />}
                          {escrow.status === 'disputed' && <AlertTriangle className="h-4 w-4 inline mr-1" />}
                          <span className="capitalize">{escrow.status}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>Freelancer: {escrow.freelancer.name}</span>
                        <span>Held: {formatDate(escrow.heldAt)}</span>
                        {escrow.autoReleaseAt && (
                          <span>Auto-release: {formatDate(escrow.autoReleaseAt)}</span>
                        )}
                      </div>

                      {escrow.status === 'held' && (
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleReleaseEscrow(escrow.paymentId)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Release Payment
                          </Button>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Dispute
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Escrow Payments</h3>
                  <p className="text-gray-600">All payments have been released or there are no held payments.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
