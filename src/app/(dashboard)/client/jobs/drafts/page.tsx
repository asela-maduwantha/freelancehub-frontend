'use client';

import React, { useState, useEffect } from 'react';
import { jobService, JobResponse, JobListResponse } from '../../../../../lib/api/jobs';
import DraftJobCard from '../../../../../components/features/jobs/DraftJobCard';
import { Card, CardBody } from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import { Spinner } from '../../../../../components/ui/Feedback';

const DraftJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [openingJobId, setOpeningJobId] = useState<string | null>(null);

  const limit = 10;

  useEffect(() => {
    fetchDraftJobs();
  }, [page]);

  const fetchDraftJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: JobListResponse = await jobService.getMyJobs(
        { status: 'draft' },
        page,
        limit
      );
      
      setJobs(response.jobs);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch draft jobs');
      console.error('Error fetching draft jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenJob = async (jobId: string) => {
    try {
      setOpeningJobId(jobId);
      setError(null);
      
      await jobService.openJob(jobId);
      
      // Remove the job from the list since it's no longer a draft
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      setTotal(prevTotal => Math.max(0, prevTotal - 1));
      
      // Show success message
      alert('Job successfully opened for proposals!');
    } catch (err: any) {
      setError(err.message || 'Failed to open job');
      console.error('Error opening job:', err);
    } finally {
      setOpeningJobId(null);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchDraftJobs();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Draft Jobs</h1>
            <p className="text-secondary mt-2">
              Manage your draft job postings. Open them for proposals when ready.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary">Total Draft Jobs:</span>
            <span className="badge-secondary px-2 py-1 rounded-full">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary">Page:</span>
            <span className="text-secondary">{page} of {totalPages}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Content */}
      {jobs.length === 0 && !loading ? (
        <Card className="text-center py-12">
          <CardBody>
            <div className="max-w-md mx-auto">
              <div className="text-muted mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">No Draft Jobs</h3>
              <p className="text-secondary mb-6">
                You don't have any draft jobs yet. Create a new job posting to get started.
              </p>
              <Button variant="primary" onClick={() => window.location.href = '/client/jobs/create'}>
                Create New Job
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Jobs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <DraftJobCard
                key={job.id}
                job={job}
                onOpenJob={handleOpenJob}
                isLoading={openingJobId === job.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  const isCurrentPage = pageNum === page;
                  
                  // Show first page, last page, current page, and pages around current page
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={isCurrentPage ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (
                    pageNum === page - 2 ||
                    pageNum === page + 2
                  ) {
                    return <span key={pageNum} className="px-2 text-muted">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DraftJobsPage;
