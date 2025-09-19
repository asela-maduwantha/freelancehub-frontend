'use client';

import React, { useState, useEffect } from 'react';
import { JobResponse, JobListResponse, jobService } from '../../../../lib/api/jobs';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ClientJobCard from '../../../../components/features/jobs/ClientJobCard';
import ProposalsModal from '../../../../components/features/jobs/ProposalsModal';
import { Spinner } from '../../../../components/ui/Feedback';
import Button from '../../../../components/ui/Button';

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Proposals modal state
  const [isProposalsModalOpen, setIsProposalsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await jobService.getMyJobs({}, page, 10);
      setJobs(response.jobs);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handleViewProposals = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJobId(jobId);
      setSelectedJobTitle(job.title);
      setIsProposalsModalOpen(true);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchJobs();
  };

  const getJobStats = () => {
    const draft = jobs.filter(job => job.status === 'draft').length;
    const open = jobs.filter(job => job.status === 'open').length;
    const inProgress = jobs.filter(job => job.status === 'in-progress').length;
    const completed = jobs.filter(job => job.status === 'completed').length;
    
    return { draft, open, inProgress, completed };
  };

  const stats = getJobStats();

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">My Jobs</h1>
            <p className="text-secondary mt-1">
              Manage and track all your posted jobs
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="primary">
              Post a Job
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-muted">{stats.draft}</div>
              <div className="text-sm text-secondary">Draft</div>
            </div>
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-emerald">{stats.open}</div>
              <div className="text-sm text-secondary">Open</div>
            </div>
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-accent">{stats.inProgress}</div>
              <div className="text-sm text-secondary">In Progress</div>
            </div>
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-emerald">{stats.completed}</div>
              <div className="text-sm text-secondary">Completed</div>
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
              <Button variant="secondary" size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && jobs.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && jobs.length === 0 && !error && (
          <div className="card-default">
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 text-muted mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">No jobs posted yet</h3>
              <p className="text-secondary mb-6">Get started by posting your first job and find the perfect freelancer for your project.</p>
              <Button variant="primary">
                Post Your First Job
              </Button>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {!isLoading && jobs.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <ClientJobCard
                  key={job.id}
                  job={job}
                  onViewProposals={handleViewProposals}
                  isLoading={isLoading}
                />
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
                    ({total} total jobs)
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

        {/* Proposals Modal */}
        <ProposalsModal
          isOpen={isProposalsModalOpen}
          onClose={() => setIsProposalsModalOpen(false)}
          jobId={selectedJobId}
          jobTitle={selectedJobTitle}
        />
      </div>
    </DashboardLayout>
  );
}