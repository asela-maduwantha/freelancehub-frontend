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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { paymentsService, PaymentStats } from '@/lib/api/payments.service';
import { IPayment } from '@/lib/types';

export default function ClientPaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [filteredPayments, setFilteredPayments] = useState<IPayment[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadPayments();
      loadStats();
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [payments, statusFilter, projectFilter]);

  const loadPayments = async () => {
    try {
      const response = await paymentsService.getPayments();
      setPayments((response as any).data || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
      // Mock data for demonstration
      const mockPayments: IPayment[] = [
        {
          _id: '1',
          id: '1',
          contractId: 'contract-1',
          payeeId: 'freelancer-1',
          payerId: 'client-1',
          projectId: 'project-1',
          milestoneId: 'milestone-1',
          amount: 550,
          currency: 'USD',
          status: 'completed',
          type: 'milestone',
          stripePaymentIntentId: 'pi_1234567890',
          createdAt: '2024-01-25T10:00:00Z',
          completedAt: '2024-01-25T10:05:00Z',
          contract: {
            id: 'contract-1',
            title: 'Build E-commerce Website'
          },
          freelancer: {
            id: 'freelancer-1',
            firstName: 'John',
            lastName: 'Developer'
          }
        },
        {
          _id: '2',
          id: '2',
          contractId: 'contract-2',
          payeeId: 'freelancer-2',
          payerId: 'client-1',
          projectId: 'project-2',
          milestoneId: 'milestone-2',
          amount: 1100,
          currency: 'USD',
          status: 'completed',
          type: 'milestone',
          stripePaymentIntentId: 'pi_0987654321',
          createdAt: '2024-02-10T14:30:00Z',
          completedAt: '2024-02-10T14:35:00Z',
          contract: {
            id: 'contract-2',
            title: 'Mobile App UI Design'
          },
          freelancer: {
            id: 'freelancer-2',
            firstName: 'Sarah',
            lastName: 'Designer'
          }
        },
        {
          _id: '3',
          id: '3',
          contractId: 'contract-1',
          payeeId: 'freelancer-1',
          payerId: 'client-1',
          projectId: 'project-1',
          milestoneId: 'milestone-3',
          amount: 1100,
          currency: 'USD',
          status: 'pending',
          type: 'milestone',
          createdAt: '2024-02-15T09:00:00Z',
          contract: {
            id: 'contract-1',
            title: 'Build E-commerce Website'
          },
          freelancer: {
            id: 'freelancer-1',
            firstName: 'John',
            lastName: 'Developer'
          }
        }
      ];
      setPayments(mockPayments);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await paymentsService.getPaymentStats();
      setStats((response as any).data);
    } catch (error) {
      console.error('Failed to load payment stats:', error);
      // Mock stats for demonstration
      const mockStats: PaymentStats = {
        totalPaid: 1650,
        totalReceived: 1650,
        pendingPayments: 1,
        completedPayments: 2,
        totalPending: 1100,
        totalFailed: 0,
        paymentCount: 3,
        averagePayment: 825,
        monthlyStats: [
          {
            month: '2024-01',
            amount: 550,
            count: 1
          },
          {
            month: '2024-02',
            amount: 1650,
            count: 2
          }
        ],
        currency: 'USD'
      };
      setStats(mockStats);
    }
  };

  const applyFilters = () => {
    let filtered = payments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (projectFilter !== 'all') {
      filtered = filtered.filter(payment => payment.projectId === projectFilter);
    }

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <Link
              href="/client/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

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
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600 font-poppins">
                    {formatCurrency(stats.totalPaid, 'USD')}
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
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 font-poppins">
                    {formatCurrency(stats.totalPending, 'USD')}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-blue-600 font-poppins">
                    {stats.paymentCount}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Payment</p>
                  <p className="text-2xl font-bold text-purple-600 font-poppins">
                    {formatCurrency(stats.averagePayment, 'USD')}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 font-poppins">
              Payment History ({filteredPayments.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                          {formatCurrency(payment.amount, payment.currency)}
                        </h3>
                        <p className="text-gray-600">{payment.contract?.title || 'Unknown Project'}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{payment.freelancer?.firstName || 'Unknown'} {payment.freelancer?.lastName || 'Freelancer'}</span>
                          <span>•</span>
                          <span>{formatDate(payment.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {payment.status === 'pending' && (
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500 mb-6">
                  {statusFilter === 'all' && projectFilter === 'all'
                    ? 'Payments will appear here once you start making payments to freelancers'
                    : 'No payments match your current filters'
                  }
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/client/contracts">
                    <Button variant="premium" className="font-poppins">
                      View Contracts
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter('all');
                      setProjectFilter('all');
                    }}
                    className="font-inter"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
