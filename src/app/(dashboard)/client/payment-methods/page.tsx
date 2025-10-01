'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { PaymentMethodCard } from '@/components/features/payments/PaymentMethodCard';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';
import Button from '@/components/ui/Button';
import { PlusCircle, CreditCard, AlertCircle } from 'lucide-react';

const PaymentMethodsPage: React.FC = () => {
  const router = useRouter();
  const {
    paymentMethods,
    defaultPaymentMethodId,
    isLoading,
    error,
    refetch,
    setDefaultMethod,
    deleteMethod
  } = usePaymentMethods();

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleSetDefault = async (paymentMethodId: string) => {
    setActionLoading(paymentMethodId);
    try {
      await setDefaultMethod(paymentMethodId);
      await refetch();
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    setActionLoading(paymentMethodId);
    try {
      await deleteMethod(paymentMethodId);
      await refetch();
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddNew = () => {
    router.push('/(dashboard)/client/payment-methods/add');
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
            <p className="mt-2 text-gray-600">
              Manage your saved payment methods for quick and secure transactions.
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            className="flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Payment Method
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Payment Methods List */}
        {paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                isDefault={method.id === defaultPaymentMethodId}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
                isLoading={actionLoading === method.id}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <CreditCard className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No payment methods yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Add a payment method to make payments quickly and securely. Your card information is encrypted and stored safely.
            </p>
            <Button onClick={handleAddNew} className="flex items-center mx-auto">
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Your First Payment Method
            </Button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Your payment information is secure
              </h4>
              <p className="text-sm text-blue-800">
                We use Stripe to securely store your payment methods. Your card details are encrypted and never stored on our servers. You can remove payment methods at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentMethodsPage;