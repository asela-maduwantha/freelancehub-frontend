'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContractResponse, contractService } from '@/lib/api/contracts';
import { JobResponse, jobService } from '@/lib/api/jobs';
import { ProposalResponse, proposalService } from '@/lib/api/proposals';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ContractListItem from '@/components/features/contracts/ContractListItem';
import CreateMilestoneModal from '@/components/features/contracts/CreateMilestoneModal';
import ContractPaymentModal from '@/components/features/payments/ContractPaymentModal';
import { Spinner } from '@/components/ui/Feedback';
import Button from '@/components/ui/Button';
import { 
  LayoutList, LayoutGrid, Table as TableIcon, Search, Filter,
  DollarSign, Zap, Clock, CheckCircle, XCircle, Calendar,
  TrendingUp, User, MoreVertical, Eye, CreditCard, MessageSquare,
  AlertCircle
} from 'lucide-react';

type ViewMode = 'list' | 'grid' | 'compact';
type StatusFilter = 'all' | 'active' | 'pending' | 'completed' | 'cancelled';
type DateRange = '7days' | '30days' | '90days' | 'all';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

interface ContractWithDetails extends ContractResponse {
  job?: JobResponse;
  proposal?: ProposalResponse;
}

interface ContractProgress {
  completed: number;
  total: number;
  percentage: number;
}

type PaymentStatus = 'paid' | 'pending' | 'overdue';

