/**
 * WithdrawalRequestForm - Legacy Component
 * This component is deprecated. Use CreateWithdrawalModal instead.
 * Kept for backward compatibility.
 */

import React from 'react';
import CreateWithdrawalModal from './CreateWithdrawalModal';

interface WithdrawalRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const WithdrawalRequestForm: React.FC<WithdrawalRequestFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    setIsOpen(false);
  };

  const handleClose = () => {
    if (onCancel) onCancel();
    setIsOpen(false);
  };

  // This is a legacy wrapper - requires actual balance and stripe account data
  // For now, we'll just show a deprecation message
  return (
    <div className="p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        Component Deprecated
      </h3>
      <p className="text-yellow-700 dark:text-yellow-300">
        WithdrawalRequestForm is deprecated. Please use CreateWithdrawalModal directly
        with proper availableBalance and stripeAccountId props, or navigate to /freelancer/withdrawals
        for the full withdrawal management interface.
      </p>
    </div>
  );
};

export default WithdrawalRequestForm;
