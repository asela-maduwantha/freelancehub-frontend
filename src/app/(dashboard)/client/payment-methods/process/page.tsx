'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { Card, CardBody } from '../../../../../components/ui/Card';
import { Spinner } from '../../../../../components/ui/Feedback';
import Button from '../../../../../components/ui/Button';
import { RootState } from '../../../../../store';
import { setPaymentProcessing, resetPaymentProcessing, clearContractCreationFlow } from '../../../../../store/slices/payments';
import { AppDispatch } from '../../../../../store';
import { stripePromise as globalStripePromise, getPaymentErrorMessage } from '../../../../../lib/stripe';
import { contractService } from '../../../../../lib/api/contracts';
import { PaymentBreakdownCard } from '../../../../../components/features/contracts/PaymentBreakdownCard';
import { calculatePlatformFee, calculateTotalClientCharge } from '../../../../../lib/utils/formatting';

export default function PaymentProcessingPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { contractCreationFlow, paymentProcessing, paymentMethods } = useSelector(
    (state: RootState) => state.payments
  );

  const [isProcessing, setIsProcessing] = useState(false);

  // Reset payment processing state and redirect if no contract creation flow
  useEffect(() => {
    if (!contractCreationFlow) {
      router.push('/client/dashboard');
      return;
    }

    dispatch(resetPaymentProcessing());
  }, [contractCreationFlow, router, dispatch]);

  const processPayment = async () => {
    if (!contractCreationFlow || isProcessing || paymentProcessing.status === 'processing') {
      return;
    }

    setIsProcessing(true);
    dispatch(setPaymentProcessing({ status: 'processing' }));

    try {
      const { contractData, selectedPaymentMethodId } = contractCreationFlow;

      if (!selectedPaymentMethodId) {
        throw new Error('No payment method selected');
      }

      const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
      if (!selectedMethod) {
        throw new Error('Selected payment method not found');
      }

      // Create contract (this also creates payment intent on backend)
      const createdContract = await contractService.createContract({
        ...contractData,
        paymentMethodId: selectedPaymentMethodId,
      });

      const contractId = createdContract._id;

      // Check if payment intent was created
      if (!createdContract.paymentIntent) {
        dispatch(setPaymentProcessing({
          status: 'failed',
          message: 'Contract created but payment setup failed. You can complete payment from the contract page.',
          contractId: contractId,
        }));
        setIsProcessing(false);
        return;
      }

      // Check if payment already succeeded (backend already processed it)
      if (createdContract.paymentIntent.status === 'succeeded' || createdContract.requiresPayment === false) {
        dispatch(setPaymentProcessing({
          status: 'success',
          message: 'Payment processed successfully!',
          contractId: createdContract._id,
        }));
        setIsProcessing(false);

        // Navigate to contract page after a short delay
        setTimeout(() => {
          dispatch(resetPaymentProcessing());
          dispatch(clearContractCreationFlow());
          router.push(`/client/contracts/${createdContract._id}`);
        }, 2000);
        return;
      }

      // Get Stripe instance for manual payment confirmation
      const stripe = await globalStripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const clientSecret = createdContract.paymentIntent.clientSecret;

      // Confirm the payment with the saved card
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: selectedMethod.stripePaymentMethodId,
        }
      );

      if (paymentError) {
        const errorMessage = getPaymentErrorMessage(paymentError);
        dispatch(setPaymentProcessing({
          status: 'failed',
          message: errorMessage,
          contractId: createdContract._id,
        }));
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        dispatch(setPaymentProcessing({
          status: 'success',
          message: 'Payment processed successfully!',
          contractId: createdContract._id,
        }));
        setIsProcessing(false);

        // Navigate to contract page after a short delay
        setTimeout(() => {
          dispatch(resetPaymentProcessing());
          dispatch(clearContractCreationFlow());
          router.push(`/client/contracts/${createdContract._id}`);
        }, 2000);
      } else {
        throw new Error('Payment was not completed. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Payment failed';
      
      // Handle duplicate contract error
      if (errorMessage.includes('already has a contract') || 
          errorMessage.includes('contract already exists') ||
          errorMessage.includes('job already has contract')) {
        
        dispatch(setPaymentProcessing({
          status: 'failed',
          message: 'This job already has a contract. Redirecting...',
        }));
        
        setTimeout(() => {
          router.push('/client/jobs');
        }, 2000);
        return;
      }
      
      dispatch(setPaymentProcessing({
        status: 'failed',
        message: errorMessage,
      }));
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    dispatch(resetPaymentProcessing());
    if (contractCreationFlow?.returnUrl) {
      router.push(contractCreationFlow.returnUrl);
    } else {
      router.push('/client/dashboard');
    }
  };

  const handleViewContract = () => {
    if (paymentProcessing.contractId) {
      dispatch(resetPaymentProcessing());
      dispatch(clearContractCreationFlow());
      router.push(`/client/contracts/${paymentProcessing.contractId}`);
    }
  };

  const handleRetry = () => {
    dispatch(resetPaymentProcessing());
    setIsProcessing(false);
  };

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card variant="default">
          <CardBody>
            {/* Initial Confirmation State */}
            {paymentProcessing.status === 'idle' && contractCreationFlow && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary bg-opacity-10 mb-6">
                  <svg
                    className="w-10 h-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Confirm Payment
                </h2>
                <p className="text-secondary mb-6">
                  Review your contract details and click below to process payment securely.
                </p>

                {/* Contract Summary */}
                {contractCreationFlow.contractData && (() => {
                  const contractAmount = contractCreationFlow.contractData.milestones?.reduce((sum: number, m: any) => sum + (m.amount || 0), 0) || 0;
                  const platformFee = calculatePlatformFee(contractAmount);
                  const totalCharge = calculateTotalClientCharge(contractAmount);
                  
                  return (
                    <div className="max-w-md mx-auto mb-6">
                      <h3 className="font-semibold text-lg mb-4 text-gray-800 text-center">Contract Summary</h3>
                      
                      {/* Payment Breakdown */}
                      <PaymentBreakdownCard
                        contractAmount={contractAmount}
                        variant="detailed"
                        showFreelancerNote={true}
                        className="mb-4"
                      />
                      
                      {/* Milestones Count */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Milestones</p>
                        <p className="font-semibold text-lg text-gray-700">
                          {contractCreationFlow.contractData.milestones?.length || 0}
                        </p>
                      </div>

                      {/* Timeline */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Start Date</p>
                          <p className="font-medium text-sm text-gray-800">
                            {contractCreationFlow.contractData.startDate ? 
                              new Date(contractCreationFlow.contractData.startDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              }) : 'Not set'}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">End Date</p>
                          <p className="font-medium text-sm text-gray-800">
                            {contractCreationFlow.contractData.endDate ? 
                              new Date(contractCreationFlow.contractData.endDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              }) : 'Not set'}
                          </p>
                        </div>
                      </div>

                      {/* Milestones Breakdown */}
                      {contractCreationFlow.contractData.milestones && contractCreationFlow.contractData.milestones.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Milestone Breakdown</p>
                          <div className="space-y-2">
                            {contractCreationFlow.contractData.milestones.map((milestone: any, index: number) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary bg-opacity-10 text-primary text-xs font-semibold">
                                    {index + 1}
                                  </span>
                                  <span className="text-gray-700 truncate max-w-[180px]" title={milestone.title}>
                                    {milestone.title}
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-800">
                                  ${milestone.amount?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment Method */}
                      {contractCreationFlow.selectedPaymentMethodId && paymentMethods.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="font-medium text-sm text-gray-800 capitalize">
                              {paymentMethods.find(m => m.id === contractCreationFlow.selectedPaymentMethodId)?.card.brand || 'Card'} 
                              {' '}••••{' '}
                              {paymentMethods.find(m => m.id === contractCreationFlow.selectedPaymentMethodId)?.card.last4 || '****'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    By confirming, you authorize the payment to be held in escrow until the work is completed.
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCancel}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={processPayment}
                    disabled={isProcessing}
                  >
                    Confirm & Pay
                  </Button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {paymentProcessing.status === 'processing' && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary bg-opacity-10 mb-6">
                  <Spinner size="lg" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">Processing Payment</h2>
                <p className="text-secondary mb-6">
                  Please wait while we securely process your payment...
                </p>
                <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Do not close this window or press the back button.
                  </p>
                </div>
              </div>
            )}

            {/* Success State */}
            {paymentProcessing.status === 'success' && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success bg-opacity-10 mb-6">
                  <svg
                    className="w-10 h-10 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-success mb-2">Payment Successful!</h2>
                <p className="text-secondary mb-6">
                  Your payment has been processed successfully. The contract has been created and
                  funds are now in escrow.
                </p>
                <div className="max-w-md mx-auto bg-success bg-opacity-10 border border-success rounded-lg p-4 mb-6">
                  <p className="text-sm text-success font-medium">
                    Thank you for your payment! You will be redirected to the contract page shortly.
                  </p>
                </div>
                {paymentProcessing.contractId && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleViewContract}
                  >
                    View Contract
                  </Button>
                )}
              </div>
            )}

            {/* Failed State */}
            {paymentProcessing.status === 'failed' && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error bg-opacity-10 mb-6">
                  <svg
                    className="w-10 h-10 text-error"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-error mb-2">Payment Failed</h2>
                <p className="text-secondary mb-6">
                  We were unable to process your payment. Please try again.
                </p>
                {paymentProcessing.message && (
                  <div className="max-w-md mx-auto bg-error bg-opacity-10 border border-error rounded-lg p-4 mb-6">
                    <p className="text-sm text-error">
                      <span className="font-medium">Error:</span> {paymentProcessing.message}
                    </p>
                  </div>
                )}
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  {!paymentProcessing.message?.includes('already has a contract') && (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleRetry}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}