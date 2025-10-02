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
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 p-5 h-full cursor-pointer transition-all duration-200 hover:shadow-xl" onClick={() => router.push(`/client/jobs/${job.id}`)}>
      {/* Header with Title and Status */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 line-clamp-2 leading-tight flex-1 pr-2 transition-colors">
          {job.title}
        </h3>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={getJobStatusBadgeVariant(job.status)} className="text-xs px-2 py-0.5 font-medium">
            {getJobStatusLabel(job.status)}
          </Badge>
          {job.isUrgent && (
            <Badge variant="warning" className="text-xs px-2 py-0.5">Urgent</Badge>
          )}
        </div>
      </div>

      {/* Budget and Category */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-emerald-600 text-lg">{formatBudget()}</span>
        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">{job.category}</span>
      </div>

      {/* Skills and Experience Level */}
      {job.skills && job.skills.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="text-xs bg-accent-light text-accent px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-xs text-gray-400">+{job.skills.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Project Type and Experience Level */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span className="capitalize">{job.projectType.replace('-', ' ')}</span>
        {job.experienceLevel && (
          <>
            <span className="text-gray-300">•</span>
            <span className="capitalize">{job.experienceLevel}</span>
          </>
        )}
      </div>

      {/* Footer with Date and Proposals */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 mb-3">
        <span>{formatDate(job.postedAt)}</span>
        <div className="flex items-center gap-2">
          {job.status === 'open' && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {job.proposalCount || 0}
            </span>
          )}
          {job.isExpired && (
            <span className="text-accent font-medium">Expired</span>
          )}
        </div>
      </div>

      {/* View More Link */}
      <div className="text-center pt-2 border-t border-gray-100">
        <span
          onClick={() => router.push(`/client/jobs/${job.id}`)}
          className="inline-flex items-center text-accent hover:text-accent-hover font-medium text-sm cursor-pointer hover:underline transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View More
        </span>
      </div>
    </div>
  );

};

export default ClientJobCard;