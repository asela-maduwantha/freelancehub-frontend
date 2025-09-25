import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobResponse } from '../../../lib/api/jobs';
import { Card, CardHeader, CardBody, CardFooter } from '../../ui/Card';
import Button from '../../ui/Button';
import { Badge } from '../../ui/Display';

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
    } else if (budget.type === 'hourly') {
      return `${formatCurrency(budget.min, budget.currency)}/hr`;
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 p-6 group cursor-pointer" onClick={() => router.push(`/client/jobs/${job.id}`)}>
      {/* Header Section with Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
              {job.title}
            </h3>
            {job.isUrgent && (
              <Badge variant="warning" className="text-xs px-2 py-1 flex-shrink-0">Urgent</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-green-600 text-base">{formatBudget()}</span>
            <span className="text-gray-400">•</span>
            <span className="truncate">{job.category}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-3">
          <Badge variant={getStatusBadgeVariant(job.status)} className="text-xs px-2 py-1 font-medium">
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(job.postedAt)}
          </span>
          {job.proposalCount > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {job.proposalCount} proposal{job.proposalCount !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
        {job.isExpired && (
          <span className="text-red-500 font-medium">Expired</span>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push(`/client/jobs/${job.id}`)}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Details
        </Button>
      </div>
    </div>
  );
};

export default ClientJobCard;