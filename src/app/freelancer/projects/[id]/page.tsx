'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  DollarSign,
  Clock,
  MapPin,
  Star,
  Users,
  Eye,
  Calendar,
  Tag,
  FileText,
  CheckCircle,
  AlertCircle,
  Bookmark,
  BookmarkPlus,
  Share2,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { projectAPI, authAPI } from '@/lib/api';
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
  attachments: any[];
  postedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [savedProjects, setSavedProjects] = useState<string[]>([]);
  const [projectContract, setProjectContract] = useState<any>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchUser();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      fetchProjectContract();
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectAPI.getProject(projectId);
      setProject(response);
    } catch (err: any) {
      console.error('Failed to fetch project:', err);
      setError(err.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
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

  const fetchProjectContract = async () => {
    if (!project || loadingContract) return;
    
    try {
      setLoadingContract(true);
      const response = await contractAPI.getContracts({ projectId: project._id });
      if (response.contracts && response.contracts.length > 0) {
        setProjectContract(response.contracts[0]);
      }
    } catch (error) {
      console.error('Failed to fetch project contract:', error);
    } finally {
      setLoadingContract(false);
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days left`;
    return formatDate(deadline);
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The project you are looking for does not exist.'}</p>
          <Link
            href="/freelancer/projects"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/freelancer/projects"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-gray-600">Posted by {project.clientId.firstName} {project.clientId.lastName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{project.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              
              {/* Required Skills */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((skillObj) => (
                    <span
                      key={skillObj._id}
                      className={`px-3 py-1 text-sm font-medium rounded-full border ${
                        skillObj.level === 'expert' 
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : skillObj.level === 'intermediate'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}
                    >
                      {skillObj.skill} ({skillObj.level})
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Experience Level</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExperienceLevelColor(project.experienceLevel || 'standard')}`}>
                  {(project.experienceLevel || 'standard').charAt(0).toUpperCase() + (project.experienceLevel || 'standard').slice(1)}
                </span>
              </div>

              {/* Work Type */}
              {project.workType && project.workType.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Work Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.workType.map((type, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attachments */}
            {project.attachments && project.attachments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
                <div className="space-y-2">
                  {project.attachments.map((attachment: any, index: number) => (
                    <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{attachment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
              
              <div className="space-y-4">
                {/* Budget */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>Budget</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatBudget(project.budget, project.budgetType)}</div>
                    <div className="text-sm text-gray-600">{project.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}</div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Duration</span>
                  </div>
                  <span className="font-semibold text-gray-900">{project.duration}</span>
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Posted Date</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatDate(project.postedAt)}</span>
                </div>

                {/* Proposals */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>Proposals</span>
                  </div>
                  <span className="font-semibold text-gray-900">{project.proposals.length}</span>
                </div>

                {/* Views */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Eye className="h-5 w-5 mr-2" />
                    <span>Views</span>
                  </div>
                  <span className="font-semibold text-gray-900">{project.analytics.views}</span>
                </div>

                {/* Posted Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Posted</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatDate(project.createdAt)}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {project.status === 'open' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Open for Proposals
                  </span>
                )}
                {project.experienceLevel && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {project.experienceLevel}
                  </span>
                )}
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {project.clientId.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{project.clientId.firstName} {project.clientId.lastName}</h4>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">4.5</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Client ID:</span>
                  <span className="font-medium">{project.clientId._id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span className="font-medium">Recent</span>
                </div>
              </div>
            </div>

            {/* Contract Information */}
            {project.proposals && project.proposals.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Contract Status
                </h3>
                
                {loadingContract ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Checking contract status...</span>
                  </div>
                ) : projectContract ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        projectContract.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : projectContract.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {projectContract.status === 'active' ? 'Active Contract' : 
                         projectContract.status === 'pending' ? 'Pending Approval' : 
                         'Contract Created'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Budget:</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${projectContract.terms?.budget?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <Link
                        href={`/freelancer/contracts/${projectContract._id}`}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium text-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Contract
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">You have submitted a proposal for this project</p>
                    <p className="text-xs text-gray-500 mt-1">Contract will be created once accepted</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-3">
                <Link
                  href={`/freelancer/projects/${project._id}/propose`}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Submit Proposal
                </Link>
                
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium">
                  <Users className="h-5 w-5 mr-2" />
                  Contact Client
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
