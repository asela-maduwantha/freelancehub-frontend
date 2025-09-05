'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Calculator,
  CreditCard,
  Shield,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  FileText,
  User
} from 'lucide-react';
import Link from 'next/link';
import { paymentsService } from '@/lib/api/payments.service';
import { ICreatePaymentRequest, IPaymentIntent } from '@/lib/types';

interface BulkPaymentItem {
  id: string;
  contractId: string;
  milestoneId: string;
  title: string;
  description: string;
  amount: number;
  freelancer: {
    id: string;
    name: string;
  };
  selected: boolean;
}

interface Contract {
  id: string;
  title: string;
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    status: 'approved' | 'completed';
  }>;
}

export default function BulkPaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [bulkItems, setBulkItems] = useState<BulkPaymentItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'payhere' | 'wallet'>('stripe');
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
      // Mock data for demonstration
      const mockContracts: Contract[] = [
        {
          id: '1',
          title: 'Website Development Project',
          freelancer: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe'
          },
          milestones: [
            {
              id: '1',
              title: 'Design Phase',
              description: 'Complete UI/UX design and mockups',
              amount: 500,
              status: 'approved'
            },
            {
              id: '2',
              title: 'Development Phase',
              description: 'Implement frontend and backend',
              amount: 1500,
              status: 'approved'
            },
            {
              id: '3',
              title: 'Testing Phase',
              description: 'QA testing and bug fixes',
              amount: 300,
              status: 'approved'
            }
          ]
        },
        {
          id: '2',
          title: 'Mobile App Development',
          freelancer: {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith'
          },
          milestones: [
            {
              id: '4',
              title: 'UI Design',
              description: 'Mobile app design and prototyping',
              amount: 800,
              status: 'approved'
            },
            {
              id: '5',
              title: 'Development',
              description: 'iOS and Android development',
              amount: 2000,
              status: 'approved'
            }
          ]
        }
      ];
      setContracts(mockContracts);

      // Convert to bulk payment items
      const items: BulkPaymentItem[] = [];
      mockContracts.forEach(contract => {
        contract.milestones.forEach(milestone => {
          if (milestone.status === 'approved') {
            items.push({
              id: `${contract.id}-${milestone.id}`,
              contractId: contract.id,
              milestoneId: milestone.id,
              title: milestone.title,
              description: milestone.description,
              amount: milestone.amount,
              freelancer: {
                id: contract.freelancer.firstName + contract.freelancer.lastName,
                name: `${contract.freelancer.firstName} ${contract.freelancer.lastName}`
              },
              selected: false
            });
          }
        });
      });
      setBulkItems(items);
    } catch (error) {
      console.error('Failed to load contracts:', error);
      setError('Failed to load contracts');
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setBulkItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAllItems = () => {
    setBulkItems(items =>
      items.map(item => ({ ...item, selected: true }))
    );
  };

  const deselectAllItems = () => {
    setBulkItems(items =>
      items.map(item => ({ ...item, selected: false }))
    );
  };

  const removeSelectedItems = () => {
    setBulkItems(items => items.filter(item => !item.selected));
  };

  const selectedItems = bulkItems.filter(item => item.selected);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.amount, 0);
  const platformFee = totalAmount * 0.05;
  const netAmount = totalAmount - platformFee;

  const handleBulkPayment = async () => {
    if (selectedItems.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create individual payments for each selected item
      const paymentPromises = selectedItems.map(item => {
        const paymentData: ICreatePaymentRequest = {
          contractId: item.contractId,
          milestoneId: item.milestoneId,
          amount: item.amount,
          currency: 'USD',
          paymentMethod,
          autoRelease,
          autoReleaseDays: autoRelease ? autoReleaseDays : undefined,
        };
        return paymentsService.createPayment(paymentData);
      });

      const results = await Promise.all(paymentPromises);

      // Redirect to first payment confirmation
      const firstPayment = results[0] as any;
      router.push(`/client/payments/confirm/${firstPayment.data?.id || firstPayment.id}`);
    } catch (error) {
      console.error('Failed to create bulk payments:', error);
      setError('Failed to create bulk payments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Payments</h1>
          <p className="text-gray-600">Pay multiple milestones at once to streamline your workflow</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Milestones List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Available Milestones</h2>
                  <div className="flex space-x-2">
                    <Button
                      onClick={selectAllItems}
                      variant="outline"
                      size="sm"
                    >
                      Select All
                    </Button>
                    <Button
                      onClick={deselectAllItems}
                      variant="outline"
                      size="sm"
                    >
                      Deselect All
                    </Button>
                    {selectedItems.length > 0 && (
                      <Button
                        onClick={removeSelectedItems}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove Selected
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {bulkItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      item.selected ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-1" />
                          <span>{item.freelancer.name}</span>
                        </div>
                      </div>

                      {item.selected && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {bulkItems.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Milestones</h3>
                  <p className="text-gray-600">All milestones have been paid or none are approved yet.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            {selectedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Payment Summary ({selectedItems.length} items)
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Milestone Amount:</span>
                    <span className="font-medium">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (5%):</span>
                    <span className="font-medium text-red-600">+{formatCurrency(platformFee)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">{formatCurrency(totalAmount + platformFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Net to Freelancers:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(netAmount)}</span>
                  </div>
                </div>

                {/* Payment Settings */}
                <div className="space-y-4 mb-6">
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
                      <option value="payhere">PayHere</option>
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
                </div>

                {/* Security Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Bulk Payment Notice</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Each payment will be processed individually with escrow protection.
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
                  onClick={handleBulkPayment}
                  disabled={isLoading || selectedItems.length === 0}
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
                      Pay {selectedItems.length} Milestone{selectedItems.length > 1 ? 's' : ''}
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