export default function ClientContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Milestone modal state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractResponse | null>(null);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedContractForPayment, setSelectedContractForPayment] = useState<ContractWithDetails | null>(null);

  const fetchContracts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await contractService.getContracts(page, 10);
      
      // Handle different response structures
      let contractsData: ContractResponse[];
      let paginationData: any;
      
      if (response && response.contracts) {
        // If response has the expected structure
        contractsData = response.contracts;
        paginationData = response.pagination;
      } else if (Array.isArray(response)) {
        // If response is directly an array of contracts
        contractsData = response;
        paginationData = { total: response.length, pages: 1, page: 1, limit: 10 };
      } else {
        // If response has a different structure, try to extract contracts
        const anyResponse = response as any;
        contractsData = anyResponse?.data?.contracts || anyResponse?.contracts || [];
        paginationData = anyResponse?.data?.pagination || anyResponse?.pagination || { total: 0, pages: 1, page: 1, limit: 10 };
      }
      
      setTotal(paginationData.total);
      setTotalPages(paginationData.pages);

      // Fetch related job and proposal data for each contract
      const contractsWithDetails = await Promise.all(
        contractsData.map(async (contract: ContractResponse) => {
          try {
            // Ensure contract has proper structure before processing
            if (!contract || typeof contract !== 'object') {
              console.warn('Invalid contract data:', contract);
              return null;
            }

            const [job, proposal] = await Promise.all([
              jobService.getJob(typeof contract.jobId === 'object' ? contract.jobId._id : contract.jobId).catch(() => null),
              contract.proposalId ? proposalService.getProposal(typeof contract.proposalId === 'object' ? contract.proposalId._id : contract.proposalId).catch(() => null) : Promise.resolve(null)
            ]);
            
            // Debug logging for milestone data
            console.log(`Contract ${contract._id} milestone data:`, {
              milestoneCount: contract.milestoneCount,
              completedMilestones: contract.completedMilestones,
              totalAmount: contract.totalAmount,
              status: contract.status
            });
            
            return {
              ...contract,
              job,
              proposal
            } as ContractWithDetails;
          } catch (err) {
            console.warn('Error processing contract:', contract, err);
            // Return contract without additional details if fetching fails
            return contract as ContractWithDetails;
          }
        })
      );

      // Filter out any null contracts
      const validContracts = contractsWithDetails.filter(contract => contract !== null);
      setContracts(validContracts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contracts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [page]);

  const handleRefresh = () => {
    setPage(1);
    fetchContracts();
  };

  const handleViewDetails = (contract: ContractResponse) => {
    router.push(`/client/contracts/${contract._id}`);
  };

  const handleCreateMilestone = (contract: ContractResponse) => {
    setSelectedContract(contract);
    setIsMilestoneModalOpen(true);
  };

  const handlePayNow = (contract: ContractWithDetails) => {
    setSelectedContractForPayment(contract);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (payment: any) => {
    // Refresh contracts to update payment status
    fetchContracts();
    // You could also show a success toast here
    console.log('Payment successful:', payment);
  };

  const handlePaymentError = (error: string) => {
    // You could show an error toast here
    console.error('Payment failed:', error);
  };

  const handleMilestoneCreated = () => {
    fetchContracts(); // Refresh the contracts list
  };

  // Helper Functions
  const calculateProgress = (contract: ContractWithDetails): ContractProgress => {
    const total = contract.milestoneCount || 0;
    const completed = contract.completedMilestones || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Ensure percentage is valid
    const safePercentage = isNaN(percentage) || !isFinite(percentage) ? 0 : Math.max(0, Math.min(100, percentage));
    
    console.log(`Progress calculation for contract ${contract._id}:`, {
      total,
      completed,
      percentage: safePercentage,
      milestoneCount: contract.milestoneCount,
      completedMilestones: contract.completedMilestones
    });
    
    return { completed, total, percentage: safePercentage };
  };

  const getPaymentStatus = (contract: ContractWithDetails): PaymentStatus => {
    // If contract is completed and fully paid
    if (contract.status === 'completed' && contract.releasedAmount >= contract.totalAmount) return 'paid';
    
    // If contract is in pending payment status (payable)
    if (contract.status === 'pending' || contract.status === 'pending_payment_method') return 'pending';
    
    // If contract is overdue (past end date and not completed)
    if (contract.endDate && new Date(contract.endDate) < new Date() && contract.status !== 'completed') return 'overdue';
    
    // Default to paid for active contracts (not awaiting payment)
    return 'paid';
  };

  const getDaysRemaining = (contract: ContractWithDetails): string => {
    if (contract.status === 'completed') return 'Completed';
    if (!contract.endDate) return 'No deadline';
    
    const end = new Date(contract.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  const formatContractAmount = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getContractStats = () => {
    const active = contracts.filter(c => c.status === 'active').length;
    const pending = contracts.filter(c => c.status === 'pending').length;
    const completed = contracts.filter(c => c.status === 'completed').length;
    const cancelled = contracts.filter(c => c.status === 'cancelled').length;
    const totalValue = contracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
    
    return { active, pending, completed, cancelled, totalValue };
  };

  // Filtering and Sorting
  const getFilteredContracts = () => {
    let filtered = [...contracts];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
      const days = daysMap[dateRange];
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(c => new Date(c.createdAt) >= cutoffDate);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => {
        const jobTitle = typeof c.jobId === 'object' ? c.jobId.title?.toLowerCase() || '' : '';
        const freelancerName = typeof c.freelancerId === 'object' && c.freelancerId?.profile
          ? `${c.freelancerId.profile.firstName} ${c.freelancerId.profile.lastName}`.trim().toLowerCase()
          : '';
        const contractTitle = c.title?.toLowerCase() || '';
        return jobTitle.includes(query) || freelancerName.includes(query) || contractTitle.includes(query);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'lowest':
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredContracts = getFilteredContracts();
  const stats = getContractStats();

  // Get contextual alerts
  const pendingPayments = contracts.filter(c => getPaymentStatus(c) === 'pending' && c.status === 'active').length;
  const overdueMilestones = contracts.reduce((count, c) => {
    // Calculate overdue milestones based on incomplete milestone count and end date
    if (c.status === 'active' && c.endDate && new Date(c.endDate) < new Date()) {
      return count + (c.milestoneCount - c.completedMilestones);
    }
    return count;
  }, 0);
  const needsReview = contracts.filter(c => c.status === 'completed').length;

  // Sub-components
  const StatCard = ({ 
    icon, 
    label, 
    value, 
    color, 
    trend 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    value: string | number; 
    color: string; 
    trend?: string;
  }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              {trend}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const ContractCardList = ({ contract }: { contract: ContractWithDetails }) => {
    const progress = calculateProgress(contract);
    const paymentStatus = getPaymentStatus(contract);
    const daysRemaining = getDaysRemaining(contract);
    const freelancerName = typeof contract.freelancerId === 'object' && contract.freelancerId?.profile
      ? `${contract.freelancerId.profile.firstName} ${contract.freelancerId.profile.lastName}`.trim()
      : 'Unknown';

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Section */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{contract.title}</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {freelancerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">{freelancerName}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  contract.status === 'active' ? 'bg-green-100 text-green-700' :
                  contract.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  contract.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                  paymentStatus === 'overdue' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {paymentStatus === 'paid' ? '✓ Paid' : paymentStatus === 'overdue' ? '⚠ Overdue' : '⏳ Pending Payment'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-2xl font-bold text-green-600">{formatContractAmount(contract.totalAmount, contract.currency)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Start: {new Date(contract.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{daysRemaining}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Milestones Progress</span>
                <span className="font-medium text-gray-900">{progress.completed} of {progress.total} completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex lg:flex-col gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleViewDetails(contract)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
            {paymentStatus === 'pending' && (
              <Button
                variant="accent"
                size="sm"
                onClick={() => handlePayNow(contract)}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Pay Now
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ContractCardGrid = ({ contract }: { contract: ContractWithDetails }) => {
    const progress = calculateProgress(contract);
    const daysRemaining = getDaysRemaining(contract);
    const freelancerName = typeof contract.freelancerId === 'object' && contract.freelancerId?.profile
      ? `${contract.freelancerId.profile.firstName} ${contract.freelancerId.profile.lastName}`.trim()
      : 'Unknown';

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              contract.status === 'active' ? 'bg-green-100 text-green-700' :
              contract.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              contract.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
              'bg-red-100 text-red-700'
            }`}>
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{contract.title}</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {freelancerName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 font-medium">{freelancerName}</span>
            </div>
          </div>

          <div className="text-2xl font-bold text-green-600">
            {formatContractAmount(contract.totalAmount, contract.currency)}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{progress.completed}/{progress.total} milestones</span>
              <span className="font-medium">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{daysRemaining}</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleViewDetails(contract)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Contract
          </Button>
        </div>
      </div>
    );
  };

  const ContractTableRow = ({ contract }: { contract: ContractWithDetails }) => {
    const progress = calculateProgress(contract);
    const freelancerName = typeof contract.freelancerId === 'object' && contract.freelancerId?.profile
      ? `${contract.freelancerId.profile.firstName} ${contract.freelancerId.profile.lastName}`.trim()
      : 'Unknown';
    const [showActions, setShowActions] = useState(false);

    return (
      <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <td className="py-4 px-4">
          <div>
            <div className="font-medium text-gray-900">{contract.title}</div>
            <div className="text-sm text-gray-600">{freelancerName}</div>
          </div>
        </td>
        <td className="py-4 px-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            contract.status === 'active' ? 'bg-green-100 text-green-700' :
            contract.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            contract.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
            'bg-red-100 text-red-700'
          }`}>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </span>
        </td>
        <td className="py-4 px-4 font-semibold text-green-600">
          {formatContractAmount(contract.totalAmount, contract.currency)}
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
              <div 
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{progress.completed}/{progress.total}</span>
          </div>
        </td>
        <td className="py-4 px-4 text-sm text-gray-600">
          {new Date(contract.startDate).toLocaleDateString()}
        </td>
        <td className="py-4 px-4 relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  handleViewDetails(contract);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button
                onClick={() => {
                  handleCreateMilestone(contract);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Milestones
              </button>
              <button
                onClick={() => {
                  const contractIdValue = typeof contract._id === 'object' && contract._id ? (contract._id as any)._id : contract._id;
                  router.push(`/client/contracts/${contractIdValue}?tab=messages`);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Message
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Contracts</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all your active contracts
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Contextual Alerts */}
        {pendingPayments > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                You have {pendingPayments} contract{pendingPayments > 1 ? 's' : ''} awaiting payment
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Review and complete pending payments to keep your projects on track
              </p>
            </div>
          </div>
        )}
        
        {overdueMilestones > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                {overdueMilestones} milestone{overdueMilestones > 1 ? 's are' : ' is'} overdue
              </p>
              <p className="text-sm text-red-700 mt-1">
                Check your contracts to address delayed milestones
              </p>
            </div>
          </div>
        )}

        {needsReview > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {needsReview} completed contract{needsReview > 1 ? 's' : ''} ready for review
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Leave feedback to help freelancers grow their reputation
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Stats Dashboard */}
        {total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={<DollarSign className="h-6 w-6 text-blue-600" />}
              label="Total Value"
              value={formatContractAmount(stats.totalValue)}
              color="text-blue-600"
            />
            <StatCard
              icon={<Zap className="h-6 w-6 text-green-600" />}
              label="Active Contracts"
              value={stats.active}
              color="text-green-600"
            />
            <StatCard
              icon={<Clock className="h-6 w-6 text-yellow-600" />}
              label="Pending"
              value={stats.pending}
              color="text-yellow-600"
            />
            <StatCard
              icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
              label="Completed"
              value={stats.completed}
              color="text-emerald-600"
            />
            <StatCard
              icon={<XCircle className="h-6 w-6 text-red-600" />}
              label="Cancelled"
              value={stats.cancelled}
              color="text-red-600"
            />
          </div>
        )}

        {/* Filters and View Toggle */}
        {!isLoading && contracts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by contract title or freelancer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <LayoutList className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'compact' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Compact View"
                >
                  <TableIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Status:</span>
              {(['all', 'active', 'pending', 'completed', 'cancelled'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white bg-opacity-20 text-xs">
                      {contracts.filter(c => c.status === status).length}
                    </span>
                  )}
                  {status === 'all' && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white bg-opacity-20 text-xs">
                      {contracts.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Date Range and Sort */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Value</option>
                  <option value="lowest">Lowest Value</option>
                </select>
              </div>

              {(searchQuery || statusFilter !== 'all' || dateRange !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDateRange('all');
                  }}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-900">{error}</span>
              <Button variant="secondary" size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && contracts.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && contracts.length === 0 && !error && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-12 text-center">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
              <p className="text-gray-600 mb-6">Contracts will appear here once you accept proposals and create contracts with freelancers.</p>
              <Button variant="primary" onClick={() => router.push('/client/jobs')}>
                Browse Jobs
              </Button>
            </div>
          </div>
        )}

        {/* No Results from Filter */}
        {!isLoading && contracts.length > 0 && filteredContracts.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-12 text-center">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <Search className="h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts match your filters</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDateRange('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        {/* Contracts List View */}
        {!isLoading && filteredContracts.length > 0 && viewMode === 'list' && (
          <div className="space-y-4">
            {filteredContracts.map((contract, index) => {
              if (!contract || !contract._id) {
                console.warn('Skipping invalid contract:', contract);
                return null;
              }

              const contractKey = typeof contract._id === 'string' 
                ? contract._id 
                : `contract-${index}`;

              return <ContractCardList key={contractKey} contract={contract} />;
            })}
          </div>
        )}

        {/* Contracts Grid View */}
        {!isLoading && filteredContracts.length > 0 && viewMode === 'grid' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContracts.map((contract, index) => {
              if (!contract || !contract._id) {
                console.warn('Skipping invalid contract:', contract);
                return null;
              }

              const contractKey = typeof contract._id === 'string' 
                ? contract._id 
                : `contract-${index}`;

              return <ContractCardGrid key={contractKey} contract={contract} />;
            })}
          </div>
        )}

        {/* Contracts Compact View (Table) */}
        {!isLoading && filteredContracts.length > 0 && viewMode === 'compact' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Contract / Freelancer</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Progress</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Start Date</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract, index) => {
                    if (!contract || !contract._id) {
                      console.warn('Skipping invalid contract:', contract);
                      return null;
                    }

                    const contractKey = typeof contract._id === 'string' 
                      ? contract._id 
                      : `contract-${index}`;

                    return <ContractTableRow key={contractKey} contract={contract} />;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredContracts.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-6">
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <span className="text-sm text-gray-500">
                ({total} total contracts)
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        )}

        {/* Create Milestone Modal */}
        {selectedContract && (
          <CreateMilestoneModal
            isOpen={isMilestoneModalOpen}
            onClose={() => {
              setIsMilestoneModalOpen(false);
              setSelectedContract(null);
            }}
            contract={selectedContract}
            onMilestoneCreated={handleMilestoneCreated}
          />
        )}

        {/* Contract Payment Modal */}
        {selectedContractForPayment && (
          <ContractPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedContractForPayment(null);
            }}
            contract={selectedContractForPayment}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        )}
      </div>
    </DashboardLayout>
  );
}