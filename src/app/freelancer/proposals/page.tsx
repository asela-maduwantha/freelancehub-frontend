'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  DollarSign,
  Eye,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  Plus,
  Download,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DataTable from '@/components/ui/DataTable';
import AppLayout from '@/components/layout/AppLayout';
import { freelancersService, IFreelancerProposal } from '@/lib/api/freelancers.service';

interface Filters {
  status: string;
  dateRange: string;
  search: string;
}

const statusFilters = [
  { value: '', label: 'All Proposals' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
];

const dateFilters = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' }
];

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<IFreelancerProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    status: '',
    dateRange: '',
    search: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasNext: false
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    loadProposals();
  }, [filters, pagination.page]);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch proposals from backend with pagination
      const proposalsData = await freelancersService.getMyProposals({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined
      });

      // Apply client-side search filter if needed
      let filteredProposals = proposalsData;
      if (filters.search) {
        filteredProposals = proposalsData.filter(p => 
          (p.project?.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
          `${p.project?.client?.firstName || ''} ${p.project?.client?.lastName || ''}`.toLowerCase().includes(filters.search.toLowerCase()) ||
          (p.project?.client?.companyName || '').toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setProposals(filteredProposals);

      // For stats, we need to get all proposals (this could be optimized with a separate endpoint)
      const allProposals = await freelancersService.getMyProposals();
      
      setStats({
        total: allProposals.length,
        pending: allProposals.filter(p => p.status === 'pending').length,
        approved: allProposals.filter(p => p.status === 'accepted').length,
        rejected: allProposals.filter(p => p.status === 'rejected').length
      });

      // Update pagination info (assuming we get total from response or calculate)
      setPagination(prev => ({
        ...prev,
        total: proposalsData.length, // This should come from backend pagination
        hasNext: proposalsData.length === pagination.limit
      }));

    } catch (error) {
      console.error('Failed to load proposals:', error);
      setError('Failed to load proposals. Please try again.');
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
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
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getProjectId = (proposal: IFreelancerProposal): string => {
    if (typeof proposal.projectId === 'string') {
      return proposal.projectId;
    } else if (proposal.projectId && typeof proposal.projectId === 'object' && 'id' in proposal.projectId) {
      return proposal.projectId.id;
    } else if (proposal.project?.id) {
      return proposal.project.id;
    }
    return 'unknown';
  };

  const columns = [
    {
      key: 'project' as keyof IFreelancerProposal,
      title: 'Project',
      render: (value: any, proposal: IFreelancerProposal) => (
        <div>
          <Link href={`/freelancer/projects/${getProjectId(proposal)}`}>
            <h3 className="font-medium text-gray-900 hover:text-green-600 transition-colors">
              {value?.title || 'Untitled Project'}
            </h3>
          </Link>
          <p className="text-sm text-gray-500">
            Client: {value?.client?.firstName || 'Unknown'} {value?.client?.lastName || ''}
            {value?.client?.companyName && ` (${value?.client?.companyName})`}
          </p>
        </div>
      )
    },
    {
      key: 'proposedBudget' as keyof IFreelancerProposal,
      title: 'Budget',
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'proposedDuration' as keyof IFreelancerProposal,
      title: 'Duration',
      render: (value: any) => (
        <span className="text-gray-700">
          {value?.value || 0} {value?.unit || 'days'}
        </span>
      )
    },
    {
      key: 'status' as keyof IFreelancerProposal,
      title: 'Status',
      render: (value: string) => (
        <StatusBadge status={value as any} />
      )
    },
    {
      key: 'submittedAt' as keyof IFreelancerProposal,
      title: 'Submitted',
      render: (value: string) => (
        <span className="text-gray-600 text-sm">
          {formatDate(value)}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (proposal: IFreelancerProposal) => {
        router.push(`/freelancer/proposals/${proposal.id}`);
      },
      icon: Eye
    },
    {
      label: 'View Project',
      onClick: (proposal: IFreelancerProposal) => {
        const projectId = getProjectId(proposal);
        if (projectId && projectId !== 'unknown') {
          router.push(`/freelancer/projects/${projectId}`);
        }
      },
      icon: FileText
    },
    {
      label: 'Message Client',
      onClick: (proposal: IFreelancerProposal) => {
        const clientId = proposal.project?.client?.id;
        if (clientId) {
          router.push(`/freelancer/messages?client=${clientId}`);
        }
      },
      icon: MessageSquare
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">
              My Proposals
            </h1>
            <p className="text-gray-600 font-inter">
              Track and manage all your project proposals
            </p>
          </div>
          <Link href="/freelancer/projects">
            <Button variant="premium" className="font-poppins">
              <Plus className="h-4 w-4 mr-2" />
              Submit New Proposal
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
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
                placeholder="Search proposals..."
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

            {/* Date Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
            >
              {dateFilters.map(filter => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>

            {/* Export Button */}
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
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

        {/* Proposals Table */}
        <DataTable
          data={proposals}
          columns={columns}
          loading={isLoading}
          emptyTitle="No proposals found"
          emptyDescription="You haven't submitted any proposals yet. Start by browsing available projects."
          emptyIcon={FileText}
          actions={actions}
          onRowClick={(proposal) => router.push(`/freelancer/proposals/${proposal.id}`)}
          rowClassName={(proposal) => 
            proposal.status === 'accepted' ? 'bg-green-50 border-green-200' :
            proposal.status === 'rejected' ? 'bg-red-50 border-red-200' : ''
          }
        />

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex justify-center items-center space-x-4 py-8">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
