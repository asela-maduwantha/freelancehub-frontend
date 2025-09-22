'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Button from '../../../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Display';
import { Loader, Alert } from '../../../../components/ui/Feedback';
import { Modal } from '../../../../components/ui/Modal';
import { proposalService, ProposalResponse, ProposalListResponse } from '../../../../lib/api/proposals';
import { jobService, JobResponse } from '../../../../lib/api/jobs';
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
  Filter
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
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
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
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
                <p className="text-gray-600">
                  {filters.status
                    ? `You don't have any ${filters.status} proposals yet.`
                    : "You haven't submitted any proposals yet."
                  }
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal) => (
              <Card key={proposal._id} variant="elevated">
                <CardBody>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Proposal Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Proposal for Job #{proposal.jobId.slice(-8)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <Badge variant={getStatusBadgeVariant(proposal.status)}>
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </Badge>
                            <span>Submitted {formatDate(proposal.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter Preview */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                        <p className="text-gray-600 line-clamp-3">
                          {proposal.coverLetter.length > 200
                            ? `${proposal.coverLetter.substring(0, 200)}...`
                            : proposal.coverLetter
                          }
                        </p>
                      </div>

                      {/* Proposal Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <div>
                            <span className="text-sm text-gray-600">Proposed Rate</span>
                            <p className="font-medium text-gray-900">
                              ${proposal.proposedRate.amount.toLocaleString()} {proposal.proposedRate.type}
                            </p>
                          </div>
                        </div>

                        {proposal.estimatedDuration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <div>
                              <span className="text-sm text-gray-600">Estimated Duration</span>
                              <p className="font-medium text-gray-900">
                                {proposal.estimatedDuration.value} {proposal.estimatedDuration.unit}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Milestones */}
                      {proposal.proposedMilestones && proposal.proposedMilestones.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Milestones ({proposal.proposedMilestones.length})</h4>
                          <div className="space-y-2">
                            {proposal.proposedMilestones.slice(0, 2).map((milestone: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">{milestone.title}</p>
                                  <p className="text-sm text-gray-600">
                                    ${milestone.amount.toLocaleString()} • {milestone.durationDays} days
                                  </p>
                                </div>
                              </div>
                            ))}
                            {proposal.proposedMilestones.length > 2 && (
                              <p className="text-sm text-gray-500">
                                +{proposal.proposedMilestones.length - 2} more milestones
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 lg:min-w-[200px]">
                      <Button
                        variant="primary"
                        onClick={() => handleViewJob(proposal.jobId)}
                        className="w-full"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Job
                      </Button>

                      {proposal.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Withdraw Proposal
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
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
        <Modal
          isOpen={jobModalOpen}
          onClose={() => {
            setJobModalOpen(false);
            setSelectedJob(null);
          }}
          title="Job Details"
          size="xl"
        >
          {jobLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : selectedJob ? (
            <div className="space-y-6">
              {/* Job Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <Badge variant={selectedJob.isUrgent ? 'warning' : 'secondary'}>
                    {selectedJob.isUrgent ? 'Urgent' : 'Regular'}
                  </Badge>
                  <span>Posted {formatDate(selectedJob.postedAt)}</span>
                  <span>{selectedJob.proposalCount} proposals</span>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Job Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="text-sm text-gray-600">Budget</span>
                      <p className="font-medium text-gray-900">{formatBudget(selectedJob.budget)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <div>
                      <span className="text-sm text-gray-600">Project Type</span>
                      <p className="font-medium text-gray-900 capitalize">
                        {selectedJob.projectType.replace('-', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="text-sm text-gray-600">Location</span>
                      <p className="font-medium text-gray-900 capitalize">
                        {selectedJob.location?.type || 'Remote'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Category</span>
                    <p className="font-medium text-gray-900 capitalize">
                      {selectedJob.category.replace('-', ' ')}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Experience Level</span>
                    <p className="font-medium text-gray-900 capitalize">
                      {selectedJob.experienceLevel || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={selectedJob.status === 'open' ? 'success' : 'secondary'}>
                      {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Skills Required */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Client Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedJob.client.fullName}</p>
                    <p className="text-sm text-gray-600">{selectedJob.client.email}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Failed to load job details</p>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default MyProposalsPage;
