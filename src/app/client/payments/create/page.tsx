'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Shield,
  CheckCircle,
  AlertCircle,
  Calculator,
  User,
  FileText,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { paymentsService } from '@/lib/api/payments.service';
import { ICreatePaymentRequest, IPaymentIntent } from '@/lib/types';

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'approved';
  completedAt?: string;
}

interface Contract {
  id: string;
  title: string;
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  milestones: Milestone[];
}

export default function CreatePaymentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'payhere' | 'wallet'>('stripe');
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [autoRelease, setAutoRelease] = useState<boolean>(true);
  const [autoReleaseDays, setAutoReleaseDays] = useState<number>(7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadContracts();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadContracts = async () => {
    try {
      // This would typically come from a contracts service
      // For now, using mock data
      const mockContracts: Contract[] = [
        {
          id: '1',
          title: 'Website Development Project',
          freelancer: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            rating: 4.8
          },
          milestones: [
            {
              id: '1',
              title: 'Design Phase',
              description: 'Complete UI/UX design and mockups',
              amount: 500,
              status: 'completed',
              completedAt: '2024-01-15'
            },
            {
              id: '2',
              title: 'Development Phase',
              description: 'Implement frontend and backend',
              amount: 1500,
              status: 'approved',
              completedAt: '2024-01-20'
            }
          ]
        }
      ];
      setContracts(mockContracts);
    } catch (error) {
      console.error('Failed to load contracts:', error);
      setError('Failed to load contracts');
    }
  };

  const calculatePlatformFee = (amount: number) => {
    return amount * 0.05; // 5% platform fee
  };

  const calculateNetAmount = (milestoneAmount: number, bonus: number) => {
    const total = milestoneAmount + bonus;
    const fee = calculatePlatformFee(total);
    return total - fee;
  };

  const handleCreatePayment = async () => {
    if (!selectedContract || !selectedMilestone) return;

    setIsLoading(true);
    setError(null);

    try {
      const totalAmount = selectedMilestone.amount + bonusAmount;
      const paymentData: ICreatePaymentRequest = {
        contractId: selectedContract.id,
        milestoneId: selectedMilestone.id,
        amount: totalAmount,
        currency: 'USD',
        paymentMethod,
        autoRelease,
        autoReleaseDays: autoRelease ? autoReleaseDays : undefined,
      };

      const response = await paymentsService.createPayment(paymentData);
      const paymentIntent = (response as any).data || response;

      // Redirect to payment confirmation
      router.push(`/client/payments/confirm/${paymentIntent.id}`);
    } catch (error) {
      console.error('Failed to create payment:', error);
      setError('Failed to create payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableMilestones = selectedContract?.milestones.filter(m => m.status === 'approved') || [];

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Payment</h1>
          <p className="text-gray-600">Pay for completed milestones and release funds to freelancers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Contract</h2>
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    onClick={() => setSelectedContract(contract)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedContract?.id === contract.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{contract.title}</h3>
                        <p className="text-gray-600 text-sm">
                          Freelancer: {contract.freelancer.firstName} {contract.freelancer.lastName}
                          {contract.freelancer.rating && (
                            <span className="ml-2 text-yellow-600">★ {contract.freelancer.rating}</span>
                          )}
                        </p>
                      </div>
                      <CheckCircle
                        className={`h-5 w-5 ${
                          selectedContract?.id === contract.id ? 'text-green-500' : 'text-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Milestone Selection */}
            {selectedContract && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Milestone</h2>
                <div className="space-y-3">
                  {availableMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      onClick={() => setSelectedMilestone(milestone)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMilestone?.id === milestone.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              ${milestone.amount}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Completed {milestone.completedAt ? new Date(milestone.completedAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                        </div>
                        <CheckCircle
                          className={`h-5 w-5 ml-4 ${
                            selectedMilestone?.id === milestone.id ? 'text-green-500' : 'text-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Payment Details */}
            {selectedMilestone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>

                <div className="space-y-4">
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'stripe', name: 'Stripe', icon: CreditCard },
                        { id: 'payhere', name: 'PayHere', icon: Shield },
                        { id: 'wallet', name: 'Wallet', icon: DollarSign }
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            paymentMethod === method.id
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <method.icon className="h-6 w-6 mx-auto mb-2" />
                          <span className="text-sm font-medium">{method.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bonus Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bonus Amount (Optional)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={bonusAmount}
                        onChange={(e) => setBonusAmount(Number(e.target.value))}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Auto Release Settings */}
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
                </div>
              </motion.div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            {selectedMilestone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Milestone Amount:</span>
                    <span className="font-medium">${selectedMilestone.amount}</span>
                  </div>
                  {bonusAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bonus:</span>
                      <span className="font-medium text-green-600">+${bonusAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (5%):</span>
                    <span className="font-medium text-red-600">
                      -${calculatePlatformFee(selectedMilestone.amount + bonusAmount).toFixed(2)}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Net to Freelancer:</span>
                    <span className="text-green-600">
                      ${calculateNetAmount(selectedMilestone.amount, bonusAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Escrow Protection</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Funds will be held in escrow until {autoRelease ? `${autoReleaseDays} days after approval` : 'manual release'}.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreatePayment}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Create Payment
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
