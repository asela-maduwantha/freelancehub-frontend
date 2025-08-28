'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  DollarSign,
  Clock,
  Calendar,
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertCircle,
  Filter,
  Search,
  FileText,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { freelancerAPI } from '@/lib/api';

interface Proposal {
  id: string;
  projectId: string;
  project: {
    id: string;
    title: string;
    category: string;
    budget: {
      amount: number;
      currency: string;
      type: string;
    };
    client: {
      id: string;
      name: string;
      rating: number;
    };
  };
  coverLetter: string;
  pricing: {
    amount: number;
    currency: string;
    type: string;
    estimatedHours?: number;
    breakdown: string;
  };
  timeline: {
    deliveryTime: number;
    startDate: string;
    milestones: Array<{
      title: string;
      description: string;
      deliveryDate: string;
      amount: number;
    }>;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: string;
  viewedAt?: string;
  clientFeedback?: string;
  portfolioLinks: string[];
  attachments: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
    description: string;
  }>;
}

interface ProposalFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export default function ProposalsPage() {
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

  useEffect(() => {
    fetchProposals();
  }, [filters]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await freelancerAPI.getProposals(filters);
      setProposals(response.proposals || []);
      setTotalProposals(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err: any) {
      console.error('Failed to fetch proposals:', err);
      setError(err.message || 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ProposalFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'withdrawn':
        return <XCircle className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatBudget = (budget: any) => {
    if (budget.type === 'fixed') {
      return `$${budget.amount.toLocaleString()}`;
    } else {
      return `$${budget.amount}/hr`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'technology': '💻',
      'design': '🎨',
      'writing': '✍️',
      'marketing': '📢',
      'business': '💼',
      'consulting': '🤝'
    };
    return icons[category] || '📋';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
              <p className="mt-2 text-gray-600">
                Track the status of your submitted proposals
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link
                href="/freelancer/projects"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Find More Projects
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search proposals by project title..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${totalProposals} proposals found`}
          </p>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : proposals.length > 0 ? (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(proposal.project.category)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {proposal.project.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Client: {proposal.project.client.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(proposal.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(proposal.status)}
                          <span className="capitalize">{proposal.status}</span>
                        </div>
                      </span>
                    </div>
                  </div>

                  {/* Proposal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Your Bid: {formatBudget(proposal.pricing)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Delivery: {proposal.timeline.deliveryTime} days</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Submitted: {formatTimeAgo(proposal.submittedAt)}</span>
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {proposal.coverLetter}
                    </p>
                  </div>

                  {/* Milestones */}
                  {proposal.timeline.milestones.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Milestones</h4>
                      <div className="space-y-2">
                        {proposal.timeline.milestones.slice(0, 2).map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{milestone.title}</span>
                            <span className="font-medium">${milestone.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        {proposal.timeline.milestones.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{proposal.timeline.milestones.length - 2} more milestones
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Portfolio Links */}
                  {proposal.portfolioLinks.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Portfolio Links</h4>
                      <div className="flex flex-wrap gap-2">
                        {proposal.portfolioLinks.slice(0, 3).map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Portfolio {index + 1}
                          </a>
                        ))}
                        {proposal.portfolioLinks.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{proposal.portfolioLinks.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {proposal.attachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {proposal.attachments[0].filename}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Client Feedback */}
                  {proposal.clientFeedback && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Client Feedback</h4>
                      <p className="text-sm text-gray-700">{proposal.clientFeedback}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <Link
                        href={`/freelancer/projects/${proposal.projectId}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Project
                      </Link>
                      {proposal.status === 'pending' && (
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Withdraw Proposal
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {proposal.viewedAt && (
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>Viewed {formatTimeAgo(proposal.viewedAt)}</span>
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
              You haven't submitted any proposals yet. Start by finding projects that match your skills.
            </p>
            <Link
              href="/freelancer/projects"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Projects
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
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
                        ? 'bg-blue-600 text-white'
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
    </div>
  );
}
