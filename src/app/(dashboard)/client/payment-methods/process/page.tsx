'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { Card, CardBody } from '../../../../../components/ui/Card';
import { Spinner } from '../../../../../components/ui/Feedback';
import Button from '../../../../../components/ui/Button';
import { RootState } from '../../../../../store';
import { setPaymentProcessing, resetPaymentProcessing, clearContractCreationFlow } from '../../../../../store/slices/payments';
import { AppDispatch } from '../../../../../store';
import { stripePromise as globalStripePromise, getPaymentErrorMessage } from '../../../../../lib/stripe';
import { contractService } from '../../../../../lib/api/contracts';

export default function PaymentProcessingPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { contractCreationFlow, paymentProcessing, paymentMethods } = useSelector(
    (state: RootState) => state.payments
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Redirect if no contract creation flow
    if (!contractCreationFlow) {
      router.push('/client/dashboard');
      return;
    }

    // Prevent multiple executions
    if (hasProcessed) return;
    setHasProcessed(true);

    // Start payment processing
    processPayment();
  }, [contractCreationFlow]); // Add dependency

  const processPayment = async () => {
    if (!contractCreationFlow) return;

    setIsProcessing(true);
    dispatch(setPaymentProcessing({ status: 'processing' }));

    try {
      const { contractData, selectedPaymentMethodId } = contractCreationFlow;

      if (!selectedPaymentMethodId) {
        throw new Error('No payment method selected');
      }

      // Find the selected payment method
      const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
      if (!selectedMethod) {
        throw new Error('Selected payment method not found');
      }

      // Create contract (this also creates payment intent on backend)
      const createdContract = await contractService.createContract({
        ...contractData,
        paymentMethodId: selectedPaymentMethodId,
      });

      // Store contract ID immediately for error recovery
      const contractId = createdContract._id;

      // Check if payment intent was created
      if (!createdContract.stripePaymentIntentId || !createdContract.paymentIntent) {
        // Contract created but payment failed - allow retry from contract page
        dispatch(setPaymentProcessing({
          status: 'failed',
          message: 'Contract created but payment setup failed. You can complete payment from the contract page.',
          contractId: contractId,
        }));
        setIsProcessing(false);
        return;
      }

      // Get Stripe instance
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
        // Payment successful
        dispatch(setPaymentProcessing({
          status: 'success',
          message: 'Payment processed successfully!',
          contractId: createdContract._id,
        }));
        setIsProcessing(false);

        // Navigate to contract/job tracking page after a short delay
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
      
      // Check for duplicate contract error
      if (errorMessage.includes('already has a contract') || 
          errorMessage.includes('contract already exists')) {
        // Contract was created but payment failed
        // Try to extract contract ID from error or state
        dispatch(setPaymentProcessing({
          status: 'failed',
          message: 'This job already has a contract. Redirecting...',
        }));
        
        // Redirect to jobs page after a delay
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

  const handleRetry = () => {
    router.push('/client/payment-methods/select');
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

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card variant="default">
          <CardBody>
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
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleRetry}
                  >
                    Try Again
                  </Button>
                </div>
                {paymentProcessing.contractId && (
                  <div className="mt-4">
                    <p className="text-sm text-secondary mb-2">
                      The contract was created but payment failed. You can complete payment from the contract page.
                    </p>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleViewContract}
                    >
                      View Contract
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
