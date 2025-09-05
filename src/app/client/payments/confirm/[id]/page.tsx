'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  Shield,
  DollarSign,
  User,
  FileText,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { paymentsService } from '@/lib/api/payments.service';
import { IPaymentConfirmation } from '@/lib/types';

export default function PaymentConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const paymentIntentId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [confirmation, setConfirmation] = useState<IPaymentConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      // For demo purposes, create mock confirmation data
      setConfirmation({
        paymentId: paymentIntentId,
        status: 'pending',
        amount: 525,
        fees: 25,
        netAmount: 500,
        escrowHeld: true,
        autoReleaseAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      setIsLoading(false);
    } else {
      router.push('/login');
    }
  }, [router, paymentIntentId]);

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update confirmation status
      setConfirmation(prev => prev ? {
        ...prev,
        status: 'completed'
      } : null);

    } catch (error) {
      console.error('Payment failed:', error);
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!confirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Not Found</h2>
          <p className="text-gray-600 mb-4">The payment confirmation could not be loaded.</p>
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
              <ArrowRight className="h-5 w-5 text-gray-600 rotate-180" />
              <span className="text-gray-900">Back to Payments</span>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success/Error State */}
        {confirmation.status === 'completed' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Your payment has been processed successfully.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Payment ID</p>
                  <p className="font-medium">{confirmation.paymentId.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Amount Paid</p>
                  <p className="font-medium text-green-600">{formatCurrency(confirmation.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Platform Fee</p>
                  <p className="font-medium text-red-600">{formatCurrency(confirmation.fees)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Net to Freelancer</p>
                  <p className="font-medium text-blue-600">{formatCurrency(confirmation.netAmount)}</p>
                </div>
              </div>
            </div>

            {confirmation.escrowHeld && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-yellow-800">Funds Held in Escrow</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your payment is being held in escrow for protection.
                      {confirmation.autoReleaseAt && ` It will be automatically released on ${formatDate(confirmation.autoReleaseAt)}.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={() => router.push('/client/payments')}
                variant="outline"
                className="flex-1"
              >
                View All Payments
              </Button>
              <Button
                onClick={() => router.push(`/client/payments/${confirmation.paymentId}`)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                View Details
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Payment Processing State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Payment</h1>
              <p className="text-gray-600">Review the details below and confirm your payment.</p>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Milestone Amount:</span>
                  <span className="font-medium">{formatCurrency(confirmation.amount - confirmation.fees)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (5%):</span>
                  <span className="font-medium text-red-600">+{formatCurrency(confirmation.fees)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">{formatCurrency(confirmation.amount)}</span>
                </div>
              </div>
            </div>

            {/* Escrow Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-blue-800">Escrow Protection</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Your funds will be held in escrow until the work is completed and approved.
                    This protects both you and the freelancer.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={() => router.push('/client/payments/create')}
                variant="outline"
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <DollarSign className="h-5 w-5 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
