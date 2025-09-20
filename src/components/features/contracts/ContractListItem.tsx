import React from 'react';
import { ContractResponse } from '@/lib/api/contracts';
import { Badge } from '@/components/ui/Display';

interface ContractListItemProps {
  contract: ContractResponse;
  onViewDetails: (contract: ContractResponse) => void;
  userRole?: 'freelancer' | 'client';
}

const ContractListItem: React.FC<ContractListItemProps> = ({ 
  contract, 
  onViewDetails,
  userRole = 'client'
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

  // Safely get contract ID as string
  const getContractId = () => {
    if (typeof contract._id === 'string') {
      return contract._id;
    }
    if (contract._id && typeof contract._id === 'object' && 'toString' in contract._id) {
      return (contract._id as any).toString();
    }
    return 'unknown';
  };

  // Safely get contract short ID
  const getShortId = () => {
    const id = getContractId();
    return id.slice(-6);
  };

  // Safely render values that might be objects
  const safeRender = (value: any, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (typeof value === 'object' && value.toString) return value.toString();
    return fallback;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => onViewDetails(contract)}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Contract info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {safeRender(contract.title, 'Untitled Contract')}
              </h3>
              <Badge variant={getStatusBadgeVariant(contract.status)}>
                {safeRender(contract.status.charAt(0).toUpperCase() + contract.status.slice(1))}
              </Badge>
              {contract.contractType && (
                <Badge variant="secondary">
                  {safeRender(contract.contractType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Contract #{getShortId()}</span>
              <span>Start: {formatDate(contract.startDate)}</span>
              <span>End: {formatDate(contract.endDate)}</span>
              {contract.milestoneCount > 0 && (
                <span>
                  {contract.completedMilestones || 0}/{contract.milestoneCount} milestones ({getProgressPercentage()}%)
                </span>
              )}
            </div>
          </div>

          {/* Right side - Amount and progress */}
          <div className="flex items-center gap-6">
            {/* Progress bar for milestones */}
            {contract.milestoneCount > 0 && (
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {getProgressPercentage()}%
                </span>
              </div>
            )}
            
            {/* Amount */}
            <div className="text-right">
              <div className="text-xl font-bold text-emerald-600">
                {formatCurrency(contract.totalAmount, contract.currency)}
              </div>
              <div className="text-sm text-gray-500">
                Paid: {formatCurrency(contract.totalPaid, contract.currency)}
              </div>
              {contract.hourlyRate && contract.hourlyRate > 0 && (
                <div className="text-xs text-gray-400">
                  {formatCurrency(contract.hourlyRate, contract.currency)}/hr
                </div>
              )}
            </div>

            {/* Arrow indicator */}
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractListItem;