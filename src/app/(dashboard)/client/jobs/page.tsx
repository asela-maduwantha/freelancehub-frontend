'use client';

import React, { useState, useEffect } from 'react';
import { JobResponse, JobListResponse, jobService } from '../../../../lib/api/jobs';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ClientJobCard from '../../../../components/features/jobs/ClientJobCard';
import { Spinner } from '../../../../components/ui/Feedback';
import Button from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Display';
import { LayoutList, LayoutGrid, Table } from 'lucide-react';

type ViewMode = 'list' | 'grid' | 'compact';
type JobStatus = 'all' | 'draft' | 'open' | 'contracted' | 'in-progress' | 'completed';

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<JobStatus>('all');

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatBudget = (job: JobResponse) => {
    const { budget } = job;
    if (budget.type === 'fixed') {
      return `$${budget.min.toLocaleString()}`;
    } else if (budget.type === 'range') {
      return `$${budget.min.toLocaleString()} - $${(budget.max || 0).toLocaleString()}`;
    }
    return 'Budget TBD';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      open: 'bg-green-100 text-green-700',
      contracted: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-purple-100 text-purple-700',
      completed: 'bg-emerald-100 text-emerald-700',
      closed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

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

  const handlePostJob = () => {
    window.location.href = '/client/jobs/create';
  };

  const filteredJobs = jobs.filter(job => {
    if (statusFilter === 'all') return true;
    return job.status === statusFilter;
  });

  const getJobStats = () => {
    const draft = jobs.filter(job => job.status === 'draft').length;
    const open = jobs.filter(job => job.status === 'open').length;
    const awaitingContract = jobs.filter(job => job.status === 'awaiting-contract').length;
    const contracted = jobs.filter(job => job.status === 'contracted').length;
    const inProgress = jobs.filter(job => job.status === 'in-progress').length;
    const underReview = jobs.filter(job => job.status === 'under-review').length;
    const completed = jobs.filter(job => job.status === 'completed').length;
    const closed = jobs.filter(job => job.status === 'closed').length;
    const cancelled = jobs.filter(job => job.status === 'cancelled').length;
    
    return { 
      draft, 
      open, 
      awaitingContract, 
      contracted, 
      inProgress, 
      underReview, 
      completed, 
      closed, 
      cancelled,
      active: open + awaitingContract + contracted + inProgress + underReview
    };
  };

  const stats = getJobStats();

  // List View Component
  const ListView = () => (
    <div className="space-y-4">
      {filteredJobs.map((job) => (
        <div
          key={job.id}
          className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-start justify-between gap-6">
            {/* Left Section */}
            <div className="flex-1 min-w-0">
              {/* Title and Status */}
              <div className="flex items-start gap-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 flex-1">
                  {job.title}
                </h3>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getStatusColor(job.status)}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                {job.isUrgent && (
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                    Urgent
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {job.description}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="font-semibold text-green-600">{formatBudget(job)}</span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">{job.category}</span>
                <span className="text-gray-400">•</span>
                <span>{job.proposalCount} proposals</span>
                <span className="text-gray-400">•</span>
                <span>Posted {formatDate(job.postedAt)}</span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {job.skills.slice(0, 4).map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 4 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                    +{job.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = `/client/jobs/${job.id}`}
                className="whitespace-nowrap"
              >
                View Details
              </Button>
              {job.proposalCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/client/jobs/${job.id}/proposals`}
                  className="whitespace-nowrap"
                >
                  View Proposals
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredJobs.map((job) => (
        <div
          key={job.id}
          className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-300 transition-all flex flex-col"
        >
          {/* Top - Status Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(job.status)}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </span>
            {job.isUrgent && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                Urgent
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 min-h-[48px]">
            {job.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
            {job.description}
          </p>

          {/* Meta Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Budget:</span>
              <span className="font-semibold text-green-600">{formatBudget(job)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Proposals:</span>
              <span className="font-medium text-gray-900">{job.proposalCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Posted:</span>
              <span className="font-medium text-gray-900">{formatDate(job.postedAt)}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 3).map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                +{job.skills.length - 3}
              </span>
            )}
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = `/client/jobs/${job.id}`}
            className="w-full"
          >
            View Details
          </Button>
        </div>
      ))}
    </div>
  );

  // Compact View Component (Table)
  const CompactView = () => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Proposals
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Posted
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                      {job.title}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {job.category}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-green-600">
                    {formatBudget(job)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {job.proposalCount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {formatDate(job.postedAt)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/client/jobs/${job.id}`}
                    >
                      View
                    </Button>
                    {job.proposalCount > 0 && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => window.location.href = `/client/jobs/${job.id}/proposals`}
                      >
                        Proposals
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage and track all your posted jobs
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button 
                onClick={handlePostJob}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Post a Job
              </button>
            </div>
          </div>

          {/* View Toggle and Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-4 border-t border-gray-200">
            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Filter:</span>
              {(['all', 'open', 'contracted', 'in-progress', 'completed', 'draft'] as JobStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  {status === 'all' && ` (${jobs.length})`}
                  {status !== 'all' && ` (${jobs.filter(j => j.status === status).length})`}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                title="List View"
              >
                <LayoutList size={18} />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'compact'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                title="Compact View"
              >
                <Table size={18} />
                <span className="hidden sm:inline">Compact</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
                  <div className="text-xs text-gray-600 mt-1">Draft</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
                  <div className="text-xs text-gray-600 mt-1">Open</div>
                </div>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.contracted}</div>
                  <div className="text-xs text-gray-600 mt-1">Contracted</div>
                </div>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                  <div className="text-xs text-gray-600 mt-1">Active</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                  <div className="text-xs text-gray-600 mt-1">Completed</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-accent-light border border-accent rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-accent mb-1">Error Loading Jobs</h3>
                <p className="text-accent">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="border-accent text-accent hover:bg-accent-light">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && jobs.length === 0 && (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mb-4">
                <Spinner size="lg" className="text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Your Jobs</h3>
              <p className="text-gray-600">Please wait while we fetch your job listings...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && jobs.length === 0 && !error && (
          <div className="bg-white rounded-lg p-12 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                Get started by posting your first job and find the perfect freelancer for your project.
              </p>
              <Button variant="primary" className="px-6 py-2" onClick={handlePostJob}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Post Your First Job
              </Button>
            </div>
          </div>
        )}

        {/* No Results for Filter */}
        {!isLoading && jobs.length > 0 && filteredJobs.length === 0 && (
          <div className="bg-white rounded-lg p-12 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                No jobs match the selected filter. Try selecting a different status.
              </p>
              <Button variant="outline" onClick={() => setStatusFilter('all')}>
                Clear Filter
              </Button>
            </div>
          </div>
        )}

        {/* Jobs List - Conditional View Rendering */}
        {!isLoading && filteredJobs.length > 0 && (
          <>
            {viewMode === 'list' && <ListView />}
            {viewMode === 'grid' && <GridView />}
            {viewMode === 'compact' && <CompactView />}

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
                      className="px-3 py-2 border-gray-200 hover:border-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-accent hover:bg-accent-light"
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
                                  ? 'btn-accent flex gap-1 items-center justify-center'
                                  : 'text-white hover:text-accent hover:btn-accent'
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
                            className="btn-accent flex gap-1 items-center justify-center"
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
                      className="btn-accent flex gap-1 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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