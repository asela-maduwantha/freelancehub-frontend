'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  MessageSquare,
  Star,
  BarChart3,
  Milestone,
  Target,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DataTable from '@/components/ui/DataTable';
import ProgressTracker from '@/components/ui/ProgressTracker';
import AppLayout from '@/components/layout/AppLayout';
import { contractsService } from '@/lib/api';

interface Contract {
  id: string;
  projectId: string;
  projectTitle: string;
  client: {
    name: string;
    id: string;
    avatar?: string;
    rating: number;
  };
  totalBudget?: number; // Optional for hourly contracts
  hourlyRate?: number;
  contractType: 'fixed' | 'hourly';
  status: 'active' | 'completed' | 'paused' | 'cancelled' | 'dispute';
  startDate: string;
  endDate?: string;
  progress: number;
  hoursWorked?: number;
  totalHours?: number;
  milestones: Array<{
    id: string;
    title: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    description?: string;
  }>;
  earnings: {
    total: number;
    paid: number;
    pending: number;
  };
  lastActivity: string;
}

interface Filters {
  status: string;
  contractType: string;
  search: string;
}

const statusFilters = [
  { value: '', label: 'All Contracts' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'dispute', label: 'In Dispute' }
];

const typeFilters = [
  { value: '', label: 'All Types' },
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' }
];

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    status: '',
    contractType: '',
    search: ''
  });

  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    averageRating: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadContracts();
  }, [filters]);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data for now - replace with actual API call
      const mockContracts: Contract[] = [
        {
          id: '1',
          projectId: 'proj1',
          projectTitle: 'E-commerce Website Development',
          client: {
            name: 'John Doe',
            id: 'client1',
            rating: 4.8
          },
          totalBudget: 250000, // $2500 in cents
          contractType: 'fixed',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-02-15',
          progress: 65,
          milestones: [
            {
              id: 'm1',
              title: 'Design Phase',
              amount: 100000,
              dueDate: '2024-01-15',
              status: 'completed'
            },
            {
              id: 'm2',
              title: 'Development Phase',
              amount: 100000,
              dueDate: '2024-02-01',
              status: 'in_progress'
            },
            {
              id: 'm3',
              title: 'Testing & Deployment',
              amount: 50000,
              dueDate: '2024-02-15',
              status: 'pending'
            }
          ],
          earnings: {
            total: 250000,
            paid: 100000,
            pending: 100000
          },
          lastActivity: new Date().toISOString()
        },
        {
          id: '2',
          projectId: 'proj2',
          projectTitle: 'Mobile App UI/UX Design',
          client: {
            name: 'Jane Smith',
            id: 'client2',
            rating: 4.9
          },
          totalBudget: 180000,
          contractType: 'fixed',
          status: 'completed',
          startDate: '2023-12-01',
          endDate: '2023-12-30',
          progress: 100,
          milestones: [
            {
              id: 'm4',
              title: 'Research & Wireframes',
              amount: 80000,
              dueDate: '2023-12-10',
              status: 'completed'
            },
            {
              id: 'm5',
              title: 'Design & Prototype',
              amount: 100000,
              dueDate: '2023-12-30',
              status: 'completed'
            }
          ],
          earnings: {
            total: 180000,
            paid: 180000,
            pending: 0
          },
          lastActivity: '2023-12-30'
        },
        {
          id: '3',
          projectId: 'proj3',
          projectTitle: 'Content Writing Services',
          client: {
            name: 'Mike Johnson',
            id: 'client3',
            rating: 4.7
          },
          totalBudget: 250000, // $50/hr * 50 hours = $2500
          hourlyRate: 5000, // $50/hr in cents
          contractType: 'hourly',
          status: 'active',
          startDate: '2024-01-10',
          progress: 40,
          hoursWorked: 20,
          totalHours: 50,
          milestones: [],
          earnings: {
            total: 250000,
            paid: 50000,
            pending: 50000
          },
          lastActivity: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      // Apply filters
      let filteredContracts = mockContracts;
      if (filters.status) {
        filteredContracts = filteredContracts.filter(c => c.status === filters.status);
      }
      if (filters.contractType) {
        filteredContracts = filteredContracts.filter(c => c.contractType === filters.contractType);
      }
      if (filters.search) {
        filteredContracts = filteredContracts.filter(c => 
          c.projectTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
          c.client.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setContracts(filteredContracts);

      // Calculate stats
      const totalEarnings = mockContracts.reduce((sum, c) => sum + c.earnings.paid, 0);
      const pendingPayments = mockContracts.reduce((sum, c) => sum + c.earnings.pending, 0);
      const averageRating = mockContracts.reduce((sum, c) => sum + c.client.rating, 0) / mockContracts.length;
      const completedContracts = mockContracts.filter(c => c.status === 'completed').length;
      const completionRate = (completedContracts / mockContracts.length) * 100;

      setStats({
        totalContracts: mockContracts.length,
        activeContracts: mockContracts.filter(c => c.status === 'active').length,
        totalEarnings,
        pendingPayments,
        averageRating,
        completionRate
      });

    } catch (error) {
      console.error('Failed to load contracts:', error);
      setError('Failed to load contracts. Please try again.');
      setContracts([]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'dispute': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const columns = [
    {
      key: 'projectTitle' as keyof Contract,
      title: 'Project',
      render: (value: string, contract: Contract) => (
        <div>
          <Link href={`/freelancer/contracts/${contract.id}`}>
            <h3 className="font-medium text-gray-900 hover:text-green-600 transition-colors">
              {value}
            </h3>
          </Link>
          <div className="flex items-center mt-1">
            <span className="text-sm text-gray-500 mr-2">{contract.client.name}</span>
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
              <span className="text-xs text-gray-500">{contract.client.rating}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contractType' as keyof Contract,
      title: 'Type',
      render: (value: string, contract: Contract) => (
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            value === 'fixed' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {value} {value === 'hourly' ? 'Rate' : 'Price'}
          </span>
          {value === 'hourly' && contract.hourlyRate && (
            <p className="text-sm text-gray-600 mt-1">
              {formatCurrency(contract.hourlyRate)}/hr
            </p>
          )}
        </div>
      )
    },
    {
      key: 'progress' as keyof Contract,
      title: 'Progress',
      render: (value: number, contract: Contract) => (
        <div className="w-24">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            ></div>
          </div>
          {contract.contractType === 'hourly' && contract.hoursWorked && (
            <p className="text-xs text-gray-500 mt-1">
              {contract.hoursWorked}h / {contract.totalHours}h
            </p>
          )}
        </div>
      )
    },
    {
      key: 'earnings' as keyof Contract,
      title: 'Earnings',
      render: (value: any) => (
        <div>
          <p className="font-semibold text-green-600">
            {formatCurrency(value.paid)}
          </p>
          {value.pending > 0 && (
            <p className="text-sm text-yellow-600">
              +{formatCurrency(value.pending)} pending
            </p>
          )}
        </div>
      )
    },
    {
      key: 'status' as keyof Contract,
      title: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (contract: Contract) => {
        router.push(`/freelancer/contracts/${contract.id}`);
      },
      icon: FileText
    },
    {
      label: 'Message Client',
      onClick: (contract: Contract) => {
        router.push(`/freelancer/messages?client=${contract.client.id}`);
      },
      icon: MessageSquare
    },
    {
      label: 'Download Contract',
      onClick: (contract: Contract) => {
        // Handle contract download
        console.log('Download contract:', contract.id);
      },
      icon: Download
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">
            My Contracts
          </h1>
          <p className="text-gray-600 font-inter">
            Manage your active and completed project contracts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeContracts}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Earned</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg font-bold text-yellow-600">{formatCurrency(stats.pendingPayments)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(0)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
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
                placeholder="Search contracts..."
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
              value={filters.contractType}
              onChange={(e) => handleFilterChange('contractType', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
            >
              {typeFilters.map(filter => (
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

        {/* Contracts Table */}
        <DataTable
          data={contracts}
          columns={columns}
          loading={isLoading}
          emptyTitle="No contracts found"
          emptyDescription="You don't have any contracts yet. Start by submitting proposals to win projects."
          emptyIcon={FileText}
          actions={actions}
          onRowClick={(contract) => router.push(`/freelancer/contracts/${contract.id}`)}
          rowClassName={(contract) => 
            contract.status === 'active' ? 'bg-green-50 border-green-200' :
            contract.status === 'completed' ? 'bg-blue-50 border-blue-200' :
            contract.status === 'dispute' ? 'bg-orange-50 border-orange-200' : ''
          }
        />
      </div>
    </AppLayout>
  );
}
