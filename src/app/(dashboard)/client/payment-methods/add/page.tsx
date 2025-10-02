'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, STRIPE_CONFIG } from '@/lib/stripe';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { AddPaymentMethodForm } from '@/components/features/payments/AddPaymentMethodForm';
import { RootState } from '@/store';
import { addPaymentMethod, fetchPaymentMethods } from '@/store/slices/payments';
import { AppDispatch } from '@/store';

const AddPaymentMethodPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { contractCreationFlow } = useSelector((state: RootState) => state.payments);

  const handleSuccess = async (paymentMethodId: string) => {
    setIsSubmitting(true);
    try {
      // Refetch payment methods to get the newly added card
      await dispatch(fetchPaymentMethods());
      
      // If we're in a contract creation flow, go back to payment selection
      if (contractCreationFlow) {
        router.push('/client/payment-methods/select');
      } else {
        // Otherwise, go to the payment methods list
        router.push('/client/payment-methods');
      }
    } catch (error) {
      console.error('Failed to refresh payment methods:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleError = (error: string) => {
    // Error is displayed in the form component
    console.error('Payment method error:', error);
  };

  const handleCancel = () => {
    // If we're in a contract creation flow, go back to payment selection
    if (contractCreationFlow) {
      router.push('/client/payment-methods/select');
    } else {
      router.push('/client/payment-methods');
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Add Payment Method</h1>
            <p className="text-secondary">
              Add a new credit or debit card to your account
            </p>
          </div>
          
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