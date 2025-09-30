'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import Button from '../../../../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../../../../components/ui/Card';
import { Badge } from '../../../../../components/ui/Display';
import { Loader, Alert } from '../../../../../components/ui/Feedback';
import { Modal } from '../../../../../components/ui/Modal';
import { proposalService, ProposalResponse } from '../../../../../lib/api/proposals';
import { jobService, JobResponse } from '../../../../../lib/api/jobs';
import { fileService } from '../../../../../lib/api/files';
import {
  ArrowLeft,
  Eye,
  DollarSign,
  Clock,
  FileText,
  Briefcase,
  MapPin,
  User,
  Download,
  MessageSquare,
  Edit,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Paperclip,
  Calendar,
  Star
} from 'lucide-react';

const ProposalDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (proposalId) {
      fetchProposalDetails();
    }
  }, [proposalId]);

  const fetchProposalDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch proposal details (job data is included in the response)
      const proposalData = await proposalService.getProposal(proposalId);
      setProposal(proposalData);
    } catch (err: any) {
      setError(err.message || 'Failed to load proposal details');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawProposal = async () => {
    if (!proposal) return;

    try {
      setWithdrawing(true);
      await proposalService.withdrawProposal(proposal._id);
      setProposal({ ...proposal, status: 'withdrawn' });
      setWithdrawModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw proposal');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleDownloadAttachment = async (attachment: any) => {
    try {
      // Open the attachment URL in a new tab for download
      window.open(attachment.url, '_blank');
    } catch (err: any) {
      setError('Failed to download attachment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudget = (budget: JobResponse['budget']) => {
    const { type, min, max, currency = 'USD' } = budget;

    if (type === 'range' && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`;
    }
    return `$${min.toLocaleString()} ${currency}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'withdrawn':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5" />;
      case 'rejected':
        return <XCircle className="h-5 w-5" />;
      case 'withdrawn':
        return <X className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !proposal) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="max-w-4xl mx-auto p-6">
          <Alert
            type="error"
            message={error || 'Proposal not found'}
            onClose={() => router.push('/freelancer/proposals')}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/freelancer/proposals')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Proposal Details
              </h1>
              <p className="text-gray-600">
              Proposal for Job #{proposal.job.id.slice(-8)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={getStatusBadgeVariant(proposal.status)} className="flex items-center gap-2">
                {getStatusIcon(proposal.status)}
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        <div className="space-y-6">
          {/* Job Information */}
          <Card variant="elevated">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Job Information</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{proposal.job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <Badge variant="secondary">
                      Regular
                    </Badge>
                    <span>Job ID: {proposal.job.id.slice(-8)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <span className="text-sm text-gray-600">Budget</span>
                        <p className="font-medium text-gray-900">{formatBudget(proposal.job.budget)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <div>
                        <span className="text-sm text-gray-600">Project Type</span>
                        <p className="font-medium text-gray-900 capitalize">
                          {proposal.job.projectType.replace('-', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <div>
                        <span className="text-sm text-gray-600">Location</span>
                        <p className="font-medium text-gray-900">Remote</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600">Category</span>
                      <p className="font-medium text-gray-900 capitalize">
                        {proposal.job.category.replace('-', ' ')}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Experience Level</span>
                      <p className="font-medium text-gray-900 capitalize">
                        Not specified
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant="secondary">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
                  <p className="text-gray-700 leading-relaxed">Job details not available in proposal view.</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                  <p className="text-gray-700">Skills information not available in proposal view.</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Proposal Details */}
          <Card variant="elevated">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Your Proposal</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Cover Letter */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Cover Letter</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {proposal.coverLetter}
                    </p>
                  </div>
                </div>

                {/* Proposal Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="text-sm text-gray-600">Proposed Rate</span>
                      <p className="font-medium text-gray-900">
                        ${proposal.proposedRate.amount.toLocaleString()} {proposal.proposedRate.type}
                      </p>
                    </div>
                  </div>

                  {proposal.estimatedDuration && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <span className="text-sm text-gray-600">Estimated Duration</span>
                        <p className="font-medium text-gray-900">
                          {proposal.estimatedDuration.value} {proposal.estimatedDuration.unit}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submission Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div>
                    <span className="text-sm text-gray-600">Submitted</span>
                    <p className="font-medium text-gray-900">{formatDate(proposal.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Milestones */}
          {proposal.proposedMilestones && proposal.proposedMilestones.length > 0 && (
            <Card variant="elevated">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">
                  Proposed Milestones ({proposal.proposedMilestones.length})
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {proposal.proposedMilestones.map((milestone: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{milestone.title}</h4>
                          <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${milestone.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {milestone.durationDays} days
                          </p>
                        </div>
                      </div>

                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Deliverables:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {milestone.deliverables.map((deliverable: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                {deliverable}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Attachments */}
          {proposal.attachments && proposal.attachments.length > 0 && (
            <Card variant="elevated">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">
                  Attachments ({proposal.attachments.length})
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {proposal.attachments.map((attachment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{attachment.originalName}</p>
                          <p className="text-sm text-gray-600">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Client Information */}
          <Card variant="elevated">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Client Information</h2>
            </CardHeader>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{proposal.job.client.fullName}</p>
                  <p className="text-sm text-gray-600">{proposal.job.client.email}</p>
                </div>
                <Button variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Client
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {proposal.status === 'pending' && (
              <>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Proposal
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setWithdrawModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Withdraw Proposal
                </Button>
              </>
            )}

            {proposal.status === 'accepted' && (
              <Button variant="primary">
                <FileText className="mr-2 h-4 w-4" />
                View Contract
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => router.push('/freelancer/proposals')}
            >
              Back to Proposals
            </Button>
          </div>
        </div>

        {/* Withdraw Proposal Modal */}
        <Modal
          isOpen={withdrawModalOpen}
          onClose={() => setWithdrawModalOpen(false)}
          title="Withdraw Proposal"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Are you sure you want to withdraw this proposal?</h3>
                <p className="text-gray-600 text-sm">
                  This action cannot be undone. The client will be notified that you've withdrawn your proposal.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={handleWithdrawProposal}
                disabled={withdrawing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                {withdrawing ? <Loader size="sm" /> : 'Withdraw Proposal'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setWithdrawModalOpen(false)}
                disabled={withdrawing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ProposalDetailPage;
