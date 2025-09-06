'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  AlertCircle,
  FileText,
  Star,
  AlertTriangle,
  Briefcase,
  Globe,
  Tag,
  Paperclip,
  User
} from 'lucide-react';
import Link from 'next/link';
import { clientsService } from '@/lib/api';
import { ClientProject } from '@/lib/api/clients.service';

const ProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ClientProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading project:', projectId);
      const projectData = await clientsService.getProjectById(projectId);
      console.log('Project data:', projectData);

      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
      setError(`Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
      case 'open': return <Clock className="h-5 w-5" />;
      case 'in-progress': return <TrendingUp className="h-5 w-5" />;
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      case 'paused': return <AlertCircle className="h-5 w-5" />;
      case 'draft': return <FileText className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        // Note: We'll need to implement this in the projectsService
        // await projectsService.deleteProject(project._id);
        alert('Delete functionality will be implemented when the API endpoint is available');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error ? 'Error Loading Project' : 'Project Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'The project you are looking for does not exist or has been removed.'}
          </p>
          <div className="space-x-2">
            <Button onClick={() => router.push('/client/projects')} className="bg-green-600 hover:bg-green-700">
              Back to Projects
            </Button>
            <Button onClick={loadProject} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/client/projects')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                <span className="ml-2 capitalize">{project.status.replace('_', ' ')}</span>
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">{project.category}</span>
              {project.subcategory && (
                <>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{project.subcategory}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link href={`/client/projects/${project._id}/edit`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit Project</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDeleteProject}
            className="flex items-center space-x-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </motion.div>

          {/* Required Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-3">
              {project.requiredSkills?.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg"
                >
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">{skill.skill}</span>
                  <span className="text-xs bg-green-100 px-2 py-1 rounded capitalize">
                    {skill.level}
                  </span>
                </div>
              )) || (
                <p className="text-gray-500">No specific skills required</p>
              )}
            </div>
          </motion.div>

          {/* Project Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Budget</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${project.budget?.toLocaleString() || 'N/A'}
                    {project.budgetType && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({project.budgetType})
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {project.duration || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Experience Level</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {project.experienceLevel || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Work Type</p>
                  <div className="flex flex-wrap gap-2">
                    {project.workType?.map((type, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        {type}
                      </span>
                    )) || (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Posted Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Visibility</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {project.visibility || 'Public'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Attachments */}
          {project.attachments && project.attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
              <div className="space-y-3">
                {project.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Paperclip className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {attachment.split('/').pop() || 'Attachment'}
                      </p>
                      <p className="text-xs text-gray-500">Click to download</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Views</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {project.analytics?.views || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Proposals</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {project.proposals?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Saves</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {project.analytics?.saves || 0}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Active Freelancer */}
          {project.freelancer && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Freelancer</h3>
              <div className="flex items-center space-x-4">
                <img
                  src="/user.jpg"
                  alt={`${project.freelancer.firstName} ${project.freelancer.lastName}`}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {project.freelancer.firstName} {project.freelancer.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Assigned to this project</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button size="sm" className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" className="w-full" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href={`/client/projects/${project._id}/proposals`}>
                <Button size="sm" className="w-full flex items-center justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Proposals ({project.proposals?.length || 0})
                </Button>
              </Link>

              <Link href={`/client/projects/${project._id}/messages`}>
                <Button size="sm" variant="outline" className="w-full flex items-center justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </Link>

              <Link href={`/client/projects/${project._id}/milestones`}>
                <Button size="sm" variant="outline" className="w-full flex items-center justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Milestones
                </Button>
              </Link>

              <Link href={`/client/projects/${project._id}/payments`}>
                <Button size="sm" variant="outline" className="w-full flex items-center justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payments
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
