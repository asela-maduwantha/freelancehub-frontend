import React from 'react';
import { ContractResponse } from '@/lib/api/contracts';
import { JobResponse } from '@/lib/api/jobs';
import { ProposalResponse } from '@/lib/api/proposals';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Display';

interface ContractCardProps {
  contract: ContractResponse & {
    job?: JobResponse;
    proposal?: ProposalResponse;
  };
  onCreateMilestone?: (contract: ContractResponse) => void;
  onViewMilestones?: (contract: ContractResponse) => void;
  userRole?: 'freelancer' | 'client';
  isLoading?: boolean;
}

const ContractCard: React.FC<ContractCardProps> = ({ 
  contract, 
  onCreateMilestone, 
  onViewMilestones,
  userRole = 'client',
  isLoading = false 
}) => {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    if (contract.milestoneCount === 0) return 0;
    return Math.round(((contract.completedMilestones || 0) / contract.milestoneCount) * 100);
  };

  const canCreateMilestone = contract.status === 'active' || contract.status === 'pending';

  return (
    <Card variant="default" className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary line-clamp-2 mb-2">
              {contract.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-secondary">Contract #{contract._id.slice(-6)}</span>
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
          <div className="text-right">
            <div className="text-xl font-bold text-emerald">
              {formatCurrency(contract.totalAmount, contract.currency)}
            </div>
            {contract.hourlyRate && contract.hourlyRate > 0 && (
              <div className="text-sm text-secondary">
                {formatCurrency(contract.hourlyRate, contract.currency)}/hr
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {contract.milestoneCount > 0 && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-primary">Progress</span>
              <span className="text-sm text-secondary">
                {contract.completedMilestones || 0} / {contract.milestoneCount} milestones
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="text-xs text-secondary mt-1">
              {getProgressPercentage()}% complete
            </div>
          </div>
        )}
      </CardHeader>

      <CardBody>
        <div className="space-y-4">
          {/* Contract Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-primary">Start Date:</span>
              <div className="text-secondary">{formatDate(contract.startDate)}</div>
            </div>
            <div>
              <span className="font-medium text-primary">End Date:</span>
              <div className="text-secondary">{formatDate(contract.endDate)}</div>
            </div>
            <div>
              <span className="font-medium text-primary">Total Paid:</span>
              <div className="text-emerald font-medium">
                {formatCurrency(contract.totalPaid, contract.currency)}
              </div>
            </div>
            <div>
              <span className="font-medium text-primary">Platform Fee:</span>
              <div className="text-secondary">{contract.platformFeePercentage}%</div>
            </div>
          </div>

          {/* Job Information */}
          {contract.job && (
            <div className="border-t border-light pt-4">
              <h5 className="font-medium text-primary mb-2">Job Details</h5>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-secondary">Category: </span>
                  <span className="text-sm text-primary">{contract.job.category}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary">Skills: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contract.job.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {contract.job.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{contract.job.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Proposal Information */}
          {contract.proposal && (
            <div className="border-t border-light pt-4">
              <h5 className="font-medium text-primary mb-2">Proposal Details</h5>
              <div className="text-sm text-secondary">
                <p className="line-clamp-2">{contract.proposal.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Contract Terms */}
          {contract.terms && (
            <div className="border-t border-light pt-4">
              <h5 className="font-medium text-primary mb-2">Terms & Conditions</h5>
              <p className="text-sm text-secondary line-clamp-3">{contract.terms}</p>
            </div>
          )}

          {/* Signature Status */}
          <div className="border-t border-light pt-4">
            <h5 className="font-medium text-primary mb-2">Signature Status</h5>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${contract.isClientSigned ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                <span className={contract.isClientSigned ? 'text-emerald-600' : 'text-gray-500'}>
                  Client {contract.isClientSigned ? 'Signed' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${contract.isFreelancerSigned ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                <span className={contract.isFreelancerSigned ? 'text-emerald-600' : 'text-gray-500'}>
                  Freelancer {contract.isFreelancerSigned ? 'Signed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardBody>

      <CardFooter>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted">
            <div>Created: {formatDate(contract.createdAt)}</div>
            {contract.estimatedHours && (
              <div>Estimated: {contract.estimatedHours} hours</div>
            )}
          </div>
          
          <div className="flex gap-3">
            {userRole === 'client' && canCreateMilestone && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onCreateMilestone?.(contract)}
                disabled={isLoading}
              >
                Create Milestone
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewMilestones?.(contract)}
              disabled={isLoading}
            >
              View Milestones
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContractCard;