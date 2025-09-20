import React from 'react';
import { MilestoneResponse } from '@/lib/api/contracts';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Display';

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

  const formatDateWithTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = () => {
    if (milestone.isPaid) return { 
      text: 'Paid', 
      variant: 'success' as const, 
      icon: '💰',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    };
    if (milestone.isApproved) return { 
      text: 'Approved', 
      variant: 'success' as const, 
      icon: '✅',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    };
    if (milestone.isSubmitted) return { 
      text: 'Submitted', 
      variant: 'primary' as const, 
      icon: '📋',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    };
    if (milestone.isInProgress) return { 
      text: 'In Progress', 
      variant: 'warning' as const, 
      icon: '⏳',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    };
    if (milestone.isOverdue) return { 
      text: 'Overdue', 
      variant: 'error' as const, 
      icon: '⚠️',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    };
    return { 
      text: 'Pending', 
      variant: 'secondary' as const, 
      icon: '⏱️',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    };
  };

  const status = getStatusInfo();

  const getProgressPercentage = () => {
    if (milestone.isPaid) return 100;
    if (milestone.isApproved) return 85;
    if (milestone.isSubmitted) return 70;
    if (milestone.isInProgress) return 50;
    return 15;
  };

  const getDaysStatus = () => {
    if (milestone.isOverdue) {
      return {
        text: `${Math.abs(milestone.daysUntilDue)} days overdue`,
        class: 'text-red-600 bg-red-50 border-red-200'
      };
    }
    if (milestone.daysUntilDue <= 3 && milestone.daysUntilDue > 0) {
      return {
        text: `${milestone.daysUntilDue} days remaining`,
        class: 'text-amber-600 bg-amber-50 border-amber-200'
      };
    }
    if (milestone.daysUntilDue > 0) {
      return {
        text: `${milestone.daysUntilDue} days remaining`,
        class: 'text-blue-600 bg-blue-50 border-blue-200'
      };
    }
    return null;
  };

  const daysStatus = getDaysStatus();

  return (
    <div className="group relative">
      {/* Progress bar at the top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-out ${
            milestone.isPaid ? 'bg-emerald-500' :
            milestone.isApproved ? 'bg-emerald-400' :
            milestone.isSubmitted ? 'bg-blue-500' :
            milestone.isInProgress ? 'bg-amber-500' :
            milestone.isOverdue ? 'bg-red-500' : 'bg-gray-400'
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      <div className={`card hover:shadow-lg transition-all duration-300 border-l-4 ${
        milestone.isPaid ? 'border-l-emerald-500' :
        milestone.isApproved ? 'border-l-emerald-400' :
        milestone.isSubmitted ? 'border-l-blue-500' :
        milestone.isInProgress ? 'border-l-amber-500' :
        milestone.isOverdue ? 'border-l-red-500' : 'border-l-gray-400'
      } ${status.bgColor} bg-opacity-30`}>
        
        {/* Header Section */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{status.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {milestone.title}
                  </h3>
                </div>
                <Badge variant={status.variant} size="sm">
                  {status.text}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-500">Milestone #{milestone.order}</span>
                {daysStatus && (
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${daysStatus.class}`}>
                    {daysStatus.text}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{milestone.description}</p>
            </div>
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {formatCurrency(milestone.amount, milestone.currency)}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Milestone Value
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Timeline Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Due Date</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(milestone.dueDate)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Created</div>
                    <div className="text-sm text-gray-700">
                      {formatDate(milestone.createdAt)}
                    </div>
                  </div>
                </div>

                {milestone.submittedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Submitted</div>
                      <div className="text-sm text-gray-700">
                        {formatDateWithTime(milestone.submittedAt)}
                      </div>
                    </div>
                  </div>
                )}

                {milestone.approvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Approved</div>
                      <div className="text-sm text-gray-700">
                        {formatDateWithTime(milestone.approvedAt)}
                      </div>
                    </div>
                  </div>
                )}

                {milestone.paidAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Paid</div>
                      <div className="text-sm text-gray-700">
                        {formatDateWithTime(milestone.paidAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Deliverables Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Deliverables</h4>
                {milestone.deliverables.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {milestone.deliverables.length} file{milestone.deliverables.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {milestone.deliverables.length > 0 ? (
                <div className="space-y-2">
                  {milestone.deliverables.map((deliverable, index) => (
                    <div key={index} className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{deliverable.filename}</div>
                          <div className="text-xs text-gray-500 truncate">{deliverable.type} • {(deliverable.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(deliverable.url, '_blank')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">No deliverables attached</p>
                </div>
              )}
            </div>

            {/* Progress & Actions */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Progress</h4>
              
              {/* Progress Circle */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`${
                        milestone.isPaid ? 'text-emerald-500' :
                        milestone.isApproved ? 'text-emerald-400' :
                        milestone.isSubmitted ? 'text-blue-500' :
                        milestone.isInProgress ? 'text-amber-500' :
                        milestone.isOverdue ? 'text-red-500' : 'text-gray-400'
                      } transition-all duration-700`}
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${getProgressPercentage()}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-700">{getProgressPercentage()}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Milestone Progress</div>
                  <div className="text-xs text-gray-500">
                    {milestone.isPaid ? 'Payment completed' :
                     milestone.isApproved ? 'Awaiting payment' :
                     milestone.isSubmitted ? 'Under review' :
                     milestone.isInProgress ? 'Work in progress' :
                     'Not started'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Note */}
        {milestone.submissionNote && (
          <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Submission Note</h4>
                <p className="text-sm text-blue-800 leading-relaxed">{milestone.submissionNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Client Feedback */}
        {milestone.clientFeedback && (
          <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-emerald-900 mb-2">Client Feedback</h4>
                <p className="text-sm text-emerald-800 leading-relaxed">{milestone.clientFeedback}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {milestone.paymentId && (
          <div className="px-6 py-4 bg-green-50 border-t border-green-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-900 mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="text-xs text-green-600 uppercase tracking-wide font-medium">Amount</div>
                    <div className="text-sm font-semibold text-green-900 mt-1">
                      {formatCurrency(milestone.paymentId.amount, milestone.currency)}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="text-xs text-green-600 uppercase tracking-wide font-medium">Status</div>
                    <div className="text-sm font-semibold text-green-900 mt-1 capitalize">
                      {milestone.paymentId.status}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="text-xs text-green-600 uppercase tracking-wide font-medium">Transaction ID</div>
                    <div className="text-xs font-mono text-green-800 mt-1 break-all">
                      {milestone.paymentId.transactionId}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Progress Indicator Text */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${
                milestone.isPaid ? 'bg-emerald-500' :
                milestone.isApproved ? 'bg-emerald-400' :
                milestone.isSubmitted ? 'bg-blue-500' :
                milestone.isInProgress ? 'bg-amber-500' :
                milestone.isOverdue ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <span className="font-medium">
                {milestone.isPaid ? 'Payment completed' :
                 milestone.isApproved ? 'Awaiting payment processing' :
                 milestone.isSubmitted ? 'Under client review' :
                 milestone.isInProgress ? 'Work in progress' :
                 milestone.isOverdue ? 'Action required - overdue' :
                 'Waiting to start'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {milestone.isSubmitted && !milestone.isApproved && !milestone.isRejected && (
                <>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Request Changes
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve Milestone
                  </Button>
                </>
              )}
              {milestone.isApproved && !milestone.isPaid && (
                <Button 
                  variant="primary" 
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Process Payment
                </Button>
              )}
              {milestone.isPaid && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Milestone Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneCard;