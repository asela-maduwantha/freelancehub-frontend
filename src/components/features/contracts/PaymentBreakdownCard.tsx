import React from 'react';
import { Card, CardHeader, CardBody } from '../../ui/Card';
import { formatCurrency, getPaymentBreakdown } from '../../../lib/utils/formatting';

interface PaymentBreakdownCardProps {
  contractAmount: number;
  currency?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showFreelancerNote?: boolean;
  className?: string;
}

export function PaymentBreakdownCard({
  contractAmount,
  currency = 'USD',
  variant = 'default',
  showFreelancerNote = true,
  className = '',
}: PaymentBreakdownCardProps) {
  const breakdown = getPaymentBreakdown(contractAmount, currency);

  if (variant === 'compact') {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Contract Amount:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(breakdown.contractAmount, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Platform Fee (10%):</span>
            <span className="font-semibold text-gray-900">
              +{formatCurrency(breakdown.platformFeeAmount, currency)}
            </span>
          </div>
          <div className="border-t border-blue-300 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-900">Total Charge:</span>
              <span className="font-bold text-blue-900 text-lg">
                {formatCurrency(breakdown.totalClientCharge, currency)}
              </span>
            </div>
          </div>
          {showFreelancerNote && (
            <div className="pt-2 border-t border-blue-300">
              <p className="text-xs text-blue-800">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                The freelancer will receive {formatCurrency(breakdown.contractAmount, currency)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card variant="default" className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-primary">Payment Details</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {/* Breakdown Items */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Contract Amount</div>
                  <div className="text-sm text-gray-600">Payment to freelancer</div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(breakdown.contractAmount, currency)}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <div className="font-medium text-blue-900">Platform Fee</div>
                  <div className="text-sm text-blue-700">{breakdown.platformFeePercentage}% service charge</div>
                </div>
                <div className="text-lg font-semibold text-blue-900">
                  +{formatCurrency(breakdown.platformFeeAmount, currency)}
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-bold text-primary">Total Charge</div>
                  <div className="text-sm text-gray-600">Amount to be charged</div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(breakdown.totalClientCharge, currency)}
                </div>
              </div>
            </div>

            {/* Info Notice */}
            {showFreelancerNote && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Secure Escrow Payment</h4>
                    <p className="text-sm text-green-800">
                      The freelancer will receive {formatCurrency(breakdown.contractAmount, currency)}. 
                      Funds are held securely in escrow and released when you approve completed milestones.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Payment Breakdown
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Contract Amount:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(breakdown.contractAmount, currency)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Platform Fee ({breakdown.platformFeePercentage}%):</span>
          <span className="font-semibold text-gray-900">
            +{formatCurrency(breakdown.platformFeeAmount, currency)}
          </span>
        </div>
        <div className="border-t border-gray-300 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Charge:</span>
            <span className="font-bold text-primary text-lg">
              {formatCurrency(breakdown.totalClientCharge, currency)}
            </span>
          </div>
        </div>
        {showFreelancerNote && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              The freelancer will receive {formatCurrency(breakdown.contractAmount, currency)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
