'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProposalResponse, proposalService } from '../../../../../../lib/api/proposals';
import { JobResponse, jobService } from '../../../../../../lib/api/jobs';
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout';
import CreateContractModal from '../../../../../../components/features/contracts/CreateContractModal';
import { Card, CardHeader, CardBody, CardFooter } from '../../../../../../components/ui/Card';
import Button from '../../../../../../components/ui/Button';
import { Badge } from '../../../../../../components/ui/Display';
import { Spinner } from '../../../../../../components/ui/Feedback';

export default function JobProposalsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobResponse | null>(null);
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJobLoading, setIsJobLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Contract modal state
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProposalResponse | null>(null);

  const fetchJob = async () => {
    if (!jobId) return;
    
    setIsJobLoading(true);
    try {
      const jobData = await jobService.getJob(jobId);
      setJob(jobData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job details');
    } finally {
      setIsJobLoading(false);
    }
  };

  const fetchProposals = async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await proposalService.getProposalsByJob(jobId, page, 10);
      setProposals(response.proposals);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch proposals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
      fetchProposals();
    }
  }, [jobId, page]);

  const handleAcceptProposal = async (proposalId: string) => {
    setActionLoading(proposalId);
    try {
      await proposalService.acceptProposal(proposalId);
      await fetchProposals(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to accept proposal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    setActionLoading(proposalId);
    try {
      await proposalService.rejectProposal(proposalId);
      await fetchProposals(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to reject proposal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateContract = (proposal: ProposalResponse) => {
    setSelectedProposal(proposal);
    setIsContractModalOpen(true);
  };

  const handleContractCreated = () => {
    fetchProposals(); // Refresh the proposals list to reflect any status changes
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDuration = (duration: { value: number; unit: string }) => {
    return `${duration.value} ${duration.unit}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'withdrawn':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getProposalStats = () => {
    const pending = proposals.filter(p => p.status === 'pending').length;
    const accepted = proposals.filter(p => p.status === 'accepted').length;
    const rejected = proposals.filter(p => p.status === 'rejected').length;
    const withdrawn = proposals.filter(p => p.status === 'withdrawn').length;
    
    return { pending, accepted, rejected, withdrawn };
  };

  const stats = getProposalStats();

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.back()}
              >
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-primary">Proposals</h1>
            </div>
            {isJobLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-secondary">Loading job details...</span>
              </div>
            ) : job ? (
              <div>
                <p className="text-lg text-primary font-medium">{job.title}</p>
                <p className="text-secondary text-sm mt-1">
                  {job.category} • {formatCurrency(job.budget.min)} {job.budget.max ? `- ${formatCurrency(job.budget.max)}` : ''}
                </p>
              </div>
            ) : (
              <p className="text-secondary">Job details not available</p>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setPage(1);
                fetchProposals();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-accent">{stats.pending}</div>
              <div className="text-sm text-secondary">Pending</div>
            </div>
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-emerald">{stats.accepted}</div>
              <div className="text-sm text-secondary">Accepted</div>
            </div>
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-danger">{stats.rejected}</div>
              <div className="text-sm text-secondary">Rejected</div>
            </div>
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-muted">{stats.withdrawn}</div>
              <div className="text-sm text-secondary">Withdrawn</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert-warning p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{error}</span>
              <Button variant="secondary" size="sm" onClick={() => {
                setPage(1);
                fetchProposals();
              }}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && proposals.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && proposals.length === 0 && !error && (
          <div className="card-default">
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 text-muted mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">No proposals yet</h3>
              <p className="text-secondary mb-6">Proposals will appear here once freelancers apply to your job.</p>
            </div>
          </div>
        )}

        {/* Proposals List */}
        {!isLoading && proposals.length > 0 && (
          <>
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <Card key={proposal._id} variant="default">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-primary">Proposal #{proposal._id.slice(-6)}</h4>
                          <Badge variant={getStatusBadgeVariant(proposal.status)}>
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </Badge>
                          {!proposal.clientViewed && (
                            <Badge variant="warning">New</Badge>
                          )}
                        </div>
                        <div className="text-sm text-secondary">
                          Submitted: {formatDate(proposal.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-emerald">
                          {formatCurrency(proposal.proposedRate.amount, proposal.proposedRate.currency)}
                        </div>
                        <div className="text-sm text-secondary">
                          {proposal.proposedRate.type === 'fixed' ? 'Fixed Price' : 'Per Hour'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-primary mb-2">Cover Letter</h5>
                        <p className="text-secondary text-sm leading-relaxed">
                          {proposal.coverLetter}
                        </p>
                      </div>

                      {proposal.estimatedDuration && (
                        <div>
                          <h5 className="font-medium text-primary mb-1">Estimated Duration</h5>
                          <p className="text-secondary text-sm">
                            {formatDuration(proposal.estimatedDuration)}
                          </p>
                        </div>
                      )}

                      {proposal.proposedMilestones && proposal.proposedMilestones.length > 0 && (
                        <div>
                          <h5 className="font-medium text-primary mb-2">Proposed Milestones</h5>
                          <div className="space-y-2">
                            {proposal.proposedMilestones.map((milestone, index) => (
                              <div key={index} className="border border-light rounded-lg p-3">
                                <div className="flex justify-between items-start mb-1">
                                  <h6 className="font-medium text-secondary">{milestone.title}</h6>
                                  <span className="text-emerald font-medium">
                                    {formatCurrency(milestone.amount)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted mb-1">{milestone.description}</p>
                                <div className="text-xs text-muted">
                                  Duration: {milestone.durationDays} days
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {proposal.attachments && proposal.attachments.length > 0 && (
                        <div>
                          <h5 className="font-medium text-primary mb-2">Attachments</h5>
                          <div className="space-y-1">
                            {proposal.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <a 
                                  href={attachment.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="link-default"
                                >
                                  {attachment.filename}
                                </a>
                                <span className="text-muted">
                                  ({(attachment.size / 1024 / 1024).toFixed(1)} MB)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>

                  {proposal.status === 'pending' && (
                    <CardFooter>
                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRejectProposal(proposal._id)}
                          disabled={actionLoading === proposal._id}
                        >
                          {actionLoading === proposal._id ? 'Rejecting...' : 'Reject'}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptProposal(proposal._id)}
                          disabled={actionLoading === proposal._id}
                        >
                          {actionLoading === proposal._id ? 'Accepting...' : 'Accept'}
                        </Button>
                      </div>
                    </CardFooter>
                  )}

                  {proposal.status === 'accepted' && (
                    <CardFooter>
                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCreateContract(proposal)}
                          disabled={actionLoading === proposal._id}
                        >
                          Create Contract
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary">
                    Page {page} of {totalPages}
                  </span>
                  <span className="text-sm text-muted">
                    ({total} total proposals)
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
          </>
        )}

        {/* Create Contract Modal */}
        {selectedProposal && (
          <CreateContractModal
            isOpen={isContractModalOpen}
            onClose={() => {
              setIsContractModalOpen(false);
              setSelectedProposal(null);
            }}
            proposal={selectedProposal}
            onContractCreated={handleContractCreated}
          />
        )}
      </div>
    </DashboardLayout>
  );
}