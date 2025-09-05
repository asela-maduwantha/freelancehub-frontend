'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  User,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Receipt
} from 'lucide-react';
import Link from 'next/link';
import { paymentsService } from '@/lib/api/payments.service';
import { IPayment } from '@/lib/types';

export default function PaymentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [payment, setPayment] = useState<IPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadPayment();
    } else {
      router.push('/login');
    }
  }, [router, paymentId]);

  const loadPayment = async () => {
    try {
      setIsLoading(true);
      const response = await paymentsService.getPaymentById(paymentId);
      setPayment((response as any).data || response);
    } catch (error) {
      console.error('Failed to load payment:', error);
      setError('Failed to load payment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!payment) return;

    try {
      const blob = await paymentsService.downloadReceipt(payment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${payment.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      setError('Failed to download receipt');
    }
  };

  const handleRefund = async () => {
    if (!payment) return;

    try {
      await paymentsService.refundPayment(payment.id, 'Client requested refund');
      loadPayment(); // Reload to show updated status
    } catch (error) {
      console.error('Failed to process refund:', error);
      setError('Failed to process refund');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'processing': return <Clock className="h-5 w-5" />;
      case 'failed': return <AlertTriangle className="h-5 w-5" />;
      case 'refunded': return <AlertTriangle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payment</h2>
          <p className="text-gray-600 mb-4">{error || 'Payment not found'}</p>
          <Button onClick={() => router.push('/client/payments')} className="bg-green-600 hover:bg-green-700">
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/client/payments" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Back to Payments</span>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Payment Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment #{payment.id.slice(-8)}</h1>
              <p className="text-gray-600">{payment.contract?.title || 'Unknown Project'}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(payment.status)}`}>
              {getStatusIcon(payment.status)}
              <span className="capitalize">{payment.status}</span>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(payment.netAmount)}</p>
              <p className="text-sm text-gray-600">Net to Freelancer</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{formatCurrency(payment.platformFee)}</p>
              <p className="text-sm text-gray-600">Platform Fee</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">PAYMENT DETAILS</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-medium">{payment.id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{payment.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">{payment.paymentMethod || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(payment.createdAt)}</span>
                    </div>
                    {payment.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium">{formatDate(payment.completedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">PARTIES</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 text-sm">Freelancer</p>
                      <p className="font-medium">
                        {payment.freelancer?.firstName} {payment.freelancer?.lastName}
                      </p>
                      {payment.freelancer?.rating && (
                        <p className="text-sm text-yellow-600">★ {payment.freelancer.rating} rating</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Client</p>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Milestone Information */}
            {payment.milestone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Milestone Information</h2>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{payment.milestone.title}</h3>
                  <p className="text-gray-600 mb-3">{payment.milestone.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Milestone completed
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Escrow Information */}
            {payment.escrowStatus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Escrow Status</h2>

                <div className={`p-4 rounded-lg ${
                  payment.escrowStatus === 'held' ? 'bg-yellow-50 border border-yellow-200' :
                  payment.escrowStatus === 'released' ? 'bg-green-50 border border-green-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Shield className={`h-5 w-5 ${
                      payment.escrowStatus === 'held' ? 'text-yellow-600' :
                      payment.escrowStatus === 'released' ? 'text-green-600' :
                      'text-red-600'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        Funds {payment.escrowStatus}
                      </p>
                      <p className="text-sm text-gray-600">
                        {payment.escrowStatus === 'held' && 'Funds are being held in escrow for protection'}
                        {payment.escrowStatus === 'released' && 'Funds have been released to the freelancer'}
                        {payment.escrowStatus === 'disputed' && 'Payment is under dispute'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>

              <div className="space-y-3">
                {payment.receipt && (
                  <Button
                    onClick={handleDownloadReceipt}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Freelancer
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Contract
                </Button>

                {payment.status === 'completed' && payment.escrowStatus === 'held' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleRefund}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Request Refund
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Payment Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Created</p>
                    <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
                  </div>
                </div>

                {payment.completedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Payment Completed</p>
                      <p className="text-sm text-gray-600">{formatDate(payment.completedAt)}</p>
                    </div>
                  </div>
                )}

                {payment.releasedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Funds Released</p>
                      <p className="text-sm text-gray-600">{formatDate(payment.releasedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
