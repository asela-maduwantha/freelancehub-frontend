'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Button from '../../../../components/ui/Button/Button';
import Loader from '../../../../components/ui/Feedback/Loader';
import { Alert } from '../../../../components/ui/Feedback';
import { jobService, JobResponse } from '../../../../lib/api/jobs';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  Briefcase,
  Star,
  Eye,
  Edit,
  Trash2,
  Users
} from 'lucide-react';

const JobDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;

      try {
        setIsLoading(true);
        setError(null);
        const jobData = await jobService.getJob(jobId);
        setJob(jobData);
      } catch (err: any) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleDeleteJob = async () => {
    if (!job || !confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await jobService.deleteJob(job.id);
      router.push('/dashboard/client');
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
    }
  };

  const formatBudget = (budget: JobResponse['budget']) => {
    const { type, min, max, currency = 'USD' } = budget;
    
    if (type === 'range' && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
    }
    return `$${min.toLocaleString()} ${currency}`;
  };

  const formatDuration = (duration?: JobResponse['duration']) => {
    if (!duration) return 'Not specified';
    
    const typeLabels = {
      'less-than-1-month': 'Less than 1 month',
      '1-3-months': '1-3 months',
      '3-6-months': '3-6 months',
      'more-than-6-months': 'More than 6 months'
    };
    
    let result = typeLabels[duration.type] || duration.type;
    if (duration.estimatedHours) {
      result += ` (${duration.estimatedHours} hours estimated)`;
    }
    return result;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="client" userName="Client Name">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="client" userName="Client Name">
        <div className="max-w-4xl mx-auto p-6">
          <Alert type="error" message={error} />
          <div className="mt-4">
            <Link href="/dashboard/client">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout userRole="client" userName="Client Name">
        <div className="max-w-4xl mx-auto p-6">
          <Alert type="error" message="Job not found" />
          <div className="mt-4">
            <Link href="/dashboard/client">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client" userName="Client Name">
      <div className="flex-1">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/dashboard/client">
              <button className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-3 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {job.proposalCount} proposals
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/jobs/${job.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteJob}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Job Description
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              </div>

              {/* Skills Required */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              {job.attachments && job.attachments.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
                  <div className="space-y-2">
                    {job.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{attachment.filename}</p>
                          <p className="text-sm text-gray-600">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-800"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Details */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Budget
                    </span>
                    <span className="font-medium text-gray-900">{formatBudget(job.budget)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Duration
                    </span>
                    <span className="font-medium text-gray-900">{formatDuration(job.duration)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Project Type
                    </span>
                    <span className="font-medium text-gray-900 capitalize">{job.projectType.replace('-', ' ')}</span>
                  </div>

                  {job.experienceLevel && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Star className="mr-2 h-4 w-4" />
                        Experience Level
                      </span>
                      <span className="font-medium text-gray-900 capitalize">{job.experienceLevel}</span>
                    </div>
                  )}

                  {job.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Location
                      </span>
                      <span className="font-medium text-gray-900 capitalize">{job.location.type}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900">{job.category}</span>
                  </div>

                  {job.subcategory && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Subcategory</span>
                      <span className="font-medium text-gray-900">{job.subcategory}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                <div className="flex items-center space-x-3">
                  {job.client.avatar ? (
                    <img
                      src={job.client.avatar}
                      alt={job.client.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-orange-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{job.client.fullName}</p>
                    <p className="text-sm text-gray-600">{job.client.email}</p>
                  </div>
                </div>
              </div>

              {/* Job Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Proposals
                    </span>
                    <span className="font-medium text-gray-900">{job.proposalCount}</span>
                  </div>
                  
                  {job.maxProposals && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Max Proposals</span>
                      <span className="font-medium text-gray-900">{job.maxProposals}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      Status
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>

                  {job.isUrgent && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Priority</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Urgent
                      </span>
                    </div>
                  )}

                  {job.isFeatured && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Featured</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Yes
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="space-y-3">
                  <Button variant="primary" size="lg" className="w-full">
                    View Proposals ({job.proposalCount})
                  </Button>
                  <Button variant="outline" size="lg" className="w-full">
                    Promote Job
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetailsPage;