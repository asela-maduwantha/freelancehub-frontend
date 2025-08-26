'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  Users, 
  Calendar,
  Bookmark,
  BookmarkCheck,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { projectApi, ProjectFilters } from '@/lib/api/projects';
import { skillsApi } from '@/lib/api/skills';
import { categoryApi } from '@/lib/api/categories';

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: Date;
  status: string;
  skillsRequired: string[];
  isUrgent: boolean;
  createdAt: Date;
  client?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    rating: number;
    location?: string;
    projectsPosted?: number;
  };
  category?: {
    _id: string;
    name: string;
  };
  proposalCount?: number;
}

export function ProjectBrowser() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 12,
    status: 'open'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [savedProjects, setSavedProjects] = useState<Set<string>>(new Set());
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      // Use Promise.allSettled to handle individual API failures gracefully
      const [skillsResult, categoriesResult] = await Promise.allSettled([
        skillsApi.getAllSkills(),
        categoryApi.getCategories()
      ]);

      // Extract values with fallbacks for failed calls
      const skillsData = skillsResult.status === 'fulfilled' ? skillsResult.value : null;
      const categoriesData = categoriesResult.status === 'fulfilled' ? categoriesResult.value : null;

      // Log any failures for debugging
      if (skillsResult.status === 'rejected') {
        console.error('Failed to load skills:', skillsResult.reason);
      }
      if (categoriesResult.status === 'rejected') {
        console.error('Failed to load categories:', categoriesResult.reason);
      }

      setSkills(skillsData || []);
      setCategories(categoriesData?.categories || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectApi.getProjects(filters);
      setProjects(response.projects || []);
      setTotalProjects(response.total || 0);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSaveProject = (projectId: string) => {
    setSavedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
    // TODO: Implement save/unsave project API call
  };

  const formatBudget = (budget: Project['budget']) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: budget.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    if (budget.min === budget.max) {
      return formatter.format(budget.min);
    }
    return `${formatter.format(budget.min)} - ${formatter.format(budget.max)}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getCompetitionLevel = (proposalCount: number = 0) => {
    if (proposalCount < 5) return { level: 'Low', color: 'bg-green-100 text-green-800' };
    if (proposalCount < 15) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'High', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">Newest First</option>
                <option value="budget">Budget</option>
                <option value="deadline">Deadline</option>
                <option value="proposalCount">Competition</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          {totalProjects} projects found
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bookmark className="w-4 h-4 mr-2" />
            Saved Projects
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 h-48 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const competition = getCompetitionLevel(project.proposalCount);
            const isSaved = savedProjects.has(project._id);

            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium">{formatBudget(project.budget)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(project.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveProject(project._id)}
                        className="text-gray-400 hover:text-yellow-500"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </Button>
                    </div>

                    {/* Project Description */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    {/* Skills Required */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.skillsRequired.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {project.skillsRequired.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.skillsRequired.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Client Info */}
                    {project.client && (
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={project.client.profilePicture || '/api/placeholder/32/32'}
                          alt={`${project.client.firstName} ${project.client.lastName}`}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {project.client.firstName} {project.client.lastName}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              <span>{project.client.rating.toFixed(1)}</span>
                            </div>
                            {project.client.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{project.client.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Competition and Urgency */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {project.proposalCount || 0} proposals
                        </span>
                        <Badge className={`text-xs ${competition.color}`}>
                          {competition.level}
                        </Badge>
                      </div>
                      {project.isUrgent && (
                        <Badge variant="warning" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        Submit Proposal
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalProjects > (filters.limit || 12) && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                setFilters(prev => ({ ...prev, page: newPage }));
              }}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-600">
              Page {currentPage} of {Math.ceil(totalProjects / (filters.limit || 12))}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= Math.ceil(totalProjects / (filters.limit || 12))}
              onClick={() => {
                const newPage = currentPage + 1;
                setCurrentPage(newPage);
                setFilters(prev => ({ ...prev, page: newPage }));
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search filters or check back later for new opportunities.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilters({ page: 1, limit: 12, status: 'open' });
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
