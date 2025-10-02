import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobResponse } from '../../../lib/api/jobs';
import { Card, CardHeader, CardBody, CardFooter } from '../../ui/Card';
import Button from '../../ui/Button';
import { Badge } from '../../ui/Display';
import { getJobStatusLabel, getJobStatusBadgeVariant } from '../../../lib/utils/formatting';

interface ClientJobCardProps {
  job: JobResponse;
  isLoading?: boolean;
}

const ClientJobCard: React.FC<ClientJobCardProps> = ({ 
  job, 
  isLoading = false 
}) => {
  const router = useRouter();
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
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 p-4 h-full cursor-pointer transition-all" onClick={() => router.push(`/client/jobs/${job.id}`)}>
      {/* Header with Title and Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug flex-1">
          {job.title}
        </h3>
        <Badge variant={getJobStatusBadgeVariant(job.status)} className="text-xs px-2 py-1 font-medium flex-shrink-0">
          {getJobStatusLabel(job.status)}
        </Badge>
      </div>

      {/* Budget */}
      <div className="mb-3">
        <span className="text-xl font-bold text-gray-900">{formatBudget()}</span>
      </div>

      {/* Category and Project Type */}
      <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
        <span className="px-2 py-1 bg-gray-100 rounded">{job.category}</span>
        <span className="capitalize">{job.projectType.replace('-', ' ')}</span>
        {job.experienceLevel && (
          <>
            <span>•</span>
            <span className="capitalize">{job.experienceLevel}</span>
          </>
        )}
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-xs text-gray-500">+{job.skills.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Footer with Date and Proposals */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
        <span>{formatDate(job.postedAt)}</span>
        {job.status === 'open' && (
          <span className="font-medium text-gray-700">
            {job.proposalCount || 0} proposals
          </span>
        )}
        {job.isUrgent && (
          <span className="text-amber-600 font-medium">Urgent</span>
        )}
        {job.isExpired && (
          <span className="text-red-600 font-medium">Expired</span>
        )}
      </div>
    </div>
  );

};

export default ClientJobCard;