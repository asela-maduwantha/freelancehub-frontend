'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Breadcrumb from '../../../../components/common/Breadcrumb';
import Button from '../../../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Display';
import { Loader, Alert } from '../../../../components/ui/Feedback';
import { Modal } from '../../../../components/ui/Modal';
import { proposalService, ProposalResponse, ProposalListResponse } from '../../../../lib/api/proposals';
import { jobService, JobResponse } from '../../../../lib/api/jobs';
import ProposalCardSkeleton from '../../../../components/animations/ProposalCardSkeleton';
import StatusBadge from '../../../../components/ui/Display/StatusBadge';
import EmptyState from '../../../../components/animations/EmptyState';
import EnhancedProposalCard from '../../../../components/animations/EnhancedProposalCard';
import {
  Eye,
  DollarSign,
  Clock,
  FileText,
  Briefcase,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Calendar,
  Search,
  Plus
} from 'lucide-react';

interface ProposalFilters {
  status?: string;
  page: number;
  limit: number;
}

const MyProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<ProposalFilters>({
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchProposals();
  }, [filters]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: ProposalListResponse = await proposalService.getMyProposals(filters);
      setProposals(response.proposals);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = async (jobId: string) => {
    if (!jobId) {
      setError('Job ID is missing');
      return;
    }

    try {
      setJobLoading(true);
      setJobModalOpen(true);
      const jobData = await jobService.getJob(jobId);
      setSelectedJob(jobData);
    } catch (err: any) {
      setError(err.message || 'Failed to load job details');
      setJobModalOpen(false);
    } finally {
      setJobLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status === 'all' ? undefined : status, page: 1 }));
  };

  const handleWithdrawProposal = async (proposalId: string) => {
    try {
      await proposalService.withdrawProposal(proposalId);
      // Refresh the proposals list
      await fetchProposals();
      // Show success message
      setError(null);
      // You could add a toast notification here if available
      alert('Proposal withdrawn successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw proposal');
    }
  };

  const formatBudget = (budget: JobResponse['budget']) => {
    const { type, min, max, currency = 'USD' } = budget;

    if (type === 'range' && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
    }
    return `$${min.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'withdrawn':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading && proposals.length === 0) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-48 mb-2 animate-pulse" />
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-64 animate-pulse" />
          </div>

          {/* Filters Skeleton */}
          <div className="mb-6">
            <div className="card-elevated p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16 animate-pulse" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-20 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Cards Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <ProposalCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/freelancer/dashboard' },
            { label: 'Proposals', icon: <FileText size={16} /> }
          ]}
        />

        {/* Header */}
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Proposals</h1>
          <p className="text-gray-600">Track and manage all your job proposals</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Filters */}
        <div className="mb-6">
          <Card>
            <CardBody>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Status:</span>
                </div>
                <div className="flex gap-2">
                  {['all', 'pending', 'accepted', 'rejected', 'withdrawn'].map((status) => (
                    <Button
                      key={status}
                      variant={filters.status === status || (!filters.status && status === 'all') ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusFilter(status)}
                      className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <EmptyState
            title="No proposals found"
            description={
              filters.status
                ? `You don't have any ${filters.status} proposals yet. ${filters.status === 'pending' ? 'Keep applying to jobs that match your skills!' : 'Your proposals will appear here once you start applying.'}`
                : "You haven't submitted any proposals yet. Start exploring jobs and submit your first proposal!"
            }
            variant={filters.status ? 'search' : 'create'}
            action={{
              label: filters.status ? 'Browse Jobs' : 'Find Jobs',
              onClick: () => {
                // Navigate to browse jobs page
                window.location.href = '/browse-jobs';
              }
            }}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {proposals.map((proposal, index) => (
              <EnhancedProposalCard
                key={proposal._id}
                proposal={proposal}
                index={index}
                onViewJob={handleViewJob}
                onEdit={(id) => {
                  // Handle edit - could navigate to edit page or open modal
                  console.log('Edit proposal:', id);
                }}
                onWithdraw={(id) => {
                  // Handle withdraw with confirmation
                  if (window.confirm('Are you sure you want to withdraw this proposal? This action cannot be undone.')) {
                    handleWithdrawProposal(id);
                  }
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} proposals
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {jobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur effect */}
            <div
              className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm transition-all duration-300"
              onClick={() => {
                setJobModalOpen(false);
                setSelectedJob(null);
              }}
            />

            {/* Modal */}
            <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100/50">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Job Details
                </h3>
                <button
                  onClick={() => {
                    setJobModalOpen(false);
                    setSelectedJob(null);
                  }}
                  className="p-2 hover:bg-gray-100/50 rounded-full transition-colors duration-200"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 py-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                {jobLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader size="lg" />
                  </div>
                ) : selectedJob ? (
                  <div className="space-y-8">
                    {/* Job Header */}
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedJob.title}</h2>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-6">
                        <Badge variant={selectedJob.isUrgent ? 'warning' : 'secondary'} className="px-3 py-1">
                          {selectedJob.isUrgent ? 'Urgent' : 'Regular'}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Posted {formatDate(selectedJob.postedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {selectedJob.proposalCount} proposals
                        </span>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-6 border border-blue-100/50">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Job Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-lg">{selectedJob.description}</p>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-white/60 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 font-medium">Budget</span>
                              <p className="font-bold text-gray-900 text-lg">{formatBudget(selectedJob.budget)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/60 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Briefcase className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 font-medium">Project Type</span>
                              <p className="font-bold text-gray-900 text-lg capitalize">
                                {selectedJob.projectType.replace('-', ' ')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/60 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <MapPin className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 font-medium">Location</span>
                              <p className="font-bold text-gray-900 text-lg">Remote</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white/60 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                          <span className="text-sm text-gray-600 font-medium block mb-2">Category</span>
                          <p className="font-bold text-gray-900 text-lg capitalize">
                            {selectedJob.category.replace('-', ' ')}
                          </p>
                        </div>

                        <div className="bg-white/60 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                          <span className="text-sm text-gray-600 font-medium block mb-2">Experience Level</span>
                          <p className="font-bold text-gray-900 text-lg capitalize">
                            {selectedJob.experienceLevel || 'Not specified'}
                          </p>
                        </div>

                        <div className="bg-white/60 rounded-xl p-6 border border-gray-200/50 shadow-sm">
                          <span className="text-sm text-gray-600 font-medium block mb-2">Status</span>
                          <StatusBadge status={selectedJob.status} />
                        </div>
                      </div>
                    </div>

                    {/* Skills Required */}
                    <div className="bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-xl p-6 border border-green-100/50">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-green-600" />
                        Skills Required
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedJob.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="px-4 py-2 text-sm font-medium bg-white/70 border-gray-300 hover:bg-white/90 transition-colors">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Client Information */}
                    <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl p-6 border border-purple-100/50">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-purple-600" />
                        Client Information
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                          <User className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{selectedJob.client.fullName}</p>
                          <p className="text-gray-600">{selectedJob.client.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-600 text-lg">Failed to load job details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyProposalsPage;
