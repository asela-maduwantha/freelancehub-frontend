'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CreditCard,
  Wallet,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Receipt,
  FileText,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Payment {
  _id: string;
  contractId: string;
  projectTitle: string;
  clientName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed';
  type: 'milestone' | 'hourly' | 'fixed' | 'bonus';
  paymentDate: string;
  dueDate?: string;
  description: string;
  paymentMethod: string;
  transactionId?: string;
}

interface Withdrawal {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  requestDate: string;
  processedDate?: string;
  paymentMethod: string;
  bankAccount: string;
  fee: number;
  netAmount: number;
}

interface EarningsStats {
  totalEarnings: number;
  pendingPayments: number;
  availableBalance: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  averageProjectValue: number;
  paymentCount: number;
  successRate: number;
}

interface EarningsChart {
  period: string;
  earnings: number;
  payments: number;
}

const EarningsDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [earningsStats, setEarningsStats] = useState<EarningsStats | null>(null);
  const [earningsChart, setEarningsChart] = useState<EarningsChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'withdrawals' | 'analytics'>('payments');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    fetchEarningsData();
  }, [dateRange]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      // These would be actual API calls when the backend is ready
      // const paymentsResponse = await paymentsApi.getMyPayments({ period: dateRange });
      // const withdrawalsResponse = await paymentsApi.getMyWithdrawals();
      // const statsResponse = await paymentsApi.getEarningsStats();
      // const chartResponse = await analyticsApi.getEarningsChart(dateRange);

      // Mock data for now
      const mockStats: EarningsStats = {
        totalEarnings: 15640.50,
        pendingPayments: 2850.00,
        availableBalance: 3420.75,
        monthlyEarnings: 4250.00,
        yearlyEarnings: 42350.00,
        averageProjectValue: 1250.00,
        paymentCount: 28,
        successRate: 98.5
      };

      const mockPayments: Payment[] = [
        {
          _id: '1',
          contractId: 'c1',
          projectTitle: 'E-commerce Website Development',
          clientName: 'TechCorp Inc.',
          amount: 2500.00,
          currency: 'USD',
          status: 'completed',
          type: 'milestone',
          paymentDate: new Date().toISOString(),
          description: 'Milestone 3 - Frontend Implementation',
          paymentMethod: 'Bank Transfer',
          transactionId: 'TXN123456'
        },
        {
          _id: '2',
          contractId: 'c2',
          projectTitle: 'Mobile App UI Design',
          clientName: 'StartupXYZ',
          amount: 850.00,
          currency: 'USD',
          status: 'pending',
          type: 'fixed',
          paymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Final payment for UI design project',
          paymentMethod: 'PayPal'
        }
      ];

      const mockWithdrawals: Withdrawal[] = [
        {
          _id: '1',
          amount: 2000.00,
          currency: 'USD',
          status: 'completed',
          requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          processedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'Bank Transfer',
          bankAccount: '****1234',
          fee: 25.00,
          netAmount: 1975.00
        }
      ];

      const mockChart: EarningsChart[] = [
        { period: 'Jan', earnings: 3200, payments: 5 },
        { period: 'Feb', earnings: 2800, payments: 4 },
        { period: 'Mar', earnings: 4100, payments: 7 },
        { period: 'Apr', earnings: 3650, payments: 6 },
        { period: 'May', earnings: 4250, payments: 8 }
      ];

      setEarningsStats(mockStats);
      setPayments(mockPayments);
      setWithdrawals(mockWithdrawals);
      setEarningsChart(mockChart);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      const amount = parseFloat(withdrawAmount);
      if (amount <= 0 || amount > (earningsStats?.availableBalance || 0)) {
        alert('Invalid withdrawal amount');
        return;
      }

      // API call would go here
      // await paymentsApi.requestWithdrawal({ amount, paymentMethod: 'bank' });
      
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      await fetchEarningsData();
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Calendar className="w-4 h-4" />;
      case 'hourly': return <Clock className="w-4 h-4" />;
      case 'fixed': return <FileText className="w-4 h-4" />;
      case 'bonus': return <PiggyBank className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const maxEarnings = Math.max(...earningsChart.map(item => item.earnings));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex space-x-4 mt-4 lg:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>

          <Button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>Withdraw</span>
          </Button>

          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {earningsStats && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold">${earningsStats.totalEarnings.toLocaleString()}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      +12.5% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wallet className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <p className="text-2xl font-bold">${earningsStats.availableBalance.toLocaleString()}</p>
                    <p className="text-sm text-blue-600">Ready to withdraw</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold">${earningsStats.pendingPayments.toLocaleString()}</p>
                    <p className="text-sm text-yellow-600">{payments.filter(p => p.status === 'pending').length} payments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Project Value</p>
                    <p className="text-2xl font-bold">${earningsStats.averageProjectValue.toLocaleString()}</p>
                    <p className="text-sm text-purple-600">Success rate: {earningsStats.successRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Earnings Overview</h3>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end space-x-4">
            {earningsChart.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                  style={{ 
                    height: `${(item.earnings / maxEarnings) * 200}px`,
                    minHeight: '10px'
                  }}
                  title={`$${item.earnings.toLocaleString()}`}
                ></div>
                <p className="text-sm text-gray-600 mt-2">{item.period}</p>
                <p className="text-xs text-gray-500">${item.earnings.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1">
        {(['payments', 'withdrawals', 'analytics'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'outline'}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'payments' && (
        <>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Payments List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredPayments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'You don\'t have any payments yet'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPayments.map((payment) => (
                <motion.div key={payment._id} variants={itemVariants}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getPaymentTypeIcon(payment.type)}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-gray-900">{payment.projectTitle}</h3>
                            <p className="text-sm text-gray-600">{payment.clientName}</p>
                            <p className="text-xs text-gray-500">{payment.description}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="text-lg font-bold">${payment.amount.toLocaleString()}</p>
                              <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                            </div>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-500">
                            {payment.status === 'pending' && payment.dueDate ? (
                              <p>Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                            ) : (
                              <p>Paid: {new Date(payment.paymentDate).toLocaleDateString()}</p>
                            )}
                            {payment.transactionId && (
                              <p className="text-xs">TXN: {payment.transactionId}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </>
      )}

      {activeTab === 'withdrawals' && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {withdrawals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawals yet</h3>
                <p className="text-gray-500">Your withdrawal history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            withdrawals.map((withdrawal) => (
              <motion.div key={withdrawal._id} variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">Withdrawal to {withdrawal.bankAccount}</h3>
                          <p className="text-sm text-gray-600">{withdrawal.paymentMethod}</p>
                          <p className="text-xs text-gray-500">
                            Fee: ${withdrawal.fee} • Net: ${withdrawal.netAmount}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-lg font-bold">${withdrawal.amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">
                              {withdrawal.processedDate 
                                ? new Date(withdrawal.processedDate).toLocaleDateString()
                                : 'Processing'
                              }
                            </p>
                          </div>
                          <Badge className={getStatusColor(withdrawal.status)}>
                            {withdrawal.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {activeTab === 'analytics' && earningsStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Payment Breakdown</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Milestone Payments</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Fixed Price Projects</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hourly Work</span>
                  <span className="font-medium">8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bonuses</span>
                  <span className="font-medium">2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Key Metrics</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Payments</span>
                  <span className="font-bold">{earningsStats.paymentCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Success Rate</span>
                  <span className="font-bold text-green-600">{earningsStats.successRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Monthly Growth</span>
                  <span className="font-bold text-green-600">+12.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Payment Time</span>
                  <span className="font-bold">3.2 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Request Withdrawal</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Balance
                </label>
                <p className="text-2xl font-bold text-green-600">
                  ${earningsStats?.availableBalance.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={earningsStats?.availableBalance}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Processing fee: $25 | Net amount: ${Math.max(0, parseFloat(withdrawAmount || '0') - 25).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="bank">Bank Transfer (3-5 business days)</option>
                  <option value="paypal">PayPal (1-2 business days)</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                className="flex-1"
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
              >
                Request Withdrawal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsDashboard;
