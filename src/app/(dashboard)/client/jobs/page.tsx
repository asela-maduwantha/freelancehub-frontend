'use client';

import React, { useState, useEffect } from 'react';
import { JobResponse, JobListResponse, jobService } from '../../../../lib/api/jobs';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ClientJobCard from '../../../../components/features/jobs/ClientJobCard';
import { Spinner } from '../../../../components/ui/Feedback';
import Button from '../../../../components/ui/Button';

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
                <p className="text-gray-600 mt-1">
                  Manage and track all your posted jobs
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="primary" className="px-6 py-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Post a Job
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stats.draft}</div>
                  <div className="text-sm text-gray-600 mt-1">Draft</div>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">{stats.open}</div>
                  <div className="text-sm text-gray-600 mt-1">Open</div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-600">{stats.inProgress}</div>
                  <div className="text-sm text-gray-600 mt-1">In Progress</div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
                  <div className="text-sm text-gray-600 mt-1">Completed</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Jobs</h3>
                <p className="text-red-700">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="border-red-300 text-red-700 hover:bg-red-50">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && jobs.length === 0 && (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Spinner size="lg" className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Your Jobs</h3>
              <p className="text-gray-600">Please wait while we fetch your job listings...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && jobs.length === 0 && !error && (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No jobs posted yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by posting your first job and find the perfect freelancer for your project.
              </p>
              <Button variant="primary" className="px-8 py-3">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Post Your First Job
              </Button>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        {!isLoading && jobs.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {jobs.map((job) => (
                <ClientJobCard
                  key={job.id}
                  job={job}
                  isLoading={isLoading}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {jobs.length} of {total} jobs
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                      className="px-3 py-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {/* First page */}
                      {page > 3 && (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => setPage(1)}
                            disabled={isLoading}
                            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          >
                            1
                          </Button>
                          {page > 4 && (
                            <span className="px-2 py-2 text-gray-400">...</span>
                          )}
                        </>
                      )}

                      {/* Page range around current page */}
                      {(() => {
                        const pages = [];
                        const start = Math.max(1, page - 2);
                        const end = Math.min(totalPages, page + 2);

                        for (let i = start; i <= end; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={i === page ? "primary" : "ghost"}
                              onClick={() => setPage(i)}
                              disabled={isLoading}
                              className={`px-3 py-2 text-sm font-medium min-w-[40px] ${
                                i === page
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              {i}
                            </Button>
                          );
                        }
                        return pages;
                      })()}

                      {/* Last page */}
                      {page < totalPages - 2 && (
                        <>
                          {page < totalPages - 3 && (
                            <span className="px-2 py-2 text-gray-400">...</span>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() => setPage(totalPages)}
                            disabled={isLoading}
                            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoading}
                      className="px-3 py-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}


      </div>
    </DashboardLayout>
  );
}