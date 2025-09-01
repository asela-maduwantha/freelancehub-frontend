'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
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
  Search
} from 'lucide-react';
import Link from 'next/link';
import { clientAPI } from '@/lib/api';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  requiredSkills: string[];
  proposalCount: number;
  createdAt: string;
  deadline?: string;
  freelancer?: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface ProjectStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export default function ClientProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    applyFilters();
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = async () => {
    try {
      // Try to load real data from API
      try {
        const response = await clientAPI.getProjects();
        setProjects(response.data || []);
        calculateStats(response.data || []);
      } catch (apiError) {
        console.log('API not available, using mock data');
        // Mock data for demonstration
        const mockProjects: Project[] = [
          {
            id: '1',
            title: 'Build E-commerce Website',
            description: 'Need a full-stack developer for an online store with payment integration',
            status: 'open',
            budget: { amount: 2500, currency: 'USD', type: 'fixed' },
            requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
            proposalCount: 12,
            createdAt: '2024-01-15T10:00:00Z',
            deadline: '2024-02-15T10:00:00Z'
          },
          {
            id: '2',
            title: 'Mobile App UI Design',
            description: 'Design modern UI/UX for a fitness tracking mobile application',
            status: 'in_progress',
            budget: { amount: 1200, currency: 'USD', type: 'fixed' },
            requiredSkills: ['UI/UX Design', 'Figma', 'Mobile Design'],
            proposalCount: 8,
            createdAt: '2024-01-10T14:30:00Z',
            deadline: '2024-02-10T14:30:00Z',
            freelancer: {
              id: '1',
              name: 'Sarah Designer',
              avatar: '/user.jpg'
            }
          },
          {
            id: '3',
            title: 'Content Writing for Blog',
            description: 'Write 10 SEO-optimized blog posts about digital marketing',
            status: 'completed',
            budget: { amount: 800, currency: 'USD', type: 'fixed' },
            requiredSkills: ['Content Writing', 'SEO', 'Blogging'],
            proposalCount: 15,
            createdAt: '2024-01-05T09:15:00Z',
            freelancer: {
              id: '2',
              name: 'Mike Writer',
              avatar: '/user.jpg'
            }
          }
        ];
        setProjects(mockProjects);
        calculateStats(mockProjects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (projectsList: Project[]) => {
    const stats = {
      total: projectsList.length,
      open: projectsList.filter(p => p.status === 'open').length,
      inProgress: projectsList.filter(p => p.status === 'in_progress').length,
      completed: projectsList.filter(p => p.status === 'completed').length,
      cancelled: projectsList.filter(p => p.status === 'cancelled').length
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = projects;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Eye className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <Link
              href="/client/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
              My Projects
            </h1>
            <p className="text-gray-600 font-inter">
              Manage your projects and track their progress
            </p>
          </div>
          <Link href="/client/projects/new">
            <Button variant="premium" className="mt-4 lg:mt-0 font-poppins">
              <Plus className="h-4 w-4 mr-2" />
              Post New Project
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          project.status === 'completed' ? 'bg-green-100' :
                          project.status === 'in_progress' ? 'bg-yellow-100' :
                          project.status === 'open' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {getStatusIcon(project.status)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 font-poppins">
                              {project.title}
                            </h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {project.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span className="font-medium text-gray-900">
                                  ${project.budget.amount} {project.budget.type === 'hourly' ? '/hr' : ''}
                                </span>
                              </div>

                              <div className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                <span>{project.proposalCount} proposals</span>
                              </div>

                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Created {formatDate(project.createdAt)}</span>
                              </div>

                              {project.deadline && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>Due {formatDate(project.deadline)}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.requiredSkills.slice(0, 5).map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                              {project.requiredSkills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  +{project.requiredSkills.length - 5} more
                                </span>
                              )}
                            </div>

                            {project.freelancer && (
                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {project.freelancer.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Assigned to {project.freelancer.name}
                                  </p>
                                  <p className="text-xs text-gray-500">Freelancer</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3 ml-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
                    </span>

                    <div className="flex space-x-2">
                      <Link href={`/client/projects/${project.id}`}>
                        <Button variant="outline" size="sm" className="font-inter">
                          View Details
                        </Button>
                      </Link>

                      {project.status === 'open' && (
                        <Link href={`/client/projects/${project.id}/proposals`}>
                          <Button variant="premium" size="sm" className="font-inter">
                            View Proposals ({project.proposalCount})
                          </Button>
                        </Link>
                      )}

                      {project.status === 'in_progress' && (
                        <Link href={`/client/contracts/${project.id}`}>
                          <Button variant="premium" size="sm" className="font-inter">
                            Manage Contract
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by posting your first project'
                }
              </p>
              <Link href="/client/projects/new">
                <Button variant="premium" className="font-poppins">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
