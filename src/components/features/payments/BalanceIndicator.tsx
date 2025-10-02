import React from 'react';
import useBalance from '@/lib/hooks/useBalance';
import useStripeAccount from '@/lib/hooks/useStripeAccount';

interface BalanceIndicatorProps {
  showStatus?: boolean;
  className?: string;
}

const BalanceIndicator: React.FC<BalanceIndicatorProps> = ({
  showStatus = true,
  className = '',
}) => {
  const { availableBalance, formattedAvailableBalance, canWithdraw, withdrawalReasons } = useBalance();
  const { status, getStatusBadgeColor, getStatusMessage } = useStripeAccount();

  const badgeColor = getStatusBadgeColor();
  
  const badgeStyles = {
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
    <div className={`balance-indicator ${className}`}>
      {/* Balance Amount */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          canWithdraw ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <svg
            className={`w-5 h-5 ${canWithdraw ? 'text-green-600' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-600">Available Balance</p>
          <p className="text-xl font-bold text-gray-900">{formattedAvailableBalance}</p>
        </div>
      </div>

      {/* Status Badge */}
      {showStatus && status && (
        <div className="mt-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${badgeStyles[badgeColor]}`}>
            {badgeColor === 'success' && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {badgeColor === 'warning' && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {badgeColor === 'error' && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {badgeColor === 'info' && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="text-xs font-medium">{getStatusMessage()}</span>
          </div>
        </div>
      )}

      {/* Withdrawal Restrictions */}
      {!canWithdraw && withdrawalReasons.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-xs font-medium text-amber-900 mb-1">
                Withdrawal requirements:
              </p>
              <ul className="text-xs text-amber-800 space-y-1">
                {withdrawalReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceIndicator;
