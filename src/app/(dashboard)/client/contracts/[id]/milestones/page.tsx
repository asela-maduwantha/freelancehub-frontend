'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contractService, ContractMilestonesResponse, MilestoneResponse } from '@/lib/api/contracts';
import { Spinner } from '@/components/ui/Feedback';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Display';

const ContractMilestonesPage = () => {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [milestones, setMilestones] = useState<MilestoneResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractTitle, setContractTitle] = useState<string>('');

  useEffect(() => {
    console.log('ContractMilestonesPage - useEffect triggered');
    console.log('contractId from params:', contractId);
    console.log('params object:', params);
    
    if (contractId) {
      console.log('Fetching milestones for contractId:', contractId);
      fetchMilestones();
    } else {
      console.error('No contractId found in params');
      setError('Contract ID not found in URL');
      setIsLoading(false);
    }
  }, [contractId]);

  const fetchMilestones = async () => {
    try {
      console.log('fetchMilestones - Starting API call for contractId:', contractId);
      setIsLoading(true);
      setError(null);
      
      const response: ContractMilestonesResponse = await contractService.getContractMilestones(contractId);
      console.log('fetchMilestones - API response:', response);
      
      setMilestones(response.milestones);
      console.log('fetchMilestones - Milestones set:', response.milestones);
      
      // Get contract title from the first milestone if available
      if (response.milestones.length > 0) {
        const firstMilestone = response.milestones[0];
        if (typeof firstMilestone.contractId === 'object') {
          setContractTitle(firstMilestone.contractId.title);
        }
      }
    } catch (err: any) {
      console.error('fetchMilestones - Error:', err);
      console.error('fetchMilestones - Error message:', err.message);
      console.error('fetchMilestones - Full error object:', err);
      setError(err.message || 'Failed to fetch milestones');
    } finally {
      console.log('fetchMilestones - Setting loading to false');
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/client/contracts');
  };

  const getMilestoneStats = () => {
    const total = milestones.length;
    const pending = milestones.filter(m => m.status === 'pending').length;
    const inProgress = milestones.filter(m => m.status === 'in-progress').length;
    const submitted = milestones.filter(m => m.status === 'submitted').length;
    const completed = milestones.filter(m => m.status === 'approved' || m.status === 'paid').length;
    const overdue = milestones.filter(m => {
      const dueDate = new Date(m.dueDate);
      const now = new Date();
      return dueDate < now && m.status !== 'approved' && m.status !== 'paid';
    }).length;

    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    const paidAmount = milestones.filter(m => m.status === 'paid').reduce((sum, m) => sum + m.amount, 0);

    return {
      total,
      pending,
      inProgress,
      submitted,
      completed,
      overdue,
      totalAmount,
      paidAmount,
      currency: milestones[0]?.currency || 'USD'
    };
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (milestone: MilestoneResponse) => {
    switch (milestone.status) {
      case 'paid':
        return 'success';
      case 'approved':
        return 'success';
      case 'submitted':
        return 'primary';
      case 'in-progress':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const isOverdue = (milestone: MilestoneResponse) => {
    const dueDate = new Date(milestone.dueDate);
    const now = new Date();
    return dueDate < now && milestone.status !== 'approved' && milestone.status !== 'paid';
  };

  const getDaysUntilDue = (milestone: MilestoneResponse) => {
    const dueDate = new Date(milestone.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusText = (milestone: MilestoneResponse) => {
    switch (milestone.status) {
      case 'paid':
        return 'Paid';
      case 'approved':
        return 'Approved';
      case 'submitted':
        return 'Submitted';
      case 'in-progress':
        return 'In Progress';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const canApprove = (milestone: MilestoneResponse) => {
    return milestone.status === 'submitted';
  };

  const canProcessPayment = (milestone: MilestoneResponse) => {
    return milestone.status === 'approved';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <div className="alert-warning p-6 rounded-lg max-w-md mx-auto">
            <h3 className="font-semibold mb-2">Error Loading Milestones</h3>
            <p className="text-sm mb-4">{error}</p>
            <div className="space-x-3">
              <Button variant="secondary" size="sm" onClick={handleGoBack}>
                Go Back
              </Button>
              <Button variant="primary" size="sm" onClick={fetchMilestones}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getMilestoneStats();

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="secondary" size="sm" onClick={handleGoBack}>
              ← Back to Contracts
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-primary">Contract Milestones</h1>
          {contractTitle && (
            <p className="text-secondary mt-1">{contractTitle}</p>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      {milestones.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="card p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-secondary">Total</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-muted">{stats.pending}</div>
            <div className="text-sm text-secondary">Pending</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-accent">{stats.inProgress}</div>
            <div className="text-sm text-secondary">In Progress</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-blue">{stats.submitted}</div>
            <div className="text-sm text-secondary">Submitted</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-emerald">{stats.completed}</div>
            <div className="text-sm text-secondary">Completed</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-red">{stats.overdue}</div>
            <div className="text-sm text-secondary">Overdue</div>
          </div>
          <div className="card p-4">
            <div className="text-lg font-bold text-emerald">
              {formatCurrency(stats.totalAmount, stats.currency)}
            </div>
            <div className="text-sm text-secondary">Total Value</div>
          </div>
          <div className="card p-4">
            <div className="text-lg font-bold text-emerald">
              {formatCurrency(stats.paidAmount, stats.currency)}
            </div>
            <div className="text-sm text-secondary">Amount Paid</div>
          </div>
        </div>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted text-lg mb-4">No milestones found</div>
          <p className="text-secondary mb-6">
            This contract doesn't have any milestones yet.
          </p>
          <Button variant="secondary" onClick={handleGoBack}>
            Back to Contracts
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {milestones
            .sort((a, b) => a.order - b.order)
            .map((milestone) => (
              <Card key={milestone._id} variant="default" className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        {milestone.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-secondary">Milestone #{milestone.order}</span>
                        <Badge variant={getStatusBadgeVariant(milestone)}>
                          {getStatusText(milestone)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald">
                        {formatCurrency(milestone.amount, milestone.currency)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-secondary">{milestone.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-primary">Due Date:</span>
                        <div className="text-secondary">
                          {formatDate(milestone.dueDate)}
                          {isOverdue(milestone) && (
                            <span className="text-red ml-2">
                              ({Math.abs(getDaysUntilDue(milestone))} days overdue)
                            </span>
                          )}
                          {!isOverdue(milestone) && getDaysUntilDue(milestone) > 0 && (
                            <span className="text-muted ml-2">
                              ({getDaysUntilDue(milestone)} days remaining)
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-primary">Created:</span>
                        <div className="text-secondary">{formatDate(milestone.createdAt)}</div>
                      </div>
                    </div>

                    {milestone.submittedAt && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-primary">Submitted:</span>
                          <div className="text-secondary">{formatDate(milestone.submittedAt)}</div>
                        </div>
                        {milestone.approvedAt && (
                          <div>
                            <span className="font-medium text-primary">Approved:</span>
                            <div className="text-secondary">{formatDate(milestone.approvedAt)}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                      <div className="border-t border-light pt-4">
                        <h5 className="font-medium text-primary mb-2">Deliverables</h5>
                        <div className="space-y-2">
                          {milestone.deliverables.map((deliverable: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {deliverable.url ? (
                                <a
                                  href={deliverable.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                                >
                                  {deliverable.filename}
                                </a>
                              ) : (
                                <span className="text-primary">{deliverable.filename}</span>
                              )}
                              <span className="text-secondary">({(deliverable.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {milestone.submissionNote && (
                      <div className="border-t border-light pt-4">
                        <h5 className="font-medium text-primary mb-2">Submission Note</h5>
                        <div className="p-3 bg-light rounded-lg">
                          <p className="text-sm text-secondary">{milestone.submissionNote}</p>
                        </div>
                      </div>
                    )}

                    {milestone.clientFeedback && (
                      <div className="border-t border-light pt-4">
                        <h5 className="font-medium text-primary mb-2">Client Feedback</h5>
                        <div className="p-3 bg-emerald-light rounded-lg">
                          <p className="text-sm text-emerald">{milestone.clientFeedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>

                <CardFooter>
                  <div className="flex gap-3">
                    {canApprove(milestone) && (
                      <>
                        <Button variant="secondary" size="sm">
                          Request Changes
                        </Button>
                        <Button variant="primary" size="sm">
                          Approve Milestone
                        </Button>
                      </>
                    )}
                    {canProcessPayment(milestone) && (
                      <Button variant="primary" size="sm">
                        Process Payment
                      </Button>
                    )}
                    {milestone.status === 'paid' && (
                      <div className="flex items-center gap-2 text-emerald">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">Completed & Paid</span>
                      </div>
                    )}
                    <Button variant="secondary" size="sm" disabled>
                      View Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default ContractMilestonesPage;