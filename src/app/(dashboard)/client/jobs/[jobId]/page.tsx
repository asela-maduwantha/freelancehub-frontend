'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JobResponse, jobService } from '../../../../../lib/api/jobs';
import { apiClient } from '../../../../../lib/api/client';
import { ProposalResponse, proposalService } from '../../../../../lib/api/proposals';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { Spinner } from '../../../../../components/ui/Feedback';
import Button from '../../../../../components/ui/Button';
import { Badge } from '../../../../../components/ui/Display';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch job details using the API client directly to avoid processing issues
        const response = await apiClient.get(`/jobs/${jobId}`);
        
        // Normalize the job data
        const jobData = response;
        
        
        setJob(jobData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch job details');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchProposals = async () => {
      if (!jobId) return;

      setProposalsLoading(true);
      try {
        const proposalsData = await proposalService.getProposalsByJob(jobId, 1, 50); // Get up to 50 proposals
        setProposals(proposalsData.proposals);
      } catch (err: any) {
        console.error('Failed to fetch proposals:', err);
        // Don't set error state for proposals, just log it
      } finally {
        setProposalsLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
      fetchProposals();
    }
  }, [jobId]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatBudget = (job: JobResponse) => {
    const { budget } = job;
    if (budget.type === 'fixed') {
      return formatCurrency(budget.min, budget.currency);
    } else if (budget.type === 'range') {
      return `${formatCurrency(budget.min, budget.currency)} - ${formatCurrency(budget.max || 0, budget.currency)}`;
    } else if (budget.type === 'hourly') {
      return `${formatCurrency(budget.min, budget.currency)}/hr`;
    }
    return 'Budget not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'open':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center min-h-96">
          <Spinner size="lg" className="text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout userRole="client">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Job</h3>
            <p className="text-red-700 mb-6">{error || 'Job not found'}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <Badge variant={getStatusBadgeVariant(job.status)} className="px-3 py-1">
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
                {job.isUrgent && (
                  <Badge variant="warning" className="px-3 py-1">Urgent</Badge>
                )}
                {job.isFeatured && (
                  <Badge variant="warning" className="px-3 py-1">Featured</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="font-medium text-green-600 text-lg">{formatBudget(job)}</span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">{job.projectType.replace('-', ' ')}</span>
                <span className="text-gray-400">•</span>
                <span>{job.category}</span>
                {job.subcategory && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>{job.subcategory}</span>
                  </>
                )}
                <span className="text-gray-400">•</span>
                <span>Posted {formatDate(job.postedAt)}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <span>Created: {formatDate(job.createdAt)}</span>
                {job.updatedAt !== job.createdAt && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>Updated: {formatDate(job.updatedAt)}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                <span>Max Proposals: {job.maxProposals || 'Unlimited'}</span>
                <span className="text-gray-400">•</span>
                <span className={job.isActive ? 'text-green-600' : 'text-btn-accent'}>
                  {job.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-gray-400">•</span>
                <span className={job.canReceiveProposals ? 'text-green-600' : 'text-gray-600'}>
                  {job.canReceiveProposals ? 'Receiving Proposals' : 'Not Receiving Proposals'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {job.status === 'draft' && (
                <Button variant="outline" onClick={() => router.push(`/client/jobs/${job.id}/edit`)}>
                  Edit Draft
                </Button>
              )}
              {job.status === 'open' && (
                <Button variant="primary" className='btn-accent' onClick={() => router.push(`/client/jobs/${job.id}/proposals`)}>
                  View Proposals ({job.proposalCount})
                </Button>
              )}
              <Button variant="outline" onClick={() => router.back()}>
                Back to Jobs
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Client Information</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {job.client.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{job.client.fullName}</p>
                        <p className="text-xs text-gray-600">{job.client.email}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Project Type</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 capitalize">
                      {job.projectType.replace('-', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h3>
                    <span className="text-gray-900 font-medium capitalize">
                      {job.experienceLevel || 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Job Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${job.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-600">
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${job.canReceiveProposals ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <span className="text-sm text-gray-600">
                          {job.canReceiveProposals ? 'Receiving Proposals' : 'Not Receiving Proposals'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${job.isExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className="text-sm text-gray-600">
                          {job.isExpired ? 'Expired' : 'Not Expired'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Proposals</h3>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{job.proposalCount}</span> received
                      {job.maxProposals && (
                        <span> (max {job.maxProposals})</span>
                      )}
                    </div>
                  </div>

                  {job.duration && job.duration.value !== undefined && job.duration.unit && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Duration</h3>
                      <span className="text-gray-900 font-medium">
                        {job.duration.value} {job.duration.unit}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills & Requirements */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Requirements</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {job.experienceLevel && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h3>
                    <span className="text-gray-900 font-medium">
                      {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            {job.attachments && job.attachments.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
                <div className="space-y-3">
                  {job.attachments.map((attachment, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                          <p className="text-xs text-gray-600">
                            {(attachment.size / 1024).toFixed(1)} KB • {attachment.type}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Proposals */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Proposals</h2>
                <span className="text-sm text-gray-500">({proposals.length})</span>
              </div>

              {proposalsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner size="sm" className="text-blue-600" />
                </div>
              ) : proposals.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {proposals.map((proposal) => (
                    <div key={proposal._id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              Proposal #{proposal._id.slice(-6)}
                            </span>
                            <Badge
                              variant={
                                proposal.status === 'accepted' ? 'success' :
                                proposal.status === 'rejected' ? 'error' :
                                proposal.status === 'pending' ? 'warning' : 'secondary'
                              }
                              className="px-2 py-0.5 text-xs"
                            >
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {formatCurrency(proposal.proposedRate.amount, proposal.proposedRate.currency || 'USD')}
                            {proposal.proposedRate.type === 'hourly' && '/hr'}
                          </div>
                          {proposal.estimatedDuration && (
                            <div className="text-xs text-gray-500">
                              Est. {proposal.estimatedDuration.value} {proposal.estimatedDuration.unit}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {proposal.coverLetter}
                      </p>
                      <div className="text-xs text-gray-500">
                        Submitted {formatDate(proposal.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No proposals yet</p>
                </div>
              )}

              {proposals.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => router.push(`/client/jobs/${job.id}/proposals`)}
                >
                  View All Proposals
                </Button>
              )}
            </div>

            {/* Contract */}
            {job.contractId && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contract</h2>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push(`/client/contracts/${job.contractId}`)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Contract
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/client/jobs/create')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Post Similar Job
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}