'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { JobResponse, jobService } from '../../../../../lib/api/jobs';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { Loader } from '../../../../../components/ui/Feedback';
import Button from '../../../../../components/ui/Button';
import { Badge } from '../../../../../components/ui/Display';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Briefcase,
  User,
  Star,
  FileText,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  Award,
  Users
} from 'lucide-react';

export default function FreelancerJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;

      try {
        setIsLoading(true);
        setError(null);
        const jobData = await jobService.getJob(jobId);
        setJob(jobData);

        // Check if freelancer has already applied (you might want to implement this check)
        // For now, we'll assume they haven't applied
        setHasApplied(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatBudget = (job: JobResponse) => {
    const { budget } = job;
    if (budget.type === 'fixed') {
      return formatCurrency(budget.min, budget.currency);
    } else if (budget.type === 'range') {
      return `${formatCurrency(budget.min, budget.currency)} - ${formatCurrency(budget.max || 0, budget.currency)}`;
    }
    return 'Budget not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
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

  if (isLoading) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="flex items-center justify-center min-h-96">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Job</h3>
            <p className="text-red-700 mb-6">{error || 'Job not found'}</p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(job.status)} className="px-3 py-1">
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                    {job.isUrgent && (
                      <Badge variant="warning" className="px-3 py-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Urgent
                      </Badge>
                    )}
                    {job.isFeatured && (
                      <Badge variant="warning" className="px-3 py-1 flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600 text-lg">{formatBudget(job)}</span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{job.projectType.replace('-', ' ')}</span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {getTimeAgo(job.postedAt)}</span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{job.proposalCount} proposals</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Category: {job.category}</span>
                  {job.subcategory && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>Subcategory: {job.subcategory}</span>
                    </>
                  )}
                  <span className="text-gray-400">•</span>
                  <span>Experience: {job.experienceLevel || 'Not specified'}</span>
                </div>
              </div>

              <div className="flex gap-3 ml-6">
                {hasApplied ? (
                  <Button variant="secondary" disabled className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Already Applied
                  </Button>
                ) : (
                  <Link href={`/freelancer/proposals/create/${job.id}`}>
                    <Button variant="primary" className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Apply for Job
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
              </div>
            </div>

            {/* Skills & Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Requirements</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {job.experienceLevel && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                      {job.experienceLevel} Level
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Attachments */}
            {job.attachments && job.attachments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Attachments
                </h2>
                <div className="space-y-3">
                  {job.attachments.map((attachment, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                          <p className="text-xs text-gray-600">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-green-700">
                    {job.client.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{job.client.fullName}</p>
                  <p className="text-sm text-gray-600">{job.client.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium">{formatDate(job.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs posted:</span>
                  <span className="font-medium">12</span> {/* You might want to fetch this from API */}
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold text-green-600">{formatBudget(job)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Project Type</p>
                    <p className="font-medium capitalize">{job.projectType.replace('-', ' ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{formatDuration(job.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Posted</p>
                    <p className="font-medium">{formatDate(job.postedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">Proposals</p>
                    <p className="font-medium">{job.proposalCount} received</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Status */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={getStatusBadgeVariant(job.status)} className="text-xs">
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${job.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-600">{job.isActive ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Receiving Proposals</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${job.canReceiveProposals ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className="text-xs text-gray-600">{job.canReceiveProposals ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                {job.expiresAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expires</span>
                    <span className="text-xs text-gray-600">{formatDate(job.expiresAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Section */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Ready to Apply?</h2>
              <p className="text-sm text-gray-700 mb-4">
                Submit your proposal to showcase your skills and get hired for this project.
              </p>
              {hasApplied ? (
                <Button variant="secondary" disabled className="w-full flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Proposal Submitted
                </Button>
              ) : (
                <Link href={`/freelancer/proposals/create/${job.id}`}>
                  <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    Submit Proposal
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}