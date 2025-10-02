'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, STRIPE_CONFIG } from '@/lib/stripe';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { StripePaymentForm } from '@/components/features/payments/StripePaymentForm';
import { PaymentBreakdown } from '@/components/features/payments/PaymentBreakdown';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';
import { contractService, ContractResponse } from '@/lib/api/contracts';
import Button from '@/components/ui/Button';
import { ArrowLeft, AlertCircle, Loader } from 'lucide-react';

const ContractPaymentPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const { paymentMethods, isLoading: methodsLoading } = usePaymentMethods();
  const [contract, setContract] = useState<ContractResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);

  // Fetch contract from API
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch contract data from backend
        const contractData = await contractService.getContract(contractId);
        
        // Verify contract is in a payable state
        if (contractData.status === 'completed' || contractData.status === 'cancelled') {
          setError('This contract is no longer available for payment');
          return;
        }
        
        setContract(contractData);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err.message || 'Failed to load contract details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  const handlePaymentSuccess = (paymentId: string) => {
    // Redirect to success page with backend payment ID for verification
    // Success page will poll backend to verify webhook has completed
    router.push(`/client/payments/success?payment_id=${paymentId}&contract_id=${contractId}`);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handleCancel = () => {
    router.push(`/client/contracts/${contractId}`);
  };

  if (loading || methodsLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader className="w-6 h-6 animate-spin" />
            <span>Loading payment details...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Contract not found'}
            </h2>
            <Button onClick={() => router.push('/contracts')}>
              Back to Contracts
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-all mb-4"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Contract</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Make Payment</h1>
            <p className="mt-2 text-gray-600">
              Complete payment for: {contract.title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <Elements stripe={stripePromise} options={STRIPE_CONFIG.elementsOptions}>
              <StripePaymentForm
                contractId={contract._id}
                amount={contract.totalAmount}
                currency={contract.currency}
                description={`Payment for contract: ${contract.title}`}
                savedMethods={paymentMethods}
                selectedMethod={selectedMethod}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handleCancel}
              />
            </Elements>
          </div>

          {/* Payment Breakdown */}
          <div>
            <PaymentBreakdown
              contractAmount={contract.totalAmount / 100} // Convert cents to dollars
              platformFeePercentage={contract.platformFeePercentage}
              currency={contract.currency}
              showFreelancerAmount={true}
            />

            {/* Contract Details */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contract Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract ID</span>
                  <span className="font-mono text-sm text-gray-900">
                    {contract._id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {contract.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency</span>
                  <span className="text-gray-900">{contract.currency}</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Secure Payment
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    Your payment is processed securely by Stripe. Funds are held safely until work is completed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContractPaymentPage;