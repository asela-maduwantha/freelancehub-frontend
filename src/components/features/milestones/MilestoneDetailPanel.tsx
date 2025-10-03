'use client';

import React from 'react';
import { MilestoneResponse } from '@/lib/api/milestones';
import { Badge } from '@/components/ui/Display';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { getMilestoneStatusColor } from '@/lib/utils/timelineUtils';

interface MilestoneDetailPanelProps {
  milestone: MilestoneResponse | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'client' | 'freelancer';
  onStatusChange: (milestoneId: string, newStatus: string) => Promise<void>;
  isUpdating: boolean;
}

const MilestoneDetailPanel: React.FC<MilestoneDetailPanelProps> = ({
  milestone,
  isOpen,
  onClose,
  userRole,
  onStatusChange,
  isUpdating,
}) => {
  if (!isOpen || !milestone) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = () => {
    const dueDate = new Date(milestone.dueDate);
    const now = new Date();
    return dueDate < now && milestone.status !== 'approved';
  };

  const getStatusBadgeVariant = (): 'success' | 'warning' | 'error' | 'primary' | 'secondary' => {
    switch (milestone.status) {
      case 'approved':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'submitted':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getActionButtons = () => {
    if (userRole === 'freelancer') {
      if (milestone.status === 'pending') {
        return (
          <Button
            variant="primary"
            onClick={() => onStatusChange(milestone.id, 'in-progress')}
            disabled={isUpdating}
            className="w-full"
          >
            Start Work
          </Button>
        );
      }
      if (milestone.status === 'in-progress') {
        return (
          <Button
            variant="primary"
            onClick={() => onStatusChange(milestone.id, 'submitted')}
            disabled={isUpdating}
            className="w-full"
          >
            Submit for Review
          </Button>
        );
      }
    } else if (userRole === 'client') {
      if (milestone.status === 'submitted') {
        return (
          <div className="space-y-2">
            <Button
              variant="primary"
              onClick={() => onStatusChange(milestone.id, 'approved')}
              disabled={isUpdating}
              className="w-full"
            >
              Approve & Pay
            </Button>
            <Button
              variant="secondary"
              onClick={() => onStatusChange(milestone.id, 'rejected')}
              disabled={isUpdating}
              className="w-full"
            >
              Request Changes
            </Button>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Milestone Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Status */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Milestone #{milestone.order}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
              </div>
              <Badge variant={getStatusBadgeVariant()} className="capitalize">
                {milestone.status.replace('-', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{milestone.description}</p>
          </div>

          {/* Amount Card */}
          <Card variant="default" className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardBody>
              <div className="text-center py-2">
                <div className="text-sm text-gray-600 mb-1">Milestone Value</div>
                <div className="text-3xl font-bold text-green-700">
                  {milestone.currency} ${milestone.amount.toLocaleString()}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Timeline Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Created</div>
              <div className="text-sm font-medium text-gray-900">{formatDate(milestone.createdAt)}</div>
            </div>
            <div className={`rounded-lg p-4 ${isOverdue() ? 'bg-red-50' : 'bg-gray-50'}`}>
              <div className="text-xs text-gray-500 mb-1">Due Date</div>
              <div className={`text-sm font-medium ${isOverdue() ? 'text-red-700' : 'text-gray-900'}`}>
                {formatDate(milestone.dueDate)}
                {isOverdue() && <span className="ml-2 text-xs">(Overdue)</span>}
              </div>
            </div>
          </div>

          {/* Deliverables */}
          {milestone.deliverables && milestone.deliverables.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Deliverables</h4>
              <div className="space-y-2">
                {milestone.deliverables.map((deliverable, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{deliverable.filename}</div>
                      <div className="text-xs text-gray-500">{(deliverable.size / 1024).toFixed(2)} KB</div>
                    </div>
                    <a
                      href={deliverable.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-primary hover:text-accent transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {getActionButtons() && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Actions</h4>
              {getActionButtons()}
            </div>
          )}

          {/* Status History / Timeline */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Created</div>
                  <div className="text-xs text-gray-500">{formatDate(milestone.createdAt)}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Last Updated</div>
                  <div className="text-xs text-gray-500">{formatDate(milestone.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MilestoneDetailPanel;
