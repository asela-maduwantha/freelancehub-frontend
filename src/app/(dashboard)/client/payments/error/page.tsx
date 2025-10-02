'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { formatCurrency } from '@/lib/utils/formatting';
import {
  XCircle,
  RefreshCw,
  ArrowRight,
  Home,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

const PaymentErrorPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorDetails, setErrorDetails] = useState<any>(null);

  useEffect(() => {
    // Parse error details from URL params
    const error = searchParams.get('error');
    const paymentId = searchParams.get('payment_id');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');

    setErrorDetails({
      message: error || 'An unexpected error occurred during payment processing.',
      paymentId,
      amount: amount ? parseFloat(amount) : null,
      currency
    });
  }, [searchParams]);

  const getErrorTitle = (error: string) => {
    if (error.includes('card_declined')) return 'Card Declined';
    if (error.includes('insufficient_funds')) return 'Insufficient Funds';
    if (error.includes('expired_card')) return 'Expired Card';
    if (error.includes('incorrect_cvc')) return 'Invalid CVC';
    return 'Payment Failed';
  };

  const getErrorSuggestion = (error: string) => {
    if (error.includes('card_declined')) {
      return 'Please check with your bank or try a different payment method.';
    }
    if (error.includes('insufficient_funds')) {
      return 'Please ensure your account has sufficient funds or try a different payment method.';
    }
    if (error.includes('expired_card')) {
      return 'Please update your card details or try a different payment method.';
    }
    if (error.includes('incorrect_cvc')) {
      return 'Please check your card\'s CVC code and try again.';
    }
    return 'Please try again or contact support if the problem persists.';
  };

  return (
    <DashboardLayout userRole="client">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Error Icon */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {errorDetails ? getErrorTitle(errorDetails.message) : 'Payment Failed'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We couldn't process your payment. Don't worry - no charges have been made to your account.
            </p>
          </div>

          {/* Error Details */}
          {errorDetails && (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-900">Error Details</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-red-700">
                    {errorDetails.message}
                  </p>

                  <p className="text-sm text-gray-600">
                    {getErrorSuggestion(errorDetails.message)}
                  </p>

                  {errorDetails.amount && errorDetails.currency && (
                    <div className="flex justify-between text-sm pt-2 border-t border-red-200">
                      <span className="text-gray-600">Attempted Amount</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(errorDetails.amount, errorDetails.currency)}
                      </span>
                    </div>
                  )}

                  {errorDetails.paymentId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reference ID</span>
                      <span className="font-mono text-xs text-gray-500">
                        {errorDetails.paymentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Payment Again
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/client/payments">
                <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  View Payments
                </Button>
              </Link>

              <Link href="/(dashboard)/client">
                <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Help Information */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-center">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Need Help?
              </h4>
              <p className="text-xs text-blue-700">
                If you're experiencing repeated payment issues, please contact our support team.
                We're here to help resolve any payment-related concerns.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const PaymentErrorPage: React.FC = () => {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    }>
      <PaymentErrorPageContent />
    </Suspense>
  );
};

export default PaymentErrorPage;