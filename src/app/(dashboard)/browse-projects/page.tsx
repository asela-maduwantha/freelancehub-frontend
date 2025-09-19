'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import Button from '../../../components/ui/Button/Button';
import Loader from '../../../components/ui/Feedback/Loader';
import { Alert } from '../../../components/ui/Feedback';
import { jobService, JobResponse, JobFilters } from '../../../lib/api/jobs';
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Star,
  Filter,
  ChevronDown,
  Briefcase,
  FileText,
  Eye
} from 'lucide-react';

const JOB_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'draft', label: 'Draft' }
];

const JOB_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Desktop Development',
  'Data Science & Analytics',
  'Design & Creative',
  'Writing & Translation',
  'Marketing & Sales',
  'Customer Service',
  'Consulting',
  'Other'
];

const BrowseProjectsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<JobFilters>({
    status: 'open' // Default to open jobs for freelancers
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = async (page = 1, searchQuery = '', activeFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryFilters: JobFilters = {
        ...activeFilters
      };

      const response = await jobService.getJobs(queryFilters, page, 12);
      setJobs(response.jobs);
      console.log(response);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1, searchTerm, filters);
  }, []);

  const handleSearch = () => {
    const searchFilters = { ...filters };
    if (searchTerm.trim()) {
      searchFilters.search = searchTerm.trim();
    } else {
      delete searchFilters.search;
    }
    setFilters(searchFilters);
    fetchJobs(1, searchTerm, searchFilters);
  };

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
    fetchJobs(1, searchTerm, newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchJobs(page, searchTerm, filters);
  };

  const formatBudget = (budget: JobResponse['budget']) => {
    const { type, min, max, currency = 'USD' } = budget;
    
    if (type === 'range' && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    return `$${min.toLocaleString()}`;
  };

  const formatDuration = (duration?: JobResponse['duration']) => {
    if (!duration) return 'Not specified';
    
    const typeLabels = {
      'less-than-1-month': 'Less than 1 month',
      '1-3-months': '1-3 months',
      '3-6-months': '3-6 months',
      'more-than-6-months': 'More than 6 months'
    };
    
    return typeLabels[duration.type] || duration.type;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <DashboardLayout userRole="freelancer" userName="Freelancer Name">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Browse Projects</h1>
                <p className="text-gray-600">Find and apply to projects that match your skills</p>
              </div>
              <div className="text-sm text-gray-600">
                {total} projects found
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search projects by title, description, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                
                {/* Search Button */}
                <Button onClick={handleSearch} variant="primary">
                  Search
                </Button>
                
                {/* Filter Toggle */}
                <Button 
                  onClick={() => setShowFilters(!showFilters)} 
                  variant="outline"
                  className="flex items-center"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">All Statuses</option>
                        {JOB_STATUSES.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={filters.category || ''}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">All Categories</option>
                        {JOB_CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client ID (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Filter by client ID"
                        value={filters.clientId || ''}
                        onChange={(e) => handleFilterChange('clientId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} />
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader size="lg" />
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {job.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {getTimeAgo(job.postedAt)}
                          </span>
                          <span className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {job.proposalCount} proposals
                          </span>
                          {job.isUrgent && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {job.description}
                    </p>

                    {/* Job Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>{formatBudget(job.budget)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{formatDuration(job.duration)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span className="capitalize">{job.location?.type || 'Remote'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span className="capitalize">{job.projectType.replace('-', ' ')}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-green-700">
                            {job.client.fullName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{job.client.fullName}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link href={`/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/jobs/${job.id}/apply`}>
                          <Button variant="primary" size="sm">
                            Apply
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {jobs.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrowseProjectsPage;