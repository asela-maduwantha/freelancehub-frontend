'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star,
  Eye,
  Users,
  Calendar,
  Tag,
  ArrowRight,
  Bookmark,
  BookmarkPlus,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { projectAPI } from '@/lib/api';
import { contractAPI } from '@/lib/api';

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  requiredSkills: Array<{
    skill: string;
    level: string;
    _id: string;
  }>;
  budgetType: 'fixed' | 'hourly';
  budget: number;
  duration: string;
  workType?: string[];
  experienceLevel?: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  status: string;
  analytics: {
    views: number;
    applications: number;
    saves: number;
  };
  proposals: any[];
  postedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFilters {
  search?: string;
  category?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  projectType?: 'fixed' | 'hourly';
  experienceLevel?: string;
  postedWithin?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featuredOnly?: boolean;
  urgentOnly?: boolean;
}

const categories = [
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'design', name: 'Design', icon: '🎨' },
  { id: 'writing', name: 'Writing', icon: '✍️' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'consulting', name: 'Consulting', icon: '🤝' },
];

const popularSkills = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB',
  'AWS', 'Docker', 'UI/UX', 'Graphic Design', 'Content Writing', 'SEO',
  'Social Media', 'Data Analysis', 'Machine Learning', 'WordPress'
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 12,
    sort: 'newest'
  });
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [savedProjects, setSavedProjects] = useState<string[]>([]);
  const [projectContracts, setProjectContracts] = useState<{[key: string]: any}>({});
  const [loadingContracts, setLoadingContracts] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  useEffect(() => {
    // Fetch contracts for projects that have proposals submitted
    projects.forEach(project => {
      if (project.proposals && project.proposals.length > 0) {
        fetchProjectContracts(project._id);
      }
    });
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectAPI.getProjects(filters);
      setProjects(response.projects || []);
      setTotalProjects(response.pagination?.total || 0);
      setTotalPages(Math.ceil((response.pagination?.total || 0) / (filters.limit || 12)));
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => {
      const newSkills = prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill];
      
      setFilters(prevFilters => ({
        ...prevFilters,
        skills: newSkills,
        page: 1
      }));
      
      return newSkills;
    });
  };

  const handleSaveProject = (projectId: string) => {
    setSavedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const fetchProjectContracts = async (projectId: string) => {
    if (projectContracts[projectId] || loadingContracts[projectId]) return;
    
    try {
      setLoadingContracts(prev => ({ ...prev, [projectId]: true }));
      // Get contracts for this project
      const response = await contractAPI.getContracts({ projectId });
      if (response.contracts && response.contracts.length > 0) {
        setProjectContracts(prev => ({ ...prev, [projectId]: response.contracts[0] }));
      }
    } catch (error) {
      console.error('Failed to fetch project contracts:', error);
    } finally {
      setLoadingContracts(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const formatBudget = (budget: number, budgetType: string) => {
    if (budgetType === 'fixed') {
      return `$${budget.toLocaleString()}`;
    } else {
      return `$${budget}/hr`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || '📋';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Work</h1>
              <p className="mt-2 text-gray-600">
                Discover projects that match your skills and expertise
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Link
                href="/freelancer/proposals"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                My Proposals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search projects by title, description, or skills..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t pt-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.projectType || ''}
                    onChange={(e) => handleFilterChange('projectType', e.target.value || undefined)}
                  >
                    <option value="">All Types</option>
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.minBudget || ''}
                      onChange={(e) => handleFilterChange('minBudget', e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.maxBudget || ''}
                      onChange={(e) => handleFilterChange('maxBudget', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.sort || 'newest'}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="budget_high">Highest Budget</option>
                    <option value="budget_low">Lowest Budget</option>
                    <option value="relevance">Most Relevant</option>
                  </select>
                </div>
              </div>

              {/* Skills Filter */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Required Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div className="mt-6 flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={filters.featuredOnly || false}
                    onChange={(e) => handleFilterChange('featuredOnly', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={filters.urgentOnly || false}
                    onChange={(e) => handleFilterChange('urgentOnly', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Urgent Only</span>
                </label>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${totalProjects} projects found`}
          </p>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCategoryIcon(project.category)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {project.category.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveProject(project._id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {savedProjects.includes(project._id) ? (
                        <Bookmark className="h-5 w-5 fill-current" />
                      ) : (
                        <BookmarkPlus className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Project Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.requiredSkills.slice(0, 3).map((skillObj) => (
                      <span
                        key={skillObj._id}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {skillObj.skill}
                      </span>
                    ))}
                    {project.requiredSkills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                        +{project.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="font-medium">{formatBudget(project.budget, project.budgetType)}</span>
                      {project.budgetType === 'fixed' && (
                        <span className="ml-1">Fixed Price</span>
                      )}
                      {project.budgetType === 'hourly' && (
                        <span className="ml-1">per hour</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{project.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{project.proposals.length} proposals</span>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {project.clientId.firstName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project.clientId.firstName} {project.clientId.lastName}</p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">4.5</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(project.postedAt)}
                    </div>
                  </div>

                  {/* Contract Status */}
                  {project.proposals && project.proposals.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">Contract Status</span>
                        </div>
                        {projectContracts[project._id] ? (
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              projectContracts[project._id].status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : projectContracts[project._id].status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {projectContracts[project._id].status === 'active' ? 'Active Contract' : 
                               projectContracts[project._id].status === 'pending' ? 'Pending Approval' : 
                               'Contract Created'}
                            </span>
                            <Link
                              href={`/freelancer/contracts/${projectContracts[project._id]._id}`}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              View Contract
                            </Link>
                          </div>
                        ) : loadingContracts[project._id] ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                            <span className="text-xs text-gray-600">Checking contracts...</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600">Proposal submitted</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/freelancer/projects/${project._id}`}
                      className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/freelancer/projects/${project._id}/propose`}
                      className="flex-1 bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                    >
                      Submit Proposal
                    </Link>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 mt-3">
                    {project.status === 'open' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Open
                      </span>
                    )}
                    {project.experienceLevel && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {project.experienceLevel}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more projects.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                disabled={filters.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                const isCurrent = page === filters.page;
                
                return (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handleFilterChange('page', Math.min(totalPages, (filters.page || 1) + 1))}
                disabled={filters.page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
