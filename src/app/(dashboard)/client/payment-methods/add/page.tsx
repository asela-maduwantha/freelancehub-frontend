'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, STRIPE_CONFIG } from '@/lib/stripe';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { AddPaymentMethodForm } from '@/components/features/payments/AddPaymentMethodForm';

const AddPaymentMethodPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = async (paymentMethodId: string) => {
    setIsSubmitting(true);
    try {
      // Here you would typically save the payment method to your backend
      // For now, we'll just redirect back to the payment methods list
      router.push('/(dashboard)/client/payment-methods');
    } catch (error) {
      console.error('Failed to save payment method:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (error: string) => {
    // Error is displayed in the form component
    console.error('Payment method error:', error);
  };

  const handleCancel = () => {
    router.push('/(dashboard)/client/payment-methods');
  };

  return (
    <DashboardLayout userRole="client">
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Elements stripe={stripePromise} options={STRIPE_CONFIG.elementsOptions}>
            <AddPaymentMethodForm
              onSuccess={handleSuccess}
              onError={handleError}
              onCancel={handleCancel}
            />
          </Elements>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddPaymentMethodPage;