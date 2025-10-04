import React from 'react';
import { Skeleton } from '../ui/Feedback';

const ProposalCardSkeleton: React.FC = () => {
  return (
    <div className="card-elevated p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={24} />
          <div className="flex items-center gap-4">
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="text" width="40%" height={16} />
          </div>
        </div>
        <Skeleton variant="rectangular" width={100} height={32} />
      </div>

      {/* Cover Letter */}
      <div className="space-y-2">
        <Skeleton variant="text" width="20%" height={18} />
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="80%" height={16} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={20} height={20} />
          <div className="space-y-1">
            <Skeleton variant="text" width="30%" height={14} />
            <Skeleton variant="text" width="50%" height={16} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={20} height={20} />
          <div className="space-y-1">
            <Skeleton variant="text" width="40%" height={14} />
            <Skeleton variant="text" width="60%" height={16} />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        <Skeleton variant="text" width="25%" height={18} />
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <Skeleton variant="text" width="40%" height={16} />
              <Skeleton variant="text" width="60%" height={14} />
            </div>
            <Skeleton variant="rectangular" width={80} height={24} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <Skeleton variant="text" width="35%" height={16} />
              <Skeleton variant="text" width="55%" height={14} />
            </div>
            <Skeleton variant="rectangular" width={80} height={24} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Skeleton variant="rectangular" width={120} height={40} />
        <Skeleton variant="rectangular" width={140} height={40} />
      </div>
    </div>
  );
};

export default ProposalCardSkeleton;