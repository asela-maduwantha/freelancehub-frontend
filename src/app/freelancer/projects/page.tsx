'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Star,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  Award,
  Heart,
  Eye,
  Calendar,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { projectsService } from '@/lib/api';

interface Project {
  id: string;
  title: string;
  description: string;
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  skills: string[];
  client: {
    id: string;
    name: string;
    rating: number;
    totalSpent: number;
    location: {
      country: string;
    };
    paymentVerified: boolean;
  };
  status: string;
  postedDate: string;
  proposalCount: number;
  category: string;
  duration: string;
  experience: 'beginner' | 'intermediate' | 'expert';
  bookmarked?: boolean;
}

interface Filters {
  search: string;
  category: string;
  minBudget: number;
  maxBudget: number;
  projectType: string;
  experience: string;
  skills: string[];
  datePosted: string;
}

const categories = [
  'Web Development',
  'Mobile Development',
  'Design & Creative',
  'Writing & Translation',
  'Digital Marketing',
  'Data Science',
  'Video & Animation',
  'Music & Audio',
  'Programming & Tech'
];

const experienceLevels = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];

const dateFilters = [
  { value: '', label: 'Anytime' },
  { value: 'today', label: 'Last 24 hours' },
  { value: 'week', label: 'Last week' },
  { value: 'month', label: 'Last month' }
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [bookmarkedProjects, setBookmarkedProjects] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    minBudget: 0,
    maxBudget: 10000,
    projectType: '',
    experience: '',
    skills: [],
    datePosted: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    hasNext: false
  });

  useEffect(() => {
    loadProjects();
  }, [filters, pagination.page]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        status: ['open' as const],
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.minBudget && { minBudget: filters.minBudget }),
        ...(filters.maxBudget && { maxBudget: filters.maxBudget }),
        ...(filters.projectType && { projectType: filters.projectType }),
        ...(filters.experience && { experience: filters.experience }),
        ...(filters.skills.length && { skills: filters.skills }),
        ...(filters.datePosted && { datePosted: filters.datePosted })
      };

      const response = await projectsService.getProjects(queryParams);
      
      // Handle both possible response structures
      const projects = (response as any).projects || response.data || [];
      const paginationInfo = response.pagination;
      
      console.log('Projects loaded:', { projects, paginationInfo, response });
      
      if (projects.length >= 0) {
        try {
          const projectsWithMockData = projects
            .filter((project: any) => project && project._id) // Filter out null/undefined projects
            .map((project: any) => {
              try {
                return {
                  ...project,
                  id: project._id, // Map _id to id for consistency
                  client: {
                    id: project.clientId?._id || 'mock-client',
                    name: `${project.clientId?.firstName || 'Client'} ${project.clientId?.lastName || ''}`.trim() || 'Anonymous Client',
                    rating: Number(project.clientId?.rating) || 4.5 + Math.random() * 0.5,
                    totalSpent: Number(project.clientId?.totalSpent) || Math.floor(Math.random() * 50000) + 10000,
                    location: {
                      country: project.clientId?.location?.country || 'United States'
                    },
                    paymentVerified: Boolean(project.clientId?.paymentVerified) || Math.random() > 0.3
                  },
                  budget: {
                    amount: Number(project.budget) || 0,
                    currency: 'USD',
                    type: project.budgetType === 'hourly' ? 'hourly' : 'fixed'
                  },
                  skills: project.requiredSkills?.map((skill: any) => {
                    if (typeof skill === 'string') return skill;
                    if (typeof skill === 'object' && skill.name) return skill.name;
                    return ''; // fallback for invalid skills
                  }).filter(Boolean) || [],
                  proposalCount: Number(project.proposals?.length) || Math.floor(Math.random() * 20) + 1,
                  bookmarked: bookmarkedProjects.includes(project._id),
                  postedDate: project.createdAt || project.postedAt || new Date().toISOString(),
                  experience: project.experienceLevel || 'intermediate',
                  category: project.category || 'Other',
                  duration: project.duration || 'Not specified',
                  status: project.status || 'open'
                };
              } catch (projectError) {
                console.error('Error mapping project:', projectError, project);
                return null;
              }
            })
            .filter(Boolean); // Remove any null results from failed mappings

          setProjects(projectsWithMockData);
        } catch (mappingError) {
          console.error('Error processing projects:', mappingError);
          setError('Error processing project data');
        }
        setPagination(prev => ({
          ...prev,
          total: paginationInfo?.total || projects.length,
          hasNext: paginationInfo ? paginationInfo.page < paginationInfo.pages : false
        }));
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Failed to load projects. Please try again.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBookmark = (projectId: string) => {
    setBookmarkedProjects(prev => {
      const newBookmarks = prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId];
      
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, bookmarked: !p.bookmarked } : p
      ));
      
      return newBookmarks;
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minBudget: 0,
      maxBudget: 10000,
      projectType: '',
      experience: '',
      skills: [],
      datePosted: ''
    });
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently posted';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently posted';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Posted today';
    if (diffDays <= 7) return `Posted ${diffDays} days ago`;
    return `Posted ${date.toLocaleDateString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gray-900 font-poppins">
          Find Your Next Project
        </h1>
        <p className="text-lg text-gray-600 font-inter">
          Discover amazing opportunities that match your skills
        </p>
      </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, skills, or keywords..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={filters.experience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
              >
                {experienceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>More Filters</span>
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minBudget}
                      onChange={(e) => handleFilterChange('minBudget', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxBudget}
                      onChange={(e) => handleFilterChange('maxBudget', parseInt(e.target.value) || 10000)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <select
                    value={filters.projectType}
                    onChange={(e) => handleFilterChange('projectType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posted
                  </label>
                  <select
                    value={filters.datePosted}
                    onChange={(e) => handleFilterChange('datePosted', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {dateFilters.map(filter => (
                      <option key={filter.value} value={filter.value}>{filter.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600 font-inter">
              {pagination.total} projects found
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option>Newest</option>
              <option>Budget: High to Low</option>
              <option>Budget: Low to High</option>
              <option>Proposals: Fewest First</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading projects..." />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No projects found"
            description="Try adjusting your search criteria or filters to find more projects"
            action={{
              label: 'Clear Filters',
              onClick: clearFilters,
              variant: 'outline'
            }}
          />
        ) : (
          <div className="space-y-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Link href={`/freelancer/projects/${project.id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-green-600 transition-colors font-poppins">
                          {project.title}
                        </h3>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleBookmark(project.id)}
                        className={project.bookmarked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}
                      >
                        <Heart className={`h-5 w-5 ${project.bookmarked ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 font-inter">
                      {project.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.slice(0, 5).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          +{project.skills.length - 5} more
                        </span>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-semibold text-gray-900">
                          {project.budget.type === 'fixed' 
                            ? formatCurrency(project.budget.amount) 
                            : `${formatCurrency(project.budget.amount)}/hr`
                          }
                        </span>
                        <span className="ml-1">
                          {project.budget.type === 'fixed' ? 'Fixed Price' : 'Hourly'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{project.proposalCount} proposals</span>
                      </div>

                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        <span className="capitalize">{project.experience} level</span>
                      </div>

                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDate(project.postedDate)}</span>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{project.client.location.country}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-gray-600">{project.client.rating.toFixed(1)}</span>
                        </div>

                        <div className="text-sm text-gray-600">
                          {formatCurrency(project.client.totalSpent)} spent
                        </div>

                        {project.client.paymentVerified && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Payment verified</span>
                          </div>
                        )}
                      </div>

                      <Link href={`/freelancer/projects/${project.id}`}>
                        <Button variant="premium" className="font-poppins">
                          View Project
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex justify-center items-center space-x-4 py-8">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                
                <Button
                  variant="outline"
                  disabled={!pagination.hasNext}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
