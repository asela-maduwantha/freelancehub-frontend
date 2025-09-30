'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Feedback';
import { paymentService } from '@/lib/api/payments';
import { formatCurrency } from '@/lib/utils/formatting';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import type { UserPaymentStatsResponse, PaymentListItem } from '@/lib/api/payments';

interface PaymentStatsWidgetProps {
  userId: string;
  userType: 'client' | 'freelancer';
}

const PaymentStatsWidget: React.FC<PaymentStatsWidgetProps> = ({ userId, userType }) => {
  const [stats, setStats] = useState<UserPaymentStatsResponse | null>(null);
  const [recentPayments, setRecentPayments] = useState<PaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, [userId, userType]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch payment stats
      const paymentStats = await paymentService.getUserPaymentStats(userId, userType);
      setStats(paymentStats);

      // Fetch recent payments
      const paymentsResponse = await paymentService.getPayments({
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setRecentPayments(paymentsResponse.payments);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <span className="text-sm">Failed to load payment data</span>
        </div>
      </Card>
    );
  }

  const getPaymentIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {userType === 'client' ? 'Total Invested' : 'Funds Released'}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(stats.totalEarned || stats.totalSpent, stats.currency)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(stats.pendingPayments, stats.currency)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.completedPayments}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.failedPayments}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Payments
          </h3>
          <Link
            href="/dashboard/client/payments"
            className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentPayments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h4>
            <p className="mt-1 text-sm text-gray-500">
              Your payment transactions will appear here once you make payments.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-full ${getPaymentColor(payment.status)}`}>
                    {getPaymentIcon(payment.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {payment.paymentType} Payment
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentStatsWidget;