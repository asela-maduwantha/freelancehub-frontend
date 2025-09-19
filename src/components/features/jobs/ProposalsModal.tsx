import React, { useState, useEffect } from 'react';
import { ProposalResponse, proposalService } from '../../../lib/api/proposals';
import { Modal } from '../../ui/Modal';
import { Card, CardHeader, CardBody, CardFooter } from '../../ui/Card';
import Button from '../../ui/Button';
import { Badge } from '../../ui/Display';
import { Spinner } from '../../ui/Feedback';

interface ProposalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

const ProposalsModal: React.FC<ProposalsModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle
}) => {
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProposals = async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await proposalService.getProposalsByJob(jobId, page, 10);
      setProposals(response.proposals);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch proposals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && jobId) {
      fetchProposals();
    }
  }, [isOpen, jobId, page]);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-primary">Proposals</h2>
            <p className="text-secondary mt-1">{jobTitle}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {error && (
          <div className="alert-warning mb-4 p-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="md" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-primary mb-1">No proposals yet</h3>
            <p className="text-secondary">Proposals will appear here once freelancers apply to your job.</p>
          </div>
        ) : (
          <div className="space-y-4">
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
                  <div className="space-y-3">
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
              </Card>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </Button>
                <span className="text-sm text-secondary">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProposalsModal;