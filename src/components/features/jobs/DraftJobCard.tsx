import React, { useState } from 'react';
import { JobResponse } from '../../../lib/api/jobs';
import { Card, CardHeader, CardBody, CardFooter } from '../../ui/Card';
import Button from '../../ui/Button';
import { Badge } from '../../ui/Display';
import { getJobStatusLabel, getJobStatusBadgeVariant } from '../../../lib/utils/formatting';

interface DraftJobCardProps {
  job: JobResponse;
  onOpenJob?: (jobId: string) => void;
  isLoading?: boolean;
}

const DraftJobCard: React.FC<DraftJobCardProps> = ({ job, onOpenJob, isLoading = false }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenJob = async () => {
    if (onOpenJob && !isOpening) {
      setIsOpening(true);
      try {
        await onOpenJob(job.id);
      } finally {
        setIsOpening(false);
      }
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatBudget = () => {
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card variant="default" className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-primary line-clamp-2">
            {job.title}
          </h3>
          <div className="flex gap-2 flex-shrink-0 ml-3">
            <Badge variant={getJobStatusBadgeVariant(job.status)}>
              {getJobStatusLabel(job.status)}
            </Badge>
            {job.isUrgent && (
              <Badge variant="warning">Urgent</Badge>
            )}
            {job.isFeatured && (
              <Badge variant="warning">Featured</Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-secondary">
          <span className="font-medium text-emerald">
            {formatBudget()}
          </span>
          <span>{job.category}</span>
          {job.subcategory && <span>• {job.subcategory}</span>}
        </div>
      </CardHeader>

      <CardBody>
        <p className="text-secondary mb-4 line-clamp-3">
          {job.description}
        </p>

        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-primary">Skills: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-primary">Experience: </span>
              <span className="text-secondary capitalize">
                {job.experienceLevel || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="font-medium text-primary">Project Type: </span>
              <span className="text-secondary capitalize">
                {job.projectType.replace('-', ' ')}
              </span>
            </div>
          </div>

          {job.duration && (
            <div className="text-sm">
              <span className="font-medium text-primary">Duration: </span>
              <span className="text-secondary">
                {job.duration.value} {job.duration.unit}
              </span>
            </div>
          )}

          <div className="text-sm">
            <span className="font-medium text-primary">Location: </span>
            <span className="text-secondary capitalize">
              Remote
            </span>
          </div>
        </div>
      </CardBody>

      <CardFooter>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted">
            <div>Created: {formatDate(job.createdAt)}</div>
            <div className="flex gap-4 mt-1">
              <span>Proposals: {job.proposalCount}</span>
              <span>Max: {job.maxProposals || 'Unlimited'}</span>
            </div>
          </div>
          
          {job.status === 'draft' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenJob}
              disabled={isOpening || isLoading}
              className="ml-4"
            >
              {isOpening ? 'Opening...' : 'Open for Proposals'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default DraftJobCard;