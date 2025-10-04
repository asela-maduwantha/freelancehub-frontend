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
  SlidersHorizontal,
  Bookmark,
  Grid3X3,
  List,
  LayoutGrid
} from 'lucide-react';

// New Components
import HeroSection from '../../../../components/features/landing/HeroSection';
import FeaturedJobsSection from '../../../../components/features/jobs/FeaturedJobsSection';
import RecentJobsSection from '../../../../components/features/jobs/RecentJobsSection';

// UI Components
import { Modal } from '../../../../components/ui/Modal';

// Hooks
import { useSavedJobs } from '../../../../lib/hooks/useSavedJobs';

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
  { value: 'fixed-price', label: 'Fixed Price' }
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'budget-high', label: 'Highest Budget' },
  { value: 'budget-low', label: 'Lowest Budget' },
  { value: 'proposals-low', label: 'Least Competitive' }
];

const VIEW_MODES = [
  { value: 'grid', label: 'Grid', icon: Grid3X3 },
  { value: 'list', label: 'List', icon: List },
  { value: 'compact', label: 'Compact', icon: LayoutGrid }
];

const BrowseProjectsPage: React.FC = () => {
  const { isJobSaved, toggleSaveJob, isLoading: isSavingLoading, savedJobs } = useSavedJobs();
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

  // New state for enhanced features
  const [stats, setStats] = useState<{
    totalProjects: number;
    projectsToday: number;
    avgBudget: number;
  } | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');

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

  const fetchStats = async () => {
    try {
      const response = await jobService.getJobStats();
      setStats({
        totalProjects: response.totalProjects,
        projectsToday: response.projectsToday,
        avgBudget: response.avgBudget
      });
      // Set search suggestions from top skills
      setSearchSuggestions(response.topSkills || []);
    } catch (err: any) {
      console.error('Failed to load stats (API not available):', err);
      // Don't set fallback stats - keep as null so stats section doesn't show
      setStats(null);
      setSearchSuggestions([]);
    }
  };

  const loadRecentSearches = () => {
    const searches = localStorage.getItem('recentJobSearches');
    if (searches) {
      try {
        setRecentSearches(JSON.parse(searches));
      } catch (err) {
        console.error('Failed to parse recent searches:', err);
      }
    }
  };

  const loadViewModePreference = () => {
    const saved = localStorage.getItem('jobViewMode');
    if (saved && ['grid', 'list', 'compact'].includes(saved)) {
      setViewMode(saved as 'grid' | 'list' | 'compact');
    }
  };

  const saveViewModePreference = (mode: 'grid' | 'list' | 'compact') => {
    localStorage.setItem('jobViewMode', mode);
    setViewMode(mode);
  };

  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return;

    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentJobSearches', JSON.stringify(updated));
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
          // fetchStats() - API endpoint not available, stats will be hidden
        ]);
        loadRecentSearches();
        loadViewModePreference();
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Filter jobs when showSavedOnly changes
  useEffect(() => {
    if (showSavedOnly && jobs.length > 0) {
      const savedJobIds = savedJobs.map(job => job.id);
      const filteredJobs = jobs.filter(job => savedJobIds.includes(job.id));
      setJobs(filteredJobs);
      setTotalPages(1);
      setTotal(filteredJobs.length);
    } else if (!showSavedOnly) {
      // Re-fetch all jobs when switching back from saved only
      fetchJobs(1, searchTerm, filters, sortBy);
    }
  }, [showSavedOnly, savedJobs]);

  const handleSearch = () => {
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch) {
      saveRecentSearch(trimmedSearch);
    }

    const searchFilters = { ...filters };
    if (trimmedSearch) {
      searchFilters.search = trimmedSearch;
    } else {
      delete searchFilters.search;
    }
    setFilters(searchFilters);
    fetchJobs(1, trimmedSearch, searchFilters, sortBy);
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

  const handleQuickFilter = (filterType: string) => {
    const newFilters = { ...filters };

    // Clear existing quick filters
    delete newFilters.minBudget;
    delete newFilters.maxBudget;
    delete newFilters.isUrgent;
    delete newFilters.isFeatured;
    delete newFilters.maxProposals;
    delete newFilters.search;

    switch (filterType) {
      case 'new-today':
        newFilters.search = 'new-today';
        break;
      case 'high-budget':
        newFilters.minBudget = 5000;
        break;
      case 'few-proposals':
        newFilters.maxProposals = 5;
        break;
      case 'urgent':
        newFilters.isUrgent = true;
        break;
      case 'featured':
        newFilters.isFeatured = true;
        break;
    }

    setFilters(newFilters);
    fetchJobs(1, searchTerm, newFilters, sortBy);
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
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <HeroSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          stats={stats || undefined}
          recentSearches={recentSearches}
          suggestions={searchSuggestions}
          isLoading={isLoading}
        />

        <div className="max-w-7xl mx-auto px-6 pb-12">
          {/* Featured Jobs Section */}
          <FeaturedJobsSection
            jobs={featuredJobs}
            isLoading={isLoadingFeatured}
          />

          {/* Recent Jobs Section */}
          <RecentJobsSection
            jobs={recentJobs}
            isLoading={isLoadingRecent}
          />

          {/* Quick Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleQuickFilter('new-today')}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  filters.search === 'new-today'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                New Today
              </button>
              <button
                onClick={() => handleQuickFilter('high-budget')}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  filters.minBudget === 5000
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                High Budget
              </button>
              <button
                onClick={() => handleQuickFilter('few-proposals')}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  filters.maxProposals === 5
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                Few Proposals
              </button>
              <button
                onClick={() => handleQuickFilter('urgent')}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  filters.isUrgent === true
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Urgent
              </button>
              <button
                onClick={() => handleQuickFilter('featured')}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  filters.isFeatured === true
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                Featured
              </button>
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  showSavedOnly
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Bookmark className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Saved ({savedJobs.length})
              </button>
            </div>

            {/* Sort and Advanced Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">View:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {VIEW_MODES.map(mode => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.value}
                          onClick={() => saveViewModePreference(mode.value as 'grid' | 'list' | 'compact')}
                          className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            viewMode === mode.value
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title={mode.label}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced Filters
                {Object.keys(filters).length > 1 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {Object.keys(filters).length - 1}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel - Desktop */}
          {showFilters && (
            <div className="hidden md:block bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxBudget || ''}
                      onChange={(e) => handleFilterChange('maxBudget', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setFilters({ status: 'open' });
                    setSortBy('relevance');
                    fetchJobs(1, searchTerm, { status: 'open' }, 'relevance');
                  }}
                  variant="outline"
                  className="mr-3"
                >
                  Clear All Filters
                </Button>
                <Button
                  onClick={() => {
                    setShowFilters(false);
                    fetchJobs(1, searchTerm, filters, sortBy);
                  }}
                  variant="primary"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Advanced Filters Modal - Mobile */}
          <Modal
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            title="Advanced Filters"
            size="lg"
            className="md:hidden"
          >
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxBudget || ''}
                    onChange={(e) => handleFilterChange('maxBudget', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setFilters({ status: 'open' });
                  setSortBy('relevance');
                  fetchJobs(1, searchTerm, { status: 'open' }, 'relevance');
                  setShowFilters(false);
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
              <Button
                onClick={() => {
                  setShowFilters(false);
                  fetchJobs(1, searchTerm, filters, sortBy);
                }}
                variant="primary"
              >
                Apply Filters
              </Button>
            </div>
          </Modal>

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
            <div className={`mb-8 ${
              viewMode === 'grid'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                : viewMode === 'list'
                ? 'space-y-4'
                : 'grid grid-cols-1 gap-3'
            }`}>
              {jobs.map((job) => (
                <div key={job.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                  viewMode === 'grid'
                    ? 'p-6'
                    : viewMode === 'list'
                    ? 'p-6'
                    : 'p-4'
                }`}>
                  {/* Job Header */}
                  <div className={`flex items-start justify-between ${
                    viewMode === 'list' ? 'mb-3' : 'mb-4'
                  }`}>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-gray-900 line-clamp-2 ${
                        viewMode === 'grid'
                          ? 'text-lg mb-2'
                          : viewMode === 'list'
                          ? 'text-lg mb-2'
                          : 'text-base mb-1'
                      }`}>
                        {job.title}
                      </h3>
                      <div className={`flex items-center space-x-4 text-sm text-gray-600 ${
                        viewMode === 'compact' ? 'mb-2' : 'mb-3'
                      }`}>
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
                  {viewMode !== 'compact' && (
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {job.description}
                    </p>
                  )}

                  {/* Job Details */}
                  <div className={`mb-4 text-sm ${
                    viewMode === 'list'
                      ? 'flex flex-wrap gap-6'
                      : 'grid grid-cols-2 gap-4'
                  }`}>
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
                  {viewMode !== 'compact' && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, viewMode === 'list' ? 6 : 4).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > (viewMode === 'list' ? 6 : 4) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            +{job.skills.length - (viewMode === 'list' ? 6 : 4)} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

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
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSaveJob({ id: job.id, title: job.title });
                        }}
                        disabled={isSavingLoading}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isJobSaved(job.id)
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={isJobSaved(job.id) ? 'Remove from saved jobs' : 'Save job'}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${isJobSaved(job.id) ? 'fill-current' : ''}`}
                        />
                      </button>
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
      </div>
    </DashboardLayout>
  );
};

export default BrowseProjectsPage;