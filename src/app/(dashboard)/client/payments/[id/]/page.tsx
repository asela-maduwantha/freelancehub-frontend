'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Feedback';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { paymentService } from '@/lib/api/payments';
import { formatCurrency } from '@/lib/utils/formatting';
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Building,
  Download,
  RefreshCw
} from 'lucide-react';
import type { PaymentResponse } from '@/lib/api/payments';

const PaymentDetailsPage: React.FC = () => {
  const params = useParams();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const paymentData = await paymentService.getPayment(paymentId);
      setPayment(paymentData);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !payment) {
    return (
      <DashboardLayout userRole="client">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{error || 'Payment not found'}</span>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
              <p className="text-sm text-gray-600 mt-1">
                Transaction ID: {payment.id}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
            {payment.status === 'failed' && (
              <Button className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Payment
              </Button>
            )}
          </div>
        </div>

        {/* Status Card */}
        <Card className={`p-6 border-2 ${getStatusColor(payment.status)}`}>
          <div className="flex items-center gap-4">
            {getStatusIcon(payment.status)}
            <div>
              <h3 className="text-lg font-semibold">
                Payment {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </h3>
              <p className="text-sm mt-1">
                {payment.status === 'completed' && 'Your payment has been processed successfully.'}
                {payment.status === 'processing' && 'Your payment is being processed.'}
                {payment.status === 'failed' && `Payment failed: ${payment.errorMessage || 'Unknown error'}`}
                {payment.status === 'refunded' && 'This payment has been refunded.'}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="font-medium">{formatCurrency(payment.amount, payment.currency)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Platform Fee</span>
                <span className="font-medium">{formatCurrency(payment.platformFee, payment.currency)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Processing Fee</span>
                <span className="font-medium">{formatCurrency(payment.stripeFee, payment.currency)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Freelancer Amount</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(payment.freelancerAmount, payment.currency)}
                </span>
              </div>

              <hr className="border-gray-200" />

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Type</span>
                <span className="font-medium capitalize">{payment.paymentType}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Currency</span>
                <span className="font-medium">{payment.currency.toUpperCase()}</span>
              </div>
            </div>
          </Card>

          {/* Transaction Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transaction Details
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transaction ID</span>
                <span className="font-mono text-sm">{payment.id}</span>
              </div>

              {payment.stripePaymentIntentId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stripe Payment Intent</span>
                  <span className="font-mono text-sm">{payment.stripePaymentIntentId}</span>
                </div>
              )}

              {payment.stripeChargeId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stripe Charge ID</span>
                  <span className="font-mono text-sm">{payment.stripeChargeId}</span>
                </div>
              )}

              {payment.stripeTransferId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stripe Transfer ID</span>
                  <span className="font-mono text-sm">{payment.stripeTransferId}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm">
                  {new Date(payment.createdAt).toLocaleString()}
                </span>
              </div>

              {payment.completedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm">
                    {new Date(payment.completedAt).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm">
                  {new Date(payment.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Contract Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Contract Information
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Contract ID</span>
                <span className="font-mono text-sm">{payment.contractId}</span>
              </div>

              {payment.milestoneId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Milestone ID</span>
                  <span className="font-mono text-sm">{payment.milestoneId}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Parties Involved */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Parties Involved
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payer (Client)</span>
                <span className="font-mono text-sm">{payment.payerId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payee (Freelancer)</span>
                <span className="font-mono text-sm">{payment.payeeId}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentDetailsPage;