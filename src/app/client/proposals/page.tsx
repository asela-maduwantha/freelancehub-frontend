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
  MessageSquare,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { clientsService } from '@/lib/api';
import ProposalAcceptanceModal from '@/components/ui/ProposalAcceptanceModal';
import { IContract } from '@/lib/types';

interface Proposal {
  _id: string;
  projectId: {
    _id: string;
    clientId: {
      _id: string;
      email: string;
      name: string;
      role: string;
      emailVerified: boolean;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    title: string;
    description: string;
    category: string;
    subcategory: string;
    requiredSkills: Array<{
      skill: string;
      level: string;
    }>;
    budgetType: string;
    budget: number;
    currency: string;
    duration: string;
    deadline: string;
    workType: string[];
    experienceLevel: string;
    visibility: string;
    status: string;
    tags: string[];
    analytics: {
      views: number;
      applications: number;
      saves: number;
    };
    createdAt: string;
    updatedAt: string;
  };
  freelancerId: {
    _id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  coverLetter: string;
  proposedBudget: {
    amount: number;
    currency: string;
    type: string;
  };
  proposedDuration: {
    value: number;
    unit: string;
  };
  timeline: {
    estimatedDuration: number;
    proposedDeadline: string;
  };
  attachments: Array<{
    filename: string;
    url: string;
    description: string;
  }>;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    durationDays: number;
    deliveryDate: string;
  }>;
  status: string;
  submittedAt: string;
  clientViewed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProposalsResponse {
  proposals: Proposal[];
  total: number;
  page: number;
  limit: number;
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
      const response: ProposalsResponse = await clientsService.getProposals(filters);
      setProposals(response.proposals || []);
      setTotalProposals(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / (filters.limit || 10)));
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
      case 'submitted': return 'text-yellow-600 bg-yellow-50';
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
      case 'submitted': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatBudget = (budget: { amount: number; currency: string; type: string }) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: budget.currency
    }).format(budget.amount);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Proposals</h3>
          <p className="text-gray-600">Please wait while we fetch your proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Filter className="h-6 w-6 mr-3 text-green-600" />
              Filters & Search
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Search</label>
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search proposals..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                    className="w-full pl-12 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Items per page</label>
                <select
                  value={filters.limit || 10}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-10 shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error Loading Proposals</h3>
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
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                          <User className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {proposal.freelancerId.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Freelancer
                        </p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(proposal.status)} shadow-sm`}>
                      {getStatusIcon(proposal.status)}
                      <span className="ml-2 capitalize">{proposal.status}</span>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-green-600" />
                      Project
                    </h4>
                    <p className="text-gray-700 font-medium">{proposal.projectId.title}</p>
                  </div>

                  {/* Proposal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100">
                      <DollarSign className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Proposed Budget</p>
                        <p className="text-lg font-bold text-gray-900">{formatBudget(proposal.proposedBudget)}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <Clock className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Duration</p>
                        <p className="text-lg font-bold text-gray-900">{formatDuration(proposal.proposedDuration)}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <Calendar className="h-6 w-6 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Submitted</p>
                        <p className="text-lg font-bold text-gray-900">{formatTimeAgo(proposal.submittedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-gray-600" />
                      Cover Letter
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700 leading-relaxed line-clamp-4">{proposal.coverLetter}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <Link
                        href={`/client/projects/${proposal.projectId._id}/proposals`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Details
                      </Link>
                    </div>

                    {proposal.status === 'submitted' && (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openAcceptanceModal(proposal)}
                          className="inline-flex items-center px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Proposal
                        </button>
                        <button
                          onClick={() => {
                            // Handle reject - you might want to add a confirmation modal
                            if (window.confirm('Are you sure you want to reject this proposal?')) {
                              // Add reject logic here
                            }
                          }}
                          className="inline-flex items-center px-6 py-2.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 text-sm font-semibold rounded-lg border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto">
              <div className="text-gray-400 mb-6">
                <FileText className="h-20 w-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No proposals yet</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You haven't received any proposals yet. Create an exciting project to attract talented freelancers from around the world.
              </p>
              <Link
                href="/client/projects/new"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <FileText className="h-5 w-5 mr-2" />
                Post a Project
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                disabled={filters.page === 1}
                className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 transition-all duration-200"
              >
                ← Previous
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                const isCurrent = page === filters.page;

                return (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      isCurrent
                        ? 'bg-green-600 text-white shadow-md transform scale-105'
                        : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, (filters.page || 1) + 1))}
                disabled={filters.page === totalPages}
                className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 transition-all duration-200"
              >
                Next →
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
          projectId={selectedProposal.projectId._id}
          proposalId={selectedProposal._id}
          onSuccess={handleProposalAcceptance}
        />
      )}
    </div>
  );
}
