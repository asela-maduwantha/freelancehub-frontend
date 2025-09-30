'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { ContractResponse, contractService } from '../../../../../lib/api/contracts';
import { JobResponse, jobService } from '../../../../../lib/api/jobs';
import { ProposalResponse, proposalService } from '../../../../../lib/api/proposals';
import CreateMilestoneModal from '../../../../../components/features/contracts/CreateMilestoneModal';
import { ComponentLoader } from '../../../../../components/common/Loading';
import { Badge } from '../../../../../components/ui/Display';
import Button from '../../../../../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../../../components/ui/Card';

interface ContractWithDetails extends ContractResponse {
  job?: JobResponse;
  proposal?: ProposalResponse;
}

export default function ClientContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<ContractWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Milestone modal state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch the contract
        const contractData = await contractService.getContract(contractId);

        // Fetch related job and proposal data
        const [job, proposal] = await Promise.all([
          jobService.getJob(typeof contractData.jobId === 'object' ? contractData.jobId._id : contractData.jobId).catch(() => undefined),
          contractData.proposalId ? proposalService.getProposal(typeof contractData.proposalId === 'object' ? contractData.proposalId._id : contractData.proposalId).catch(() => undefined) : Promise.resolve(undefined)
        ]);

        setContract({
          ...contractData,
          job,
          proposal
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load contract details');
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContractDetails();
    }
  }, [contractId]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
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
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getProgressPercentage = () => {
    if (!contract || contract.milestoneCount === 0) return 0;
    return Math.round(((contract.completedMilestones || 0) / contract.milestoneCount) * 100);
  };

  const handleCreateMilestone = () => {
    setIsMilestoneModalOpen(true);
  };

  const handleViewMilestones = () => {
    router.push(`/client/contracts/${contractId}/milestones`);
  };

  const handleBackToContracts = () => {
    router.push('/client/contracts');
  };

  const handleMilestoneCreated = () => {
    // Refresh the contract data to update milestone count
    if (contractId) {
      const fetchUpdatedContract = async () => {
        try {
          const contractData = await contractService.getContract(contractId);
          setContract(prev => prev ? { ...prev, ...contractData } : null);
        } catch (err) {
          console.error('Failed to refresh contract data:', err);
        }
      };
      fetchUpdatedContract();
    }
  };

  const canCreateMilestone = contract && (contract.status === 'active' || contract.status === 'pending');

  if (loading) {
    return (
      <DashboardLayout userRole="client">
        <div className="space-y-6">
          <div className="flex justify-center py-12">
            <ComponentLoader size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout userRole="client">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="secondary" onClick={handleBackToContracts}>
              ← Back to Contracts
            </Button>
            <h1 className="text-2xl font-bold text-primary">Contract Details</h1>
          </div>
          <div className="alert-error rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-error mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-error mb-2">Error Loading Contract</h3>
              <p className="text-error">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={handleBackToContracts}>
              ← Back to Contracts
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">{contract.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-secondary">Contract #{typeof contract._id === 'string' ? contract._id.slice(-6) : 'N/A'}</span>
                <Badge variant={getStatusBadgeVariant(contract.status)}>
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </Badge>
                {contract.contractType && (
                  <Badge variant="secondary">
                    {contract.contractType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {canCreateMilestone && (
              <Button variant="primary" onClick={handleCreateMilestone}>
                Create Milestone
              </Button>
            )}
            <Button variant="secondary" onClick={handleViewMilestones}>
              View Milestones
            </Button>
          </div>
        </div>

        {/* Contract Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Contract Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Details Card */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-primary">Contract Information</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {/* Description */}
                  {contract.description && (
                    <div>
                      <h3 className="font-medium text-primary mb-2">Description</h3>
                      <p className="text-secondary">{contract.description}</p>
                    </div>
                  )}

                  {/* Contract Terms */}
                  {contract.terms && (
                    <div>
                      <h3 className="font-medium text-primary mb-2">Terms & Conditions</h3>
                      <p className="text-secondary whitespace-pre-wrap">{contract.terms}</p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-primary mb-1">Start Date</h3>
                      <p className="text-secondary">{formatDate(contract.startDate)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-primary mb-1">End Date</h3>
                      <p className="text-secondary">{formatDate(contract.endDate)}</p>
                    </div>
                  </div>

                  {/* Estimated Hours */}
                  {contract.estimatedHours && (
                    <div>
                      <h3 className="font-medium text-primary mb-1">Estimated Hours</h3>
                      <p className="text-secondary">{contract.estimatedHours} hours</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Job Details Card */}
            {contract.job && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-primary">Job Details</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-primary mb-1">Job Title</h3>
                      <p className="text-secondary">{contract.job.title}</p>
                    </div>
                    
                    {contract.job.description && (
                      <div>
                        <h3 className="font-medium text-primary mb-1">Job Description</h3>
                        <p className="text-secondary line-clamp-3">{contract.job.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-primary mb-1">Category</h3>
                        <p className="text-secondary">{contract.job.category}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-primary mb-1">Project Type</h3>
                        <p className="text-secondary">{contract.job.projectType}</p>
                      </div>
                    </div>
                    
                    {contract.job.skills && contract.job.skills.length > 0 && (
                      <div>
                        <h3 className="font-medium text-primary mb-2">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {contract.job.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Proposal Details Card */}
            {contract.proposal && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-primary">Accepted Proposal</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {contract.proposal.coverLetter && (
                      <div>
                        <h3 className="font-medium text-primary mb-1">Cover Letter</h3>
                        <p className="text-secondary">{contract.proposal.coverLetter}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-primary mb-1">Proposed Rate</h3>
                        <p className="text-secondary">
                          {formatCurrency(contract.proposal.proposedRate.amount, contract.proposal.proposedRate.currency || contract.currency)}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-primary mb-1">Estimated Duration</h3>
                        <p className="text-secondary">
                          {contract.proposal.estimatedDuration?.value} {contract.proposal.estimatedDuration?.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Progress Card */}
            {contract.milestoneCount > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-primary">Project Progress</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-primary">Milestone Progress</span>
                      <span className="text-secondary">
                        {contract.completedMilestones || 0} / {contract.milestoneCount} completed
                      </span>
                    </div>
                    <div className="w-full bg-tertiary rounded-full h-3">
                      <div 
                        className="bg-success h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-lg font-semibold text-success">
                      {getProgressPercentage()}% Complete
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Signature Status */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-primary">Signature Status</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${contract.isClientSigned ? 'bg-success' : 'bg-tertiary'}`}></div>
                    <div>
                      <p className="font-medium text-primary">Client</p>
                      <p className={`text-sm ${contract.isClientSigned ? 'text-success' : 'text-muted'}`}>
                        {contract.isClientSigned ? 'Signed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${contract.isFreelancerSigned ? 'bg-success' : 'bg-tertiary'}`}></div>
                    <div>
                      <p className="font-medium text-primary">Freelancer</p>
                      <p className={`text-sm ${contract.isFreelancerSigned ? 'text-success' : 'text-muted'}`}>
                        {contract.isFreelancerSigned ? 'Signed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-primary">Financial Summary</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-secondary">Total Contract Value</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(contract.totalAmount, contract.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-secondary">Amount Paid</p>
                    <p className="text-xl font-semibold text-success">
                      {formatCurrency(contract.totalPaid, contract.currency)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-secondary">Remaining</p>
                    <p className="text-xl font-semibold text-warning">
                      {formatCurrency(contract.totalAmount - contract.totalPaid, contract.currency)}
                    </p>
                  </div>

                  {contract.hourlyRate && contract.hourlyRate > 0 && (
                    <div>
                      <p className="text-sm text-secondary">Hourly Rate</p>
                      <p className="text-lg font-medium text-primary">
                        {formatCurrency(contract.hourlyRate, contract.currency)}/hour
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-secondary">Platform Fee</p>
                    <p className="text-lg font-medium text-primary">
                      {contract.platformFeePercentage}%
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Contract Metadata */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-primary">Contract Details</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-secondary">Contract ID</p>
                    <p className="text-sm font-mono text-primary">
                      {typeof contract._id === 'string' 
                        ? contract._id 
                        : contract._id && typeof contract._id === 'object' && 'toString' in contract._id
                          ? (contract._id as any).toString()
                          : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Job ID</p>
                    <p className="text-sm font-mono text-primary">
                      {typeof contract.jobId === 'object' ? contract.jobId._id : contract.jobId}
                    </p>
                    {typeof contract.jobId === 'object' && (
                      <p className="text-xs text-muted mt-1">{contract.jobId.title}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Proposal ID</p>
                    <p className="text-sm font-mono text-primary">
                      {typeof contract.proposalId === 'object' ? contract.proposalId._id : contract.proposalId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Client</p>
                    <p className="text-sm text-primary">
                      {typeof contract.clientId === 'object' ? contract.clientId.fullName : 'N/A'}
                    </p>
                    {typeof contract.clientId === 'object' && (
                      <p className="text-xs text-muted mt-1">{contract.clientId.email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Freelancer</p>
                    <p className="text-sm text-primary">
                      {typeof contract.freelancerId === 'object' ? contract.freelancerId.fullName : 'N/A'}
                    </p>
                    {typeof contract.freelancerId === 'object' && (
                      <p className="text-xs text-muted mt-1">{contract.freelancerId.email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Created</p>
                    <p className="text-sm text-primary">{formatDate(contract.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Last Updated</p>
                    <p className="text-sm text-primary">{formatDate(contract.updatedAt)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Create Milestone Modal */}
        {contract && (
          <CreateMilestoneModal
            isOpen={isMilestoneModalOpen}
            onClose={() => setIsMilestoneModalOpen(false)}
            contract={contract}
            onMilestoneCreated={handleMilestoneCreated}
          />
        )}
      </div>
    </DashboardLayout>
  );
}