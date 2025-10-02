import React from 'react';
import useStripeAccount from '@/lib/hooks/useStripeAccount';

interface StripeAccountStatusBadgeProps {
  showDetails?: boolean;
  className?: string;
}

const StripeAccountStatusBadge: React.FC<StripeAccountStatusBadgeProps> = ({
  showDetails = false,
  className = '',
}) => {
  const { status, accountState, getStatusBadgeColor, getStatusMessage, needsAttention } = useStripeAccount();

  if (!status) {
    return null;
  }

  const badgeColor = getStatusBadgeColor();
  const message = getStatusMessage();
  const requiresAction = needsAttention();

  const colorStyles = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const iconStyles = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <div className={`stripe-account-status-badge ${className}`}>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorStyles[badgeColor]}`}>
        {/* Icon based on status */}
        {badgeColor === 'success' && (
          <svg className={`w-4 h-4 ${iconStyles.success}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {badgeColor === 'warning' && (
          <svg className={`w-4 h-4 ${iconStyles.warning}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {badgeColor === 'error' && (
          <svg className={`w-4 h-4 ${iconStyles.error}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {badgeColor === 'info' && (
          <svg className={`w-4 h-4 ${iconStyles.info}`} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        )}

        <span className="text-xs font-medium">{message}</span>

        {requiresAction && (
          <span className="ml-1 inline-flex items-center justify-center w-2 h-2 bg-current rounded-full animate-pulse" />
        )}
      </div>

      {/* Detailed Information */}
      {showDetails && accountState && (
        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg text-sm">
          {accountState.actionRequired && (
            <div className="mb-2">
              <span className="font-medium text-gray-900">Action Required:</span>
              <p className="text-gray-700 mt-1">{accountState.actionMessage}</p>
            </div>
          )}

          {accountState.nextSteps && accountState.nextSteps.length > 0 && (
            <div>
              <span className="font-medium text-gray-900">Next Steps:</span>
              <ul className="mt-1 space-y-1 text-gray-700">
                {accountState.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {status.hasAccount && (
            <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Charges:</span>
                <div className="font-medium">
                  {status.chargesEnabled ? (
                    <span className="text-green-600">Enabled</span>
                  ) : (
                    <span className="text-gray-400">Disabled</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Payouts:</span>
                <div className="font-medium">
                  {status.payoutsEnabled ? (
                    <span className="text-green-600">Enabled</span>
                  ) : (
                    <span className="text-gray-400">Disabled</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Verified:</span>
                <div className="font-medium">
                  {status.detailsSubmitted ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StripeAccountStatusBadge;
