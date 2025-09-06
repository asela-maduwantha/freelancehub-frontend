'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  Plus,
  Briefcase,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  AlertCircle,
  FileText,
  Star,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { clientsService, projectsService, IProject } from '@/lib/api';
import { ClientProject } from '@/lib/api/clients.service';
import { ProjectsResponse } from '@/lib/types/api/responses.types';


interface ProjectStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

const ProjectCard: React.FC<{ 
  project: ClientProject; 
  onEdit: (project: ClientProject) => void;
  onDelete: (projectId: string) => void;
}> = ({ project, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <TrendingUp className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'paused': return <AlertCircle className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {project.title}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="ml-1.5 capitalize">{project.status.replace('_', ' ')}</span>
            </span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-600">{project.category}</span>
          </div>
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <Link href={`/client/projects/${project._id}`}>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                </Link>
                <button
                  onClick={() => {
                    onEdit(project);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </button>
                <button
                  onClick={() => {
                    onDelete(project._id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {project.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(project.requiredSkills || []).slice(0, 3).map((skill: any, index: number) => (
          <span
            key={index}
            className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md font-medium"
          >
            {skill.skill}
          </span>
        ))}
        {(project.requiredSkills || []).length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
            +{(project.requiredSkills || []).length - 3} more
          </span>
        )}
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Budget</p>
          <p className="text-sm font-semibold text-gray-900">
            ${project.budget?.toLocaleString() || 'N/A'}
            {project.budgetType && (
              <span className="text-xs text-gray-500 ml-1">
                ({project.budgetType})
              </span>
            )}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Posted</p>
          <p className="text-sm text-gray-900">
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Proposals</p>
          <p className="text-sm font-semibold text-green-600">
            {project.proposals?.length || 0}
          </p>
        </div>
      </div>

      {/* Active Freelancer */}
      {project.freelancer && (
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg mb-4">
          <img
            src="/user.jpg"
            alt={`${project.freelancer.firstName} ${project.freelancer.lastName}`}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {project.freelancer.firstName} {project.freelancer.lastName}
            </p>
            <p className="text-xs text-gray-600">Active Freelancer</p>
          </div>
        </div>
      )}      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href={`/client/projects/${project._id}/proposals`}>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>View Proposals</span>
          </Button>
        </Link>
        
        <Link href={`/client/projects/${project._id}`}>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: any;
  color: string;
}> = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default function ClientProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ClientProject[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadProjects();
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, statusFilter, sortBy]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors

      console.log('Loading projects...');
      const response = await clientsService.getProjects();
      console.log('API Response:', response);

      // Handle different response formats
      let projectsData: any[] = [];

      if (response && typeof response === 'object') {
        // Check if it's the expected ProjectsResponse format
        if ((response as any).data && (response as any).data.projects) {
          projectsData = (response as any).data.projects;
          console.log('Found projects in response.data.projects:', projectsData);
        }
        // Check if it's a direct array response
        else if (Array.isArray(response)) {
          projectsData = response;
          console.log('Found projects as direct array:', projectsData);
        }
        // Check if projects are directly in response
        else if ((response as any).projects) {
          projectsData = (response as any).projects;
          console.log('Found projects in response.projects:', projectsData);
        }
        else {
          console.log('Unexpected response structure:', response);
          throw new Error('Unexpected response format from API');
        }
      } else {
        console.log('Invalid response type:', typeof response);
        throw new Error('Invalid response from API');
      }

      if (projectsData && Array.isArray(projectsData) && projectsData.length > 0) {
        console.log('Processing', projectsData.length, 'projects');

        // Transform API data to match our local Project interface
        const transformedProjects: ClientProject[] = projectsData.map((project: any, index: number) => {
          console.log(`Processing project ${index}:`, project);
          return {
            ...project,
            skills: project.requiredSkills?.map((skill: any) => skill.skill) || [] // Add skills array for backward compatibility
          };
        });

        console.log('Transformed projects:', transformedProjects);
        setProjects(transformedProjects);
        calculateStats(transformedProjects);
      } else {
        console.log('No projects found in response - using fallback data for testing');
        // Temporary fallback for testing - remove this once API is working
        const fallbackProjects: ClientProject[] = [
          {
            _id: 'test-1',
            clientId: 'client-123',
            title: 'Test Project - Web Development',
            description: 'This is a test project to verify the UI is working correctly.',
            category: 'Web Development',
            status: 'open',
            requiredSkills: [
              { skill: 'JavaScript', level: 'intermediate' },
              { skill: 'React', level: 'intermediate' }
            ],
            budget: 1000,
            budgetType: 'fixed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            proposals: [],
            analytics: { views: 10, applications: 2, saves: 1 },
            subcategory: '',
            duration: 'short-term',
            workType: ['remote'],
            experienceLevel: 'intermediate',
            tags: [],
            attachments: [],
            visibility: 'public',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        setProjects(fallbackProjects);
        calculateStats(fallbackProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setError(`Failed to load projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProjects([]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (projectList: ClientProject[]) => {
    const stats: ProjectStats = {
      total: projectList.length,
      open: projectList.filter(p => p.status === 'open').length,
      inProgress: projectList.filter(p => p.status === 'in-progress').length,
      completed: projectList.filter(p => p.status === 'completed').length,
      cancelled: projectList.filter(p => p.status === 'cancelled').length
    };
    setStats(stats);
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.requiredSkills?.some((skill: any) => skill.skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'budget_high':
        filtered.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      case 'budget_low':
        filtered.sort((a, b) => (a.budget || 0) - (b.budget || 0));
        break;
      case 'proposals':
        filtered.sort((a, b) => (b.proposals?.length || 0) - (a.proposals?.length || 0));
        break;
    }

    setFilteredProjects(filtered);
  };

  const handleEditProject = (project: ClientProject) => {
    router.push(`/client/projects/${project._id}/edit`);
  };

  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      // Use the proper API service instead of direct fetch
      const projects = await clientsService.getProjects();
      console.log('Test API response:', projects);
    } catch (error) {
      console.error('Test API connection failed:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsService.deleteProject(projectId);
      // Refresh the projects list after successful deletion
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Projects</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={loadProjects} className="bg-green-600 hover:bg-green-700">
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                console.log('Current state:', { projects, filteredProjects, stats, isLoading, error });
                alert(`Debug Info:\nProjects: ${projects.length}\nFiltered: ${filteredProjects.length}\nStats: ${stats ? 'Available' : 'None'}\nError: ${error}`);
              }}
            >
              Debug Info
            </Button>
            <Button
              variant="outline"
              onClick={testApiConnection}
            >
              Test API
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-2">
            Manage your projects and track their progress
          </p>
        </div>
        <Link href="/client/projects/new">
          <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 mt-4 sm:mt-0">
            <Plus className="h-4 w-4" />
            <span>Post New Project</span>
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Projects"
            value={stats.total}
            icon={Briefcase}
            color="bg-green-500"
          />
          <StatCard
            title="Open Projects"
            value={stats.open}
            icon={Clock}
            color="bg-green-500"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="bg-gray-500"
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={XCircle}
            color="bg-red-500"
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget_high">Highest Budget</option>
              <option value="budget_low">Lowest Budget</option>
              <option value="proposals">Most Proposals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-purple-100 rounded-full mb-6">
            <Briefcase className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            {searchTerm || statusFilter !== 'all' ? 'No matching projects found' : 'No projects yet'}
          </h3>
          <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or filters to find what you\'re looking for'
              : 'Start building your project portfolio by posting your first project and connecting with talented freelancers'
            }
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {!searchTerm && statusFilter === 'all' && (
              <Link href="/client/projects/new">
                <Button className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Post Your First Project
                </Button>
              </Link>
            )}
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSortBy('newest');
                }}
                className="px-6 py-3"
              >
                Clear Filters
              </Button>
            )}
            <Link href="/client/freelancers">
              <Button variant="outline" className="px-6 py-3">
                <Users className="h-4 w-4 mr-2" />
                Browse Freelancers
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
