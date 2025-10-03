'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JobResponse, jobService } from '../../../../../lib/api/jobs';
import { apiClient } from '../../../../../lib/api/client';
import { ProposalResponse, proposalService } from '../../../../../lib/api/proposals';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { Spinner } from '../../../../../components/ui/Feedback';
import Button from '../../../../../components/ui/Button';
import { Badge } from '../../../../../components/ui/Display';
import { 
  Eye, FileText, Clock, CheckCircle, Calendar, MapPin, 
  Briefcase, Star, Mail, Phone, Globe, Edit, Send,
  X, Check, AlertCircle, TrendingUp, MessageSquare,
  Download, ChevronRight, Search, Filter
} from 'lucide-react';

type TabType = 'overview' | 'proposals' | 'activity' | 'details';

interface Activity {
  id: string;
  type: 'posted' | 'proposal' | 'accepted' | 'rejected' | 'status-change' | 'message';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch job details using the API client directly to avoid processing issues
        const response = await apiClient.get(`/jobs/${jobId}`);
        
        // Normalize the job data
        const jobData = response;
        
        
        setJob(jobData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch job details');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchProposals = async () => {
      if (!jobId) return;

      setProposalsLoading(true);
      try {
        const proposalsData = await proposalService.getProposalsByJob(jobId, 1, 50); // Get up to 50 proposals
        setProposals(proposalsData.proposals);
      } catch (err: any) {
        console.error('Failed to fetch proposals:', err);
        // Don't set error state for proposals, just log it
      } finally {
        setProposalsLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
      fetchProposals();
    }
  }, [jobId]);

  // Generate mock activities based on job and proposals
  useEffect(() => {
    if (job) {
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'posted',
          title: 'Job Posted',
          description: `Job "${job.title}" was successfully posted`,
          timestamp: job.postedAt,
        },
      ];

      // Add proposal activities
      proposals.forEach((proposal, idx) => {
        mockActivities.push({
          id: `proposal-${proposal._id}`,
          type: 'proposal',
          title: 'New Proposal Received',
          description: `Proposal received with rate ${formatCurrency(proposal.proposedRate.amount)}`,
          timestamp: proposal.createdAt,
        });

        if (proposal.status === 'accepted') {
          mockActivities.push({
            id: `accepted-${proposal._id}`,
            type: 'accepted',
            title: 'Proposal Accepted',
            description: 'Proposal was accepted and contract created',
            timestamp: proposal.updatedAt,
          });
        } else if (proposal.status === 'rejected') {
          mockActivities.push({
            id: `rejected-${proposal._id}`,
            type: 'rejected',
            title: 'Proposal Rejected',
            description: 'Proposal was declined',
            timestamp: proposal.updatedAt,
          });
        }
      });

      // Sort by timestamp descending
      mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(mockActivities);
    }
  }, [job, proposals]);

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
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

  // Helper functions
  const calculateDaysActive = (postedDate: string): number => {
    const posted = new Date(postedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'posted': return <Briefcase className="w-5 h-5" />;
      case 'proposal': return <FileText className="w-5 h-5" />;
      case 'accepted': return <CheckCircle className="w-5 h-5" />;
      case 'rejected': return <X className="w-5 h-5" />;
      case 'status-change': return <TrendingUp className="w-5 h-5" />;
      case 'message': return <MessageSquare className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: Activity['type']): string => {
    switch (type) {
      case 'posted': return 'bg-blue-100 text-blue-600 border-blue-600';
      case 'proposal': return 'bg-green-100 text-green-600 border-green-600';
      case 'accepted': return 'bg-emerald-100 text-emerald-600 border-emerald-600';
      case 'rejected': return 'bg-red-100 text-red-600 border-red-600';
      case 'status-change': return 'bg-purple-100 text-purple-600 border-purple-600';
      case 'message': return 'bg-yellow-100 text-yellow-600 border-yellow-600';
      default: return 'bg-gray-100 text-gray-600 border-gray-600';
    }
  };

  const formatProposalStatus = (status: string): { text: string; color: string } => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
      case 'accepted':
        return { text: 'Accepted', color: 'bg-green-100 text-green-700' };
      case 'rejected':
        return { text: 'Rejected', color: 'bg-red-100 text-red-700' };
      case 'withdrawn':
        return { text: 'Withdrawn', color: 'bg-gray-100 text-gray-700' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const calculateSkillsMatch = (jobSkills: string[], proposalSkills?: string[]): number => {
    if (!proposalSkills || proposalSkills.length === 0) return 0;
    const matches = jobSkills.filter(skill => 
      proposalSkills.some(ps => ps.toLowerCase() === skill.toLowerCase())
    ).length;
    return Math.round((matches / jobSkills.length) * 100);
  };

  const filteredProposals = proposals.filter(proposal => 
    proposalSearchQuery === '' || 
    proposal._id.toLowerCase().includes(proposalSearchQuery.toLowerCase()) ||
    proposal.coverLetter.toLowerCase().includes(proposalSearchQuery.toLowerCase())
  );

  // Component: Quick Stat Card
  const QuickStatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-sm border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );

  // Component: Contextual Alert
  const ContextualAlert = ({ type, message, action, onAction }: { type: 'info' | 'warning' | 'success'; message: string; action?: string; onAction?: () => void }) => {
    const colors = {
      info: 'bg-blue-50 border-blue-200 text-blue-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      success: 'bg-green-50 border-green-200 text-green-900',
    };

    const iconColors = {
      info: 'text-blue-600',
      warning: 'text-yellow-600',
      success: 'text-green-600',
    };

    return (
      <div className={`${colors[type]} border rounded-xl p-4 flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <AlertCircle className={`w-5 h-5 flex-shrink-0 ${iconColors[type]}`} />
          <p className="text-sm font-medium">{message}</p>
        </div>
        {action && onAction && (
          <Button variant="outline" size="sm" onClick={onAction} className="whitespace-nowrap">
            {action}
          </Button>
        )}
      </div>
    );
  };

  // Component: Proposal Card
  const ProposalCard = ({ proposal, onView }: { proposal: ProposalResponse; onView: () => void }) => {
    const statusInfo = formatProposalStatus(proposal.status);
    const skillsMatch = calculateSkillsMatch(job?.skills || [], []);

    return (
      <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {proposal._id.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Proposal #{proposal._id.slice(-6)}</h4>
              <p className="text-xs text-gray-500">ID: {proposal._id}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>

        {/* Proposed Rate */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatCurrency(proposal.proposedRate.amount, proposal.proposedRate.currency || 'USD')}
          </div>
          {proposal.estimatedDuration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Est. {proposal.estimatedDuration.value} {proposal.estimatedDuration.unit}</span>
            </div>
          )}
        </div>

        {/* Cover Letter Preview */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">{proposal.coverLetter}</p>
        </div>

        {/* Skills Match */}
        {skillsMatch > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all" 
                style={{ width: `${skillsMatch}%` }}
              />
            </div>
            <span className="text-gray-600 font-medium">{skillsMatch}% match</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            {getRelativeTime(proposal.createdAt)}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onView}>
              View Full
            </Button>
            {proposal.status === 'pending' && (
              <>
                <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-700">
                  Accept
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Component: Activity Item
  const ActivityItem = ({ activity, index }: { activity: Activity; index: number }) => {
    const colorClasses = getActivityColor(activity.type);
    
    return (
      <div 
        className="flex gap-4 animate-in slide-in-from-left"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}>
          {getActivityIcon(activity.type)}
        </div>

        {/* Content */}
        <div className={`flex-1 border-l-4 ${colorClasses.split(' ')[2]} pl-4 pb-6`}>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
            <span className="text-xs text-gray-500">{getRelativeTime(activity.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Component: Tab Navigation
  const TabNavigation = () => {
    const tabs: { id: TabType; label: string; count?: number }[] = [
      { id: 'overview', label: 'Overview' },
      { id: 'proposals', label: 'Proposals', count: proposals.length },
      { id: 'activity', label: 'Activity', count: activities.length },
      { id: 'details', label: 'Details' },
    ];

    return (
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-1 py-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transition-all" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center min-h-96">
          <Spinner size="lg" className="text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout userRole="client">
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
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button onClick={() => router.push('/client/jobs')} className="hover:text-blue-600 transition-colors">
            Jobs
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">{job.title}</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            {/* Left: Title and Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <Badge variant={getStatusBadgeVariant(job.status)} className="px-3 py-1">
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
                {job.isUrgent && (
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">
                    🔥 Urgent
                  </span>
                )}
                {job.isFeatured && (
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="font-semibold text-green-600 text-lg">{formatBudget(job)}</span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">{job.projectType.replace('-', ' ')}</span>
                <span className="text-gray-400">•</span>
                <span>{job.category}</span>
                <span className="text-gray-400">•</span>
                <span>Posted {formatDate(job.postedAt)}</span>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {job.status === 'draft' && (
                <>
                  <Button variant="outline" onClick={() => router.push(`/client/jobs/${job.id}/edit`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Draft
                  </Button>
                  <Button variant="primary">
                    <Send className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                </>
              )}
              {job.status === 'open' && (
                <>
                  <Button variant="outline" onClick={() => setActiveTab('proposals')}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Proposals
                  </Button>
                  <Button variant="outline" onClick={() => router.push(`/client/jobs/${job.id}/edit`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:bg-red-50">
                    <X className="w-4 h-4 mr-2" />
                    Close Job
                  </Button>
                </>
              )}
              {job.status === 'contracted' && job.contractId && (
                <>
                  <Button variant="primary" onClick={() => router.push(`/client/contracts/${job.contractId}`)}>
                    View Contract
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Freelancer
                  </Button>
                </>
              )}
              {job.status === 'completed' && (
                <>
                  <Button variant="primary">
                    <Star className="w-4 h-4 mr-2" />
                    Leave Review
                  </Button>
                  <Button variant="outline">
                    Hire Again
                  </Button>
                </>
              )}
              <button 
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Contextual Alerts */}
        {job.status === 'open' && proposals.length > 0 && (
          <ContextualAlert
            type="info"
            message={`You have ${proposals.length} proposal${proposals.length !== 1 ? 's' : ''} waiting for review`}
            action="Review Now"
            onAction={() => setActiveTab('proposals')}
          />
        )}
        {job.status === 'open' && calculateDaysActive(job.postedAt) > 7 && proposals.length === 0 && (
          <ContextualAlert
            type="warning"
            message="No proposals yet after 7 days. Consider updating your job description or budget."
            action="Edit Job"
            onAction={() => router.push(`/client/jobs/${job.id}/edit`)}
          />
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6">
            <TabNavigation />
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickStatCard
                    icon={<Eye className="w-6 h-6" />}
                    label="Views"
                    value="0"
                    color="from-blue-50 to-white"
                  />
                  <QuickStatCard
                    icon={<FileText className="w-6 h-6" />}
                    label="Proposals"
                    value={proposals.length}
                    color="from-green-50 to-white"
                  />
                  <QuickStatCard
                    icon={<Clock className="w-6 h-6" />}
                    label="Days Active"
                    value={calculateDaysActive(job.postedAt)}
                    color="from-purple-50 to-white"
                  />
                  <QuickStatCard
                    icon={<CheckCircle className="w-6 h-6" />}
                    label="Hired"
                    value={job.status === 'contracted' || job.status === 'completed' ? '1' : '0'}
                    color="from-emerald-50 to-white"
                  />
                </div>

                {/* Job Description */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Attachments */}
                {job.attachments && job.attachments.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
                    <div className="space-y-3">
                      {job.attachments.map((attachment, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                              <p className="text-xs text-gray-600">
                                {(attachment.size / 1024).toFixed(1)} KB • {attachment.type}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Proposals Tab */}
            {activeTab === 'proposals' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search proposals..."
                      value={proposalSearchQuery}
                      onChange={(e) => setProposalSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Proposals Grid */}
                {proposalsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner size="lg" className="text-blue-600" />
                  </div>
                ) : filteredProposals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProposals.map((proposal, index) => (
                      <div
                        key={proposal._id}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="animate-in slide-in-from-bottom"
                      >
                        <ProposalCard
                          proposal={proposal}
                          onView={() => router.push(`/client/jobs/${job.id}/proposals/${proposal._id}`)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {proposalSearchQuery ? 'No matching proposals' : 'No proposals yet'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      {proposalSearchQuery 
                        ? 'Try adjusting your search query' 
                        : 'Share your job to attract talented freelancers'}
                    </p>
                    {!proposalSearchQuery && (
                      <Button variant="outline">
                        Share Job
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <ActivityItem key={activity.id} activity={activity} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
                    <p className="text-gray-600 text-sm">
                      Activity will appear here as proposals come in and status changes occur
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Project Details */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Project Type</label>
                      <p className="text-gray-900 capitalize">{job.projectType.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                      <p className="text-gray-900">{job.category}</p>
                    </div>
                    {job.subcategory && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Subcategory</label>
                        <p className="text-gray-900">{job.subcategory}</p>
                      </div>
                    )}
                    {job.experienceLevel && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Experience Level</label>
                        <p className="text-gray-900 capitalize">{job.experienceLevel}</p>
                      </div>
                    )}
                    {job.duration && job.duration.value !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Duration</label>
                        <p className="text-gray-900">{job.duration.value} {job.duration.unit}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Budget Type</label>
                      <p className="text-gray-900 capitalize">{job.budget.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Amount</label>
                      <p className="font-semibold text-green-600 text-lg">{formatBudget(job)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Currency</label>
                      <p className="text-gray-900">{job.budget.currency}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Posted Date</label>
                      <p className="text-gray-900">{formatDate(job.postedAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Created Date</label>
                      <p className="text-gray-900">{formatDate(job.createdAt)}</p>
                    </div>
                    {job.updatedAt !== job.createdAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Last Updated</label>
                        <p className="text-gray-900">{formatDate(job.updatedAt)}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Days Active</label>
                      <p className="text-gray-900">{calculateDaysActive(job.postedAt)} days</p>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {job.client.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.client.fullName}</h3>
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {job.client.email}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>4.8 ⭐</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>23 jobs</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>89% hire rate</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Member 2 yrs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Client
                  </Button>
                </div>

                {/* Job Settings */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-700">Active Status</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${job.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-700">Receiving Proposals</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${job.canReceiveProposals ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {job.canReceiveProposals ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-700">Expired</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${job.isExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {job.isExpired ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-700">Max Proposals</span>
                      <span className="text-sm font-medium text-gray-900">
                        {job.maxProposals || 'Unlimited'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-700">Current Proposals</span>
                      <span className="text-sm font-medium text-gray-900">
                        {job.proposalCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}