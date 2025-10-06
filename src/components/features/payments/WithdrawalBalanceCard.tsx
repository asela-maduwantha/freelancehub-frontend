'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils/withdrawal.utils';
import Button from '@/components/ui/Button/Button';

interface WithdrawalBalanceCardProps {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  onWithdrawClick: () => void;
  canWithdraw: boolean;
  withdrawDisabledReason?: string;
  isLoading?: boolean;
}

const WithdrawalBalanceCard: React.FC<WithdrawalBalanceCardProps> = ({
  availableBalance,
  pendingBalance,
  totalEarned,
  onWithdrawClick,
  canWithdraw,
  withdrawDisabledReason,
  isLoading = false,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-2xl">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32" />
      
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Balance Information */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-white/90 uppercase tracking-wide">
                  Available Balance
                </span>
              </div>
              
              {isLoading ? (
                <div className="h-16 w-64 bg-white/10 animate-pulse rounded-lg mb-4" />
              ) : (
                <div className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                  {formatCurrency(availableBalance)}
                </div>
              )}
              
              {/* Secondary Balances */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-white/70 font-medium">Pending</p>
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-24 bg-white/10 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(pendingBalance)}
                    </p>
                  )}
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <p className="text-xs text-white/70 font-medium">Total Earned</p>
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-24 bg-white/10 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(totalEarned)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Button Section */}
          <div className="lg:text-right space-y-3">
            <Button
              onClick={onWithdrawClick}
              disabled={!canWithdraw || isLoading}
              variant={canWithdraw ? 'primary' : 'secondary'}
              size="lg"
              className={`w-full lg:w-auto min-w-[220px] ${
                canWithdraw 
                  ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5' 
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              } transition-all duration-200`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 font-semibold text-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Withdraw Funds
                </div>
              )}
            </Button>

            {!canWithdraw && withdrawDisabledReason && (
              <p className="text-xs text-amber-200 px-2">
                {withdrawDisabledReason}
              </p>
            )}

            {canWithdraw && availableBalance >= 10 && (
              <p className="text-xs text-white/70 px-2">
                2.9% + $0.30 fee • 1-3 business days
              </p>
            )}
          </div>
        </div>

        {/* Info Banner */}
        {pendingBalance > 0 && !isLoading && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-amber-400/20 backdrop-blur-sm rounded-xl border border-amber-400/30">
            <svg className="w-5 h-5 text-amber-200 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-white/90">
              <span className="font-semibold">{formatCurrency(pendingBalance)}</span> is locked in active contracts and will be available once completed.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalBalanceCard;