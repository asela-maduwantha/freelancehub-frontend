'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { usePaymentVerification } from '@/lib/hooks/usePaymentVerification';
import { formatCurrency } from '@/lib/utils/formatting';
import {
  CheckCircle,
  ArrowRight,
  Download,
  Home,
  CreditCard,
  FileText,
  Mail,
  Clock,
  CheckCircle2,
  Loader,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const PaymentSuccessPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [contractDetails, setContractDetails] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [countdown, setCountdown] = useState(10); // 10 seconds countdown

  // Get paymentId from URL params
  const paymentId = searchParams.get('payment_id');
  const contractId = searchParams.get('contract_id');

  // Use the payment verification hook to poll backend status
  // Backend webhook may take a few seconds to process the Stripe event
  const {
    payment,
    isVerifying,
    isCompleted,
    isFailed,
    error,
    refetch
  } = usePaymentVerification({
    paymentId: paymentId,
    enabled: !!paymentId,
    pollInterval: 2000, // Poll every 2 seconds
    maxAttempts: 30 // Try for up to 60 seconds
  });

  // Auto-navigate to contract page after successful payment
  useEffect(() => {
    if (isCompleted && contractId && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isCompleted && contractId && countdown === 0) {
      router.push(`/client/contracts/${contractId}`);
    }
  }, [isCompleted, contractId, countdown, router]);

  useEffect(() => {
    const initializePage = async () => {
      try {
        if (contractId) {
          // Mock contract details - in real app, fetch from API
          const mockContractDetails = {
            id: contractId,
            title: 'Build a Real Estate Platform',
            freelancerName: 'John Doe',
            freelancerId: 'freelancer123'
          };
          setContractDetails(mockContractDetails);
        }
      } catch (error) {
        console.error('Failed to load contract details:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    initializePage();
  }, [contractId]);

  // Loading state
  if (initialLoading || !paymentId) {
    return (
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Verifying payment status (waiting for backend webhook to complete)
  if (isVerifying) {
    return (
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Verifying Payment...
            </h2>
            <p className="text-gray-600 mb-4">
              Please wait while we confirm your payment with our payment processor.
              This usually takes just a few seconds.
            </p>
            <div className="text-sm text-gray-500">
              Do not close this window
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Payment failed
  if (isFailed || error) {
    return (
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'We could not verify your payment status. Please check your payment history or contact support.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => refetch()} variant="secondary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Link href="/client/payments">
                <Button>
                  View Payment History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Payment completed successfully
  if (!isCompleted || !payment) {
    return (
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Format payment details from backend response
  const paymentDetails = {
    id: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: 'Card Payment', // Could be extracted from Stripe data
    date: new Date(payment.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: new Date(payment.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    completedAt: payment.completedAt ? new Date(payment.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : null
  };

  return (
    <DashboardLayout userRole="client">
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Your payment has been processed successfully. The freelancer has been notified and work will begin as per the contract terms.
            </p>
          </div>

          {/* Payment Details Card */}
          {paymentDetails && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" />
                  Payment Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Amount Paid
                      </label>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(paymentDetails.amount / 100, paymentDetails.currency)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Payment Method
                      </label>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{paymentDetails.paymentMethod}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Payment ID
                      </label>
                      <div className="font-mono text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {paymentDetails.id}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Date & Time
                      </label>
                      <div className="text-gray-900">
                        <div>{paymentDetails.date}</div>
                        <div className="text-sm text-gray-500">{paymentDetails.time}</div>
                      </div>
                    </div>

                    {contractDetails && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Contract
                          </label>
                          <div className="text-gray-900">{contractDetails.title}</div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Freelancer
                          </label>
                          <div className="text-gray-900">{contractDetails.freelancerName}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Confirmation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Receipt sent to your email
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  A detailed receipt and payment confirmation has been sent to your registered email address.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link href={`/contracts/${contractDetails?.id}`}>
              <Button className="w-full flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                View Contract
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/(dashboard)/client/payments">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Payment History
              </Button>
            </Link>
          </div>

          {/* What's Next Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What happens next?
            </h3>

            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Freelancer notified</p>
                  <p className="text-sm text-gray-600">The freelancer has been automatically notified about your payment.</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Work begins</p>
                  <p className="text-sm text-gray-600">Work will begin according to the contract timeline and milestones.</p>
                </div>
              </div>

              <div className="flex items-start">
                <FileText className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Track progress</p>
                  <p className="text-sm text-gray-600">You can track progress and communicate with the freelancer through the contract dashboard.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-navigation Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-blue-800 mb-2">
                You will be automatically redirected to your contract in <span className="font-semibold">{countdown}</span> seconds.
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contractId && (
              <Link href={`/client/contracts/${contractId}`}>
                <Button className="w-full flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  View Contract
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}

            <Link href="/client/payments">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                View All Payments
              </Button>
            </Link>

            <Link href="/(dashboard)/client">
              <Button variant="ghost" className="w-full flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const PaymentSuccessPage: React.FC = () => {
  return (
    <Suspense fallback={
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    }>
      <PaymentSuccessPageContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;