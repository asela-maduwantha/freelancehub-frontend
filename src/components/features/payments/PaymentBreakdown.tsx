import React from 'react';
import { formatCurrency } from '@/lib/utils/formatting';

interface PaymentBreakdownProps {
  contractAmount: number;
  platformFeePercentage: number;
  platformFeeAmount?: number; // Optional override
  currency?: string;
  showFreelancerAmount?: boolean;
  className?: string;
}

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({
  contractAmount,
  platformFeePercentage,
  platformFeeAmount,
  currency = 'USD',
  showFreelancerAmount = true,
  className = ''
}) => {
  // Calculate platform fee if not provided
  const calculatedPlatformFee = platformFeeAmount ??
    (contractAmount * platformFeePercentage) / 100;

  const totalAmount = contractAmount + calculatedPlatformFee;
  const freelancerAmount = contractAmount; // Freelancer gets the contract amount after platform fee

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Payment Summary
      </h3>

      <div className="space-y-3">
        {/* Contract Amount */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Contract Amount</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(contractAmount, currency)}
          </span>
        </div>

        {/* Platform Fee */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            Platform Fee ({platformFeePercentage}%)
          </span>
          <span className="font-medium text-gray-900">
            {formatCurrency(calculatedPlatformFee, currency)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Total Amount */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total to Pay</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(totalAmount, currency)}
          </span>
        </div>

        {/* Freelancer Amount */}
        {showFreelancerAmount && (
          <>
            <div className="border-t border-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Freelancer Receives</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(freelancerAmount, currency)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Security Note */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-2 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Secure payment powered by Stripe
        </div>
      </div>
    </div>
  );
};

export { PaymentBreakdown };