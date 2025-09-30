'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { formatCurrency } from '@/lib/utils/formatting';
import {
  CheckCircle,
  ArrowRight,
  Download,
  Home,
  CreditCard,
  FileText
} from 'lucide-react';

const PaymentSuccessPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Parse payment details from URL params
    const paymentId = searchParams.get('payment_id');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');

    if (paymentId && amount && currency) {
      setPaymentDetails({
        id: paymentId,
        amount: parseFloat(amount),
        currency
      });
    }
  }, [searchParams]);

  return (
    <DashboardLayout userRole="client">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Success Icon */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Payment Successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your payment has been processed successfully. The freelancer will be notified and work can begin.
            </p>
          </div>

          {/* Payment Details */}
          {paymentDetails && (
            <Card className="p-6 border-green-200 bg-green-50">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Payment Details</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono text-xs text-gray-500">
                      {paymentDetails.id}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date</span>
                    <span className="text-gray-900">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/dashboard/client/payments">
              <Button className="w-full flex items-center justify-center gap-2">
                <FileText className="h-4 w-4" />
                View Payment History
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" className="flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>

              <Link href="/dashboard/client">
                <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Additional Information */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              A confirmation email has been sent to your registered email address.
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const PaymentSuccessPage: React.FC = () => {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    }>
      <PaymentSuccessPageContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;