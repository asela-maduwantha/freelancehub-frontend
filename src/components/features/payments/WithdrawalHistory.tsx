/**
 * WithdrawalHistory - Legacy Component
 * This component is deprecated. Use WithdrawalHistoryTable instead.
 * Kept for backward compatibility.
 */

import React from 'react';
import WithdrawalHistoryTable from './WithdrawalHistoryTable';
import { Withdrawal } from '@/types/withdrawals';

interface WithdrawalHistoryProps {
  withdrawals?: Withdrawal[];
  onViewDetails?: (withdrawal: Withdrawal) => void;
}

export const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({
  withdrawals = [],
  onViewDetails,
}) => {
  return (
    <div>
      <WithdrawalHistoryTable
        withdrawals={withdrawals}
        onViewDetails={onViewDetails || (() => {})}
      />
    </div>
  );
};

export default WithdrawalHistory;
