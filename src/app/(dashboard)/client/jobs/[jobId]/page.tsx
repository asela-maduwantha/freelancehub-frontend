'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JobResponse, jobService } from '../../../../../lib/api/jobs';
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

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Assuming there's a method to get a single job by ID
        // If not, we'll need to implement it or use the existing list endpoint
        const response = await jobService.getMyJobs({}, 1, 100); // Get all jobs for now
        const foundJob = response.jobs.find((j: JobResponse) => j.id === jobId);
        if (foundJob) {
          setJob(foundJob);
        } else {
          setError('Job not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch job details');
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
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
            </div>
            <div className="flex gap-3">
              {job.status === 'draft' && (
                <Button variant="outline" onClick={() => router.push('/client/jobs/drafts')}>
                  Edit Draft
                </Button>
              )}
              {job.status === 'open' && (
                <Button variant="primary" onClick={() => router.push(`/client/jobs/${job.id}/proposals`)}>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Proposals</span>
                  <span className="font-semibold text-gray-900">{job.proposalCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Max Proposals</span>
                  <span className="font-semibold text-gray-900">{job.maxProposals || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${job.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {job.duration && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-gray-900">
                      {job.duration.value} {job.duration.unit}
                    </span>
                  </div>
                )}
                {job.isExpired && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expired</span>
                    <span className="font-semibold text-red-500">Yes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/client/jobs/${job.id}/proposals`)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Proposals
                </Button>
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