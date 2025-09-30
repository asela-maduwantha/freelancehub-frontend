'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Button from '../../../../components/ui/Button/Button';
import Loader from '../../../../components/ui/Feedback/Loader';
import { Alert } from '../../../../components/ui/Feedback';
import { jobService, JobResponse, JobFilters } from '../../../../lib/api/jobs';
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
  Eye,
  TrendingUp,
  Zap,
  Award,
  SlidersHorizontal
} from 'lucide-react';

const JOB_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'draft', label: 'Draft' }
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];

const PROJECT_TYPES = [
  { value: 'fixed-price', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly' }
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'budget-high', label: 'Highest Budget' },
  { value: 'budget-low', label: 'Lowest Budget' },
  { value: 'proposals-low', label: 'Least Competitive' }
];

const BrowseProjectsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<JobResponse[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobResponse[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<JobFilters>({
    status: 'open'
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = async (page = 1, searchQuery = '', activeFilters = {}, sort = 'relevance') => {
    try {
      setIsLoading(true);
      setError(null);

      const queryFilters: JobFilters = {
        ...activeFilters
      };

      // Add search if provided
      if (searchQuery.trim()) {
        queryFilters.search = searchQuery.trim();
      }

      const response = await jobService.getJobs(queryFilters, page, 12);
      setJobs(response.jobs);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeaturedJobs = async () => {
    try {
      setIsLoadingFeatured(true);
      const response = await jobService.getFeaturedJobs(1, 6);
      setFeaturedJobs(response.jobs);
    } catch (err: any) {
      console.error('Failed to load featured jobs:', err);
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  const fetchRecentJobs = async () => {
    try {
      setIsLoadingRecent(true);
      const response = await jobService.getRecentJobs(1, 8, 7);
      setRecentJobs(response.jobs);
    } catch (err: any) {
      console.error('Failed to load recent jobs:', err);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await jobService.getCategories();
      setCategories(response.categories || []);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await jobService.getSkills();
      setSkills(response.skills || []);
    } catch (err: any) {
      console.error('Failed to load skills:', err);
    }
  };

  useEffect(() => {
    // Load initial data
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchJobs(1, searchTerm, filters, sortBy),
          fetchFeaturedJobs(),
          fetchRecentJobs(),
          fetchCategories(),
          fetchSkills()
        ]);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  const handleSearch = () => {
    const searchFilters = { ...filters };
    if (searchTerm.trim()) {
      searchFilters.search = searchTerm.trim();
    } else {
      delete searchFilters.search;
    }
    setFilters(searchFilters);
    fetchJobs(1, searchTerm, searchFilters, sortBy);
  };

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
    fetchJobs(1, searchTerm, newFilters, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    fetchJobs(1, searchTerm, filters, newSort);
  };

  const handlePageChange = (page: number) => {
    fetchJobs(page, searchTerm, filters, sortBy);
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
    
    const typeLabels: Record<string, string> = {
      'less-than-1-month': 'Less than 1 month',
      '1-3-months': '1-3 months',
      '3-6-months': '3-6 months',
      'more-than-6-months': 'More than 6 months'
    };
    
    // Handle case where duration might be a string or object
    const durationType = typeof duration === 'string' ? duration : (duration as any)?.type;
    return typeLabels[durationType] || durationType || 'Not specified';
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
    <DashboardLayout userRole="freelancer">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Your Next Project</h1>
              <p className="text-gray-600 mt-2">Discover exciting opportunities that match your skills</p>
            </div>
            <div className="text-sm text-gray-600">
              {total} projects available
            </div>
          </div>
        </div>

        {/* Featured Jobs Section */}
        {featuredJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Featured Projects</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.map((job) => (
                <div key={job.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{job.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatBudget(job.budget)}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      Featured
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">{job.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-green-700">
                          {job.client.fullName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{job.client.fullName}</span>
                    </div>
                    <Link href={`/freelancer/jobs/${job.id}`}>
                      <Button variant="primary" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Jobs Section */}
        {recentJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Recently Posted</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-1 flex-1">{job.title}</h3>
                    <span className="text-xs text-green-600 font-medium ml-2">New</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatBudget(job.budget)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(job.postedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{job.client.fullName}</span>
                    <Link href={`/freelancer/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
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
            
            {/* Sort Dropdown */}
            <div className="w-full lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            {/* Search Button */}
            <Button onClick={handleSearch} variant="primary" className="px-6">
              Search
            </Button>
            
            {/* Advanced Filters Toggle */}
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    {categories.map((category: any) => (
                      <option key={category.id || category.slug} value={category.slug || category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={filters.experienceLevel || ''}
                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">All Levels</option>
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <select
                    value={filters.projectType || ''}
                    onChange={(e) => handleFilterChange('projectType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">All Types</option>
                    {PROJECT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minBudget || ''}
                      onChange={(e) => handleFilterChange('minBudget', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxBudget || ''}
                      onChange={(e) => handleFilterChange('maxBudget', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
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
                      <span className="capitalize">Remote</span>
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
                      <Link href={`/freelancer/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/freelancer/proposals/create/${job.id}`}>
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
                  variant="primary"
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
    </DashboardLayout>
  );
};

export default BrowseProjectsPage;