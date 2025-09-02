'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Banknote,
  Receipt,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DataTable from '@/components/ui/DataTable';
import AppLayout from '@/components/layout/AppLayout';
import { paymentAPI } from '@/lib/api';

interface Payment {
  id: string;
  contractId: string;
  projectTitle: string;
  client: {
    name: string;
    id: string;
  };
  amount: number;
  type: 'milestone' | 'hourly' | 'bonus' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentDate: string;
  dueDate?: string;
  description: string;
  method: 'bank_transfer' | 'paypal' | 'stripe' | 'wire';
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
  netAmount: number;
}

interface Filters {
  status: string;
  type: string;
  period: string;
  search: string;
}

const statusFilters = [
  { value: '', label: 'All Payments' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const typeFilters = [
  { value: '', label: 'All Types' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'refund', label: 'Refund' }
];

const periodFilters = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
];

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    status: '',
    type: '',
    period: 'month',
    search: ''
  });

  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    pending: 0,
    completed: 0,
    averagePayment: 0,
    totalFees: 0,
    growthRate: 0
  });

  const [chartData, setChartData] = useState({
    monthlyEarnings: [] as Array<{ month: string; amount: number }>,
    paymentMethods: [] as Array<{ method: string; amount: number; count: number }>
  });

  useEffect(() => {
    loadPayments();
  }, [filters]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data for now - replace with actual API call
      const mockPayments: Payment[] = [
        {
          id: '1',
          contractId: 'contract1',
          projectTitle: 'E-commerce Website Development',
          client: { name: 'John Doe', id: 'client1' },
          amount: 100000, // $1000 in cents
          type: 'milestone',
          status: 'completed',
          paymentDate: new Date().toISOString(),
          description: 'Design Phase Milestone',
          method: 'stripe',
          fees: { platform: 5000, processing: 2900, total: 7900 },
          netAmount: 92100
        },
        {
          id: '2',
          contractId: 'contract2',
          projectTitle: 'Mobile App UI/UX Design',
          client: { name: 'Jane Smith', id: 'client2' },
          amount: 80000,
          type: 'milestone',
          status: 'completed',
          paymentDate: new Date(Date.now() - 86400000).toISOString(),
          description: 'Research & Wireframes',
          method: 'paypal',
          fees: { platform: 4000, processing: 2320, total: 6320 },
          netAmount: 73680
        },
        {
          id: '3',
          contractId: 'contract3',
          projectTitle: 'Content Writing Services',
          client: { name: 'Mike Johnson', id: 'client3' },
          amount: 50000,
          type: 'hourly',
          status: 'pending',
          paymentDate: new Date(Date.now() + 86400000).toISOString(),
          dueDate: new Date(Date.now() + 172800000).toISOString(),
          description: 'Weekly payment for 10 hours',
          method: 'bank_transfer',
          fees: { platform: 2500, processing: 0, total: 2500 },
          netAmount: 47500
        },
        {
          id: '4',
          contractId: 'contract1',
          projectTitle: 'E-commerce Website Development',
          client: { name: 'John Doe', id: 'client1' },
          amount: 25000,
          type: 'bonus',
          status: 'completed',
          paymentDate: new Date(Date.now() - 259200000).toISOString(),
          description: 'Early delivery bonus',
          method: 'stripe',
          fees: { platform: 1250, processing: 725, total: 1975 },
          netAmount: 23025
        }
      ];

      // Apply filters
      let filteredPayments = mockPayments;
      if (filters.status) {
        filteredPayments = filteredPayments.filter(p => p.status === filters.status);
      }
      if (filters.type) {
        filteredPayments = filteredPayments.filter(p => p.type === filters.type);
      }
      if (filters.search) {
        filteredPayments = filteredPayments.filter(p => 
          p.projectTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.client.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setPayments(filteredPayments);

      // Calculate stats
      const totalEarnings = mockPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.netAmount, 0);
      
      const thisMonth = mockPayments
        .filter(p => {
          const paymentDate = new Date(p.paymentDate);
          const now = new Date();
          return p.status === 'completed' && 
                 paymentDate.getMonth() === now.getMonth() && 
                 paymentDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, p) => sum + p.netAmount, 0);

      const pendingAmount = mockPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.netAmount, 0);

      const completedCount = mockPayments.filter(p => p.status === 'completed').length;
      const averagePayment = completedCount > 0 ? totalEarnings / completedCount : 0;

      const totalFees = mockPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.fees.total, 0);

      setStats({
        totalEarnings,
        thisMonth,
        pending: pendingAmount,
        completed: mockPayments.filter(p => p.status === 'completed').length,
        averagePayment,
        totalFees,
        growthRate: 15.2 // Mock growth rate
      });

      // Chart data
      setChartData({
        monthlyEarnings: [
          { month: 'Oct', amount: 150000 },
          { month: 'Nov', amount: 180000 },
          { month: 'Dec', amount: 220000 },
          { month: 'Jan', amount: thisMonth }
        ],
        paymentMethods: [
          { method: 'Stripe', amount: 150000, count: 5 },
          { method: 'PayPal', amount: 80000, count: 3 },
          { method: 'Bank Transfer', amount: 50000, count: 2 }
        ]
      });

    } catch (error) {
      console.error('Failed to load payments:', error);
      setError('Failed to load payments. Please try again.');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'hourly': return <Clock className="h-4 w-4 text-green-500" />;
      case 'bonus': return <ArrowUpRight className="h-4 w-4 text-purple-500" />;
      case 'refund': return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default: return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      key: 'projectTitle' as keyof Payment,
      title: 'Project',
      render: (value: string, payment: Payment) => (
        <div>
          <Link href={`/freelancer/contracts/${payment.contractId}`}>
            <h3 className="font-medium text-gray-900 hover:text-green-600 transition-colors">
              {value}
            </h3>
          </Link>
          <p className="text-sm text-gray-500">Client: {payment.client.name}</p>
          <p className="text-xs text-gray-400">{payment.description}</p>
        </div>
      )
    },
    {
      key: 'type' as keyof Payment,
      title: 'Type',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          {getTypeIcon(value)}
          <span className="capitalize text-sm font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'amount' as keyof Payment,
      title: 'Amount',
      render: (value: number, payment: Payment) => (
        <div>
          <p className="font-semibold text-gray-900">
            {formatCurrency(value)}
          </p>
          <p className="text-sm text-green-600">
            Net: {formatCurrency(payment.netAmount)}
          </p>
          <p className="text-xs text-gray-500">
            Fees: {formatCurrency(payment.fees.total)}
          </p>
        </div>
      )
    },
    {
      key: 'status' as keyof Payment,
      title: 'Status',
      render: (value: string, payment: Payment) => (
        <div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(value)}
            <span className="capitalize text-sm font-medium">{value}</span>
          </div>
          {payment.dueDate && value === 'pending' && (
            <p className="text-xs text-gray-500 mt-1">
              Due: {formatDate(payment.dueDate)}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'paymentDate' as keyof Payment,
      title: 'Date',
      render: (value: string, payment: Payment) => (
        <div>
          <span className="text-sm text-gray-700">
            {formatDate(value)}
          </span>
          <p className="text-xs text-gray-500 capitalize">
            via {payment.method.replace('_', ' ')}
          </p>
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (payment: Payment) => {
        router.push(`/freelancer/payments/${payment.id}`);
      },
      icon: Receipt
    },
    {
      label: 'Download Receipt',
      onClick: (payment: Payment) => {
        // Handle receipt download
        console.log('Download receipt:', payment.id);
      },
      icon: Download
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">
              Payments & Earnings
            </h1>
            <p className="text-gray-600 font-inter">
              Track your income, payments, and financial performance
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button variant="premium" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+{stats.growthRate}% this month</span>
                </div>
              </div>
              <DollarSign className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.thisMonth)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.averagePayment)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fees</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(stats.totalFees)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Earnings Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings</h3>
            <div className="space-y-4">
              {chartData.monthlyEarnings.map((item, index) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(item.amount / 250000) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-4">
              {chartData.paymentMethods.map((method) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{method.method}</p>
                      <p className="text-xs text-gray-500">{method.count} payments</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(method.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
            >
              {statusFilters.map(filter => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
            >
              {typeFilters.map(filter => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>

            {/* Period Filter */}
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
            >
              {periodFilters.map(filter => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payments Table */}
        <DataTable
          data={payments}
          columns={columns}
          loading={isLoading}
          emptyTitle="No payments found"
          emptyDescription="You haven't received any payments yet. Complete milestones to start earning."
          emptyIcon={DollarSign}
          actions={actions}
          onRowClick={(payment) => router.push(`/freelancer/payments/${payment.id}`)}
          rowClassName={(payment) => 
            payment.status === 'completed' ? 'bg-green-50 border-green-200' :
            payment.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
            payment.status === 'failed' ? 'bg-red-50 border-red-200' : ''
          }
        />
      </div>
    </AppLayout>
  );
}
