'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  DollarSign,
  Clock,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  FileText,
  User,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { clientsService } from '@/lib/api';
import ProposalAcceptanceModal from '@/components/ui/ProposalAcceptanceModal';
import { IContract } from '@/lib/types';

interface Proposal {
  _id: string;
  freelancerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    freelancerProfile?: {
      hourlyRate: number;
    };
    stats?: {
      avgRating: number;
    };
  };
  proposedBudget: number;
  proposedDuration: {
    value: number;
    unit: string;
  };
  coverLetter: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    deliveryDate: string;
  }>;
  projectId: string;
  projectTitle?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  portfolioLinks?: string[];
  additionalInfo?: string;
  clientViewed: boolean;
  clientViewedAt?: string;
}

interface ProposalFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export default function ClientProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProposalFilters>({
    page: 1,
    limit: 10
  });
  const [totalProposals, setTotalProposals] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await clientsService.getProposals(filters);
      setProposals(response || []);
      setTotalProposals(response?.length || 0);
      setTotalPages(Math.ceil((response?.length || 0) / (filters.limit || 10)));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch proposals');
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [filters]);

  const handleFilterChange = (key: keyof ProposalFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset to page 1 when changing filters
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleProposalAcceptance = (contract: IContract) => {
    // Update the proposal status to accepted
    setProposals(prev => prev.map(proposal =>
      proposal._id === selectedProposal?._id
        ? { ...proposal, status: 'accepted' }
        : proposal
    ));

    // Close modal
    setShowAcceptanceModal(false);
    setSelectedProposal(null);

    // Show success message and redirect to contracts
    alert('Proposal accepted successfully! Contract created and awaiting your approval.');
    window.location.href = '/client/contracts';
  };

  const openAcceptanceModal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowAcceptanceModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(budget);
  };

  const formatDuration = (duration: { value: number; unit: string }) => {
    return `${duration.value} ${duration.unit}${duration.value > 1 ? 's' : ''}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  if (loading && proposals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/client/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
              <p className="text-sm text-gray-600">Manage proposals received for your projects</p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search proposals..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
                <select
                  value={filters.limit || 10}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Proposals List */}
        {proposals.length > 0 ? (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <motion.div
                key={proposal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {proposal.freelancerId.profilePicture ? (
                          <img
                            src={proposal.freelancerId.profilePicture}
                            alt={`${proposal.freelancerId.firstName} ${proposal.freelancerId.lastName}`}
                            className="h-12 w-12 rounded-full"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {proposal.freelancerId.firstName} {proposal.freelancerId.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">Freelancer</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {proposal.freelancerId.stats?.avgRating || 0} rating
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                      {getStatusIcon(proposal.status)}
                      <span className="ml-1 capitalize">{proposal.status}</span>
                    </div>
                  </div>

                  {/* Project Info */}
                  {proposal.projectTitle && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Project</h4>
                      <p className="text-sm text-gray-700">{proposal.projectTitle}</p>
                    </div>
                  )}

                  {/* Proposal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Proposed Budget</p>
                        <p className="text-lg font-semibold text-gray-900">{formatBudget(proposal.proposedBudget)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDuration(proposal.proposedDuration)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="text-lg font-semibold text-gray-900">{formatTimeAgo(proposal.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">{proposal.coverLetter}</p>
                  </div>

                  {/* Additional Info */}
                  {proposal.additionalInfo && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Information</h4>
                      <p className="text-sm text-gray-700">{proposal.additionalInfo}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <Link
                        href={`/client/projects/${proposal.projectId}/proposals`}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        View Full Details
                      </Link>
                      {proposal.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openAcceptanceModal(proposal)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Accept
                          </button>
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
            <p className="text-gray-600 mb-6">
              You haven't received any proposals yet. Create a project to start receiving proposals from freelancers.
            </p>
            <Link
              href="/client/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Post a Project
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                disabled={filters.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                const isCurrent = page === filters.page;

                return (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      isCurrent
                        ? 'bg-green-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, (filters.page || 1) + 1))}
                disabled={filters.page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Proposal Acceptance Modal */}
      {selectedProposal && (
        <ProposalAcceptanceModal
          isOpen={showAcceptanceModal}
          onClose={() => {
            setShowAcceptanceModal(false);
            setSelectedProposal(null);
          }}
          projectId={selectedProposal.projectId}
          proposalId={selectedProposal._id}
          onSuccess={handleProposalAcceptance}
        />
      )}
    </div>
  );
}
