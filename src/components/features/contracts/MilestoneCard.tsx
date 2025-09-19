import React from 'react';
import { MilestoneResponse } from '@/lib/api/contracts';
import Button from '@/components/ui/Button';

interface MilestoneCardProps {
  milestone: MilestoneResponse;
  onUpdate?: () => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, onUpdate }) => {
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

  const getStatusBadge = () => {
    if (milestone.isPaid) return { text: 'Paid', class: 'bg-emerald text-white' };
    if (milestone.isApproved) return { text: 'Approved', class: 'bg-emerald-light text-emerald' };
    if (milestone.isSubmitted) return { text: 'Submitted', class: 'bg-blue-light text-blue' };
    if (milestone.isInProgress) return { text: 'In Progress', class: 'bg-accent-light text-accent' };
    if (milestone.isOverdue) return { text: 'Overdue', class: 'bg-red-light text-red' };
    return { text: 'Pending', class: 'bg-muted-light text-muted' };
  };

  const status = getStatusBadge();

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-primary">
              Milestone #{milestone.order}: {milestone.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
              {status.text}
            </span>
          </div>
          <p className="text-secondary text-sm mb-3">{milestone.description}</p>
        </div>
      </div>

      {/* Milestone Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-3">
          <div>
            <span className="text-xs text-secondary uppercase tracking-wide">Amount</span>
            <div className="text-lg font-semibold text-emerald">
              {formatCurrency(milestone.amount, milestone.currency)}
            </div>
          </div>
          <div>
            <span className="text-xs text-secondary uppercase tracking-wide">Due Date</span>
            <div className="text-sm text-primary">
              {formatDate(milestone.dueDate)}
              {milestone.isOverdue && (
                <span className="text-red text-xs ml-2">
                  ({Math.abs(milestone.daysUntilDue)} days overdue)
                </span>
              )}
              {!milestone.isOverdue && milestone.daysUntilDue > 0 && (
                <span className="text-muted text-xs ml-2">
                  ({milestone.daysUntilDue} days remaining)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {milestone.submittedAt && (
            <div>
              <span className="text-xs text-secondary uppercase tracking-wide">Submitted</span>
              <div className="text-sm text-primary">
                {formatDate(milestone.submittedAt)}
              </div>
            </div>
          )}
          {milestone.approvedAt && (
            <div>
              <span className="text-xs text-secondary uppercase tracking-wide">Approved</span>
              <div className="text-sm text-primary">
                {formatDate(milestone.approvedAt)}
              </div>
            </div>
          )}
          {milestone.paidAt && (
            <div>
              <span className="text-xs text-secondary uppercase tracking-wide">Paid</span>
              <div className="text-sm text-primary">
                {formatDate(milestone.paidAt)}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-xs text-secondary uppercase tracking-wide">Created</span>
            <div className="text-sm text-primary">
              {formatDate(milestone.createdAt)}
            </div>
          </div>
          {milestone.deliverables.length > 0 && (
            <div>
              <span className="text-xs text-secondary uppercase tracking-wide">Deliverables</span>
              <div className="text-sm text-primary">
                {milestone.deliverables.length} file(s)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deliverables */}
      {milestone.deliverables.length > 0 && (
        <div className="border-t border-border pt-4 mb-4">
          <h4 className="text-sm font-medium text-primary mb-3">Deliverables</h4>
          <div className="space-y-2">
            {milestone.deliverables.map((deliverable, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-light rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-primary">{deliverable.title}</div>
                  <div className="text-xs text-secondary">{deliverable.description}</div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(deliverable.fileUrl, '_blank')}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Note */}
      {milestone.submissionNote && (
        <div className="border-t border-border pt-4 mb-4">
          <h4 className="text-sm font-medium text-primary mb-2">Submission Note</h4>
          <div className="p-3 bg-light rounded-lg">
            <p className="text-sm text-secondary">{milestone.submissionNote}</p>
          </div>
        </div>
      )}

      {/* Client Feedback */}
      {milestone.clientFeedback && (
        <div className="border-t border-border pt-4 mb-4">
          <h4 className="text-sm font-medium text-primary mb-2">Client Feedback</h4>
          <div className="p-3 bg-emerald-light rounded-lg">
            <p className="text-sm text-emerald">{milestone.clientFeedback}</p>
          </div>
        </div>
      )}

      {/* Payment Information */}
      {milestone.paymentId && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-primary mb-3">Payment Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-secondary uppercase tracking-wide">Amount</span>
              <div className="text-sm font-medium text-emerald">
                {formatCurrency(milestone.paymentId.amount, milestone.currency)}
              </div>
            </div>
            <div>
              <span className="text-xs text-secondary uppercase tracking-wide">Status</span>
              <div className="text-sm text-primary capitalize">
                {milestone.paymentId.status}
              </div>
            </div>
            <div>
              <span className="text-xs text-secondary uppercase tracking-wide">Transaction ID</span>
              <div className="text-sm text-primary font-mono">
                {milestone.paymentId.transactionId}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
        {milestone.isSubmitted && !milestone.isApproved && !milestone.isRejected && (
          <>
            <Button variant="secondary" size="sm">
              Request Changes
            </Button>
            <Button variant="primary" size="sm">
              Approve Milestone
            </Button>
          </>
        )}
        {milestone.isApproved && !milestone.isPaid && (
          <Button variant="primary" size="sm">
            Process Payment
          </Button>
        )}
      </div>
    </div>
  );
};

export default MilestoneCard;