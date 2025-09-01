'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  Calendar,
  MessageSquare,
  Star,
  AlertCircle,
  Eye,
  Upload,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { contractAPI, authAPI } from '@/lib/api';
import Header from '@/components/ui/Header';

interface Contract {
  id: string;
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
  };
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  budget: {
    amount: number;
    currency: string;
  };
  startDate: string;
  endDate?: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    dueDate: string;
    submittedAt?: string;
  }>;
  progress: number;
}

interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalEarnings: number;
  pendingPayments: number;
}

export default function FreelancerContracts() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    loadContracts();
  }, [router]);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load contracts
      const contractsResponse = await contractAPI.getContracts({
        status: filter === 'all' ? undefined : filter,
        limit: 50
      });

      const contractsData = contractsResponse.contracts || contractsResponse.data || [];
      setContracts(contractsData);

      // Calculate stats
      const totalContracts = contractsData.length;
      const activeContracts = contractsData.filter((c: Contract) => c.status === 'active').length;
      const completedContracts = contractsData.filter((c: Contract) => c.status === 'completed').length;
      const totalEarnings = contractsData
        .filter((c: Contract) => c.status === 'completed')
        .reduce((sum: number, c: Contract) => sum + c.budget.amount, 0);
      const pendingPayments = contractsData
        .filter((c: Contract) => c.status === 'active')
        .reduce((sum: number, c: Contract) => {
          const pendingMilestones = c.milestones.filter((m: any) => m.status === 'completed').length;
          return sum + (c.budget.amount * pendingMilestones / c.milestones.length);
        }, 0);

      setStats({
        totalContracts,
        activeContracts,
        completedContracts,
        totalEarnings,
        pendingPayments
      });

    } catch (error) {
      console.error('Failed to load contracts:', error);
      setError('Failed to load contracts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, [filter]);

  const filteredContracts = contracts.filter(contract =>
    contract.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.client.lastName.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'disputed': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-gray-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Contracts</h1>
          <p className="text-gray-600">Manage your project contracts and track progress</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
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
                <Clock className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
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
                <CheckCircle className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedContracts}</p>
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
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingPayments)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'completed', 'cancelled'] as const).map((status) => (
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

        {/* Contracts List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredContracts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms.' : 'You haven\'t been assigned to any contracts yet.'}
                </p>
              </div>
            ) : (
              filteredContracts.map((contract, index) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {contract.project.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{contract.project.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{contract.client.firstName} {contract.client.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(contract.budget.amount, contract.budget.currency)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Started {formatDate(contract.startDate)}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/freelancer/contracts/${contract.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </div>

                  {/* Milestones */}
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Milestones</h4>
                    <div className="space-y-3">
                      {contract.milestones.map((milestone, milestoneIndex) => (
                        <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                                {milestone.status.replace('_', ' ').charAt(0).toUpperCase() + milestone.status.replace('_', ' ').slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Due: {formatDate(milestone.dueDate)}</span>
                              <span>{formatCurrency(milestone.amount, contract.budget.currency)}</span>
                              {milestone.submittedAt && (
                                <span>Submitted: {formatDate(milestone.submittedAt)}</span>
                              )}
                            </div>
                          </div>
                          {contract.status === 'active' && milestone.status === 'in_progress' && (
                            <button className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
                              <Upload className="h-4 w-4" />
                              Submit Work
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{contract.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${contract.progress}%` }}
                      ></div>
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
