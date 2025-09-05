'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Settings,
  Repeat
} from 'lucide-react';
import Link from 'next/link';
import { IRecurringPayment } from '@/lib/types';

export default function RecurringPaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [recurringPayments, setRecurringPayments] = useState<IRecurringPayment[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedContract, setSelectedContract] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'bi-weekly'>('weekly');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'wallet'>('stripe');
  const [autoRelease, setAutoRelease] = useState(true);
  const [autoReleaseDays, setAutoReleaseDays] = useState(7);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadRecurringPayments();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadRecurringPayments = async () => {
    try {
      // Mock data for demonstration
      const mockPayments: IRecurringPayment[] = [
        {
          id: '1',
          contractId: '1',
          contractTitle: 'Website Development Project',
          freelancerId: '1',
          freelancerName: 'John Doe',
          amount: 500,
          frequency: 'weekly',
          nextPaymentDate: '2024-01-15',
          paymentMethod: 'stripe',
          status: 'active',
          autoRelease: true,
          autoReleaseDays: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalPayments: 5,
          failedPayments: 0
        },
        {
          id: '2',
          contractId: '2',
          contractTitle: 'Mobile App Development',
          freelancerId: '2',
          freelancerName: 'Jane Smith',
          amount: 800,
          frequency: 'monthly',
          nextPaymentDate: '2024-02-01',
          paymentMethod: 'wallet',
          status: 'active',
          autoRelease: false,
          autoReleaseDays: 14,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalPayments: 3,
          failedPayments: 1
        }
      ];
      setRecurringPayments(mockPayments);
    } catch (error) {
      console.error('Failed to load recurring payments:', error);
      setError('Failed to load recurring payments');
    }
  };

  const handleCreateRecurringPayment = async () => {
    if (!selectedContract || !amount) return;

    setIsLoading(true);
    setError(null);

    try {
      // Mock API call
      const newPayment: IRecurringPayment = {
        id: Date.now().toString(),
        contractId: selectedContract,
        contractTitle: 'New Contract', // Would come from API
        freelancerId: '1', // Would come from API
        freelancerName: 'Freelancer Name', // Would come from API
        amount,
        frequency,
        nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod,
        status: 'active',
        autoRelease,
        autoReleaseDays,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalPayments: 0,
        failedPayments: 0
      };

      setRecurringPayments(prev => [...prev, newPayment]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create recurring payment:', error);
      setError('Failed to create recurring payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePausePayment = (id: string) => {
    setRecurringPayments(payments =>
      payments.map(payment =>
        payment.id === id
          ? { ...payment, status: payment.status === 'active' ? 'paused' : 'active' }
          : payment
      )
    );
  };

  const handleDeletePayment = (id: string) => {
    setRecurringPayments(payments => payments.filter(payment => payment.id !== id));
  };

  const resetForm = () => {
    setSelectedContract('');
    setAmount(0);
    setFrequency('weekly');
    setPaymentMethod('stripe');
    setAutoRelease(true);
    setAutoReleaseDays(7);
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'bi-weekly': return 'Bi-weekly';
      default: return freq;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recurring Payments</h1>
            <p className="text-gray-600">Set up automatic payments for ongoing contracts</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Setup Recurring Payment
          </Button>
        </div>

        {/* Recurring Payments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {recurringPayments.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Repeat className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{payment.contractTitle}</h3>
                    <p className="text-sm text-gray-600">{payment.freelancerName}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  payment.status === 'active' ? 'bg-green-100 text-green-800' :
                  payment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {payment.status}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="font-medium">{getFrequencyLabel(payment.frequency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next Payment:</span>
                  <span className="font-medium">{formatDate(payment.nextPaymentDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{payment.paymentMethod}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePausePayment(payment.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {payment.status === 'active' ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  onClick={() => handleDeletePayment(payment.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {recurringPayments.length === 0 && (
          <div className="text-center py-12">
            <Repeat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recurring Payments</h3>
            <p className="text-gray-600 mb-6">Set up automatic payments for your ongoing contracts</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Setup Your First Recurring Payment
            </Button>
          </div>
        )}

        {/* Create Recurring Payment Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-md w-full mx-4"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Setup Recurring Payment</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract
                  </label>
                  <select
                    value={selectedContract}
                    onChange={(e) => setSelectedContract(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a contract</option>
                    <option value="1">Website Development Project</option>
                    <option value="2">Mobile App Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="500.00"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="stripe">Stripe</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoRelease"
                    checked={autoRelease}
                    onChange={(e) => setAutoRelease(e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoRelease" className="text-sm font-medium text-gray-700">
                    Enable Auto-Release
                  </label>
                </div>

                {autoRelease && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-Release After (Days)
                    </label>
                    <select
                      value={autoReleaseDays}
                      onChange={(e) => setAutoReleaseDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value={1}>1 day</option>
                      <option value={3}>3 days</option>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                    </select>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRecurringPayment}
                    disabled={isLoading || !selectedContract || !amount}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Setup Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
